import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// Run this at 1:00 am UTC daily
async function sync() {
    try {
        const httpClient = new BaseHttpClient();

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        const serverDate = moment().utc().format('YYYY-MM-DD');
        const previousDay = moment().utc().subtract(1, 'days').startOf('day').format('YYYY-MM-DD');
        const currentDay = moment().utc().startOf('day').format('YYYY-MM-DD');
        console.log('serverDate', serverDate);
        console.log('previousDay', previousDay);
        console.log('currentDay', currentDay);

        // Get all records with a next billing date in 10 days
        const recurringItems = await pg.query(
            `SELECT dbrc.record_id \
            FROM schemas_columns sc \
            RIGHT JOIN schemas as s ON (sc.schema_id = s.id) \
            RIGHT JOIN db_records_columns AS dbrc ON (sc.id = dbrc.column_id) \
            RIGHT JOIN db_records_associations AS order_association on (order_association.child_record_id = dbrc.record_id) \
            RIGHT JOIN db_records AS order_record on (order_association.parent_record_id = order_record.id) \
            RIGHT JOIN pipelines_stages AS order_stage on (order_record.stage_id = order_stage.id) \
            WHERE s.entity_name = 'OrderItem' \
            AND dbrc.deleted_at IS NULL \
            AND order_stage.key = 'OrderStageActive' \
            AND sc.name = 'BillingStartDate' \
            AND dbrc.value IN ('${previousDay}', '${currentDay}') \
            GROUP BY dbrc.record_id, dbrc.value`);


        let items = {};
        // Create an array of orderItems
        for(const record of [ ...recurringItems ]) {
            // get the order items order
            const order = await pg.query(
                `SELECT parent_record_id \
            FROM db_records_associations dbra \
            RIGHT JOIN schemas as s ON (dbra.parent_schema_id = s.id)
            WHERE s.entity_name = 'Order' AND child_record_id = '${record.record_id}'`);

            if(items[order[0].parent_record_id]) {
                const association = new DbRecordAssociationCreateUpdateDto();
                association.recordId = record.record_id;

                items[order[0].parent_record_id] = [ ...items[order[0].parent_record_id], ...[ association ] ];
            } else {
                const association = new DbRecordAssociationCreateUpdateDto();
                association.recordId = record.record_id;

                items[order[0].parent_record_id] = [ ...[ association ] ];
            }
        }

        const invoiceIds = [];

        // Generate invoices from orders
        for(const orderIdKey of Object.keys(items)) {
            // TODO: these should be queued with RabbitMq

            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${orderIdKey}?entities=["Invoice"]`,
                apiToken,
            );
            // console.log('orderRes', orderRes);
            const order = orderRes['data'];

            console.log('order title', order.title);

            const invoices = order['Invoice'].dbRecords;

            // return an array of invoices that are not VOIDED
            const filteredInv = invoices ? invoices.filter(elem => getProperty(elem, 'Status') !== 'VOID') : [];

            console.log('filteredInv', filteredInv);

            if(order && order.stage.name.toLowerCase() === 'active') {
                // if there are no invoices
                if(filteredInv.length < 1) {

                    const processRes = await httpClient.postRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                        `v1.0/invoices/orders/${orderIdKey}`,
                        apiToken,
                        items[orderIdKey],
                    );

                    console.log('processRes', processRes);
                    const invoice = processRes['data'];

                    invoiceIds.push(invoice.id);
                } else if(filteredInv.length === 1) {
                    // Invoice already created, just needs to be emailed and processed
                    invoiceIds.push(filteredInv[0].id);
                }
            }
        }

        console.log('invoiceIds', invoiceIds);

        // Send invoice emails
        if(invoiceIds && invoiceIds.length > 0) {
            for(const invoiceId of invoiceIds) {
                const emailTemplate = 'SENDGRID_INVOICE_NEW';
                const emailRes = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                    `v1.0/invoices/${invoiceId}/email/${emailTemplate}`,
                    apiToken,
                    {},
                );
                console.log('emailRes', emailRes);
            }
        }

        // process invoice transactions
        if(invoiceIds && invoiceIds.length > 0) {
            for(const invoiceId of invoiceIds) {

                const invoiceRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/Order/${invoiceId}?entities=["Transaction"]`,
                    apiToken,
                );

                const invoice = invoiceRes['data'];
                const transactions = invoice['Transaction'].dbRecords;

                if(!transactions) {
                    // the due date is in 2 days and no transactions have been created
                    // process payment for the invoice
                    const transactionRes = await httpClient.postRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                        `v1.0/transactions/invoices/${invoiceId}`,
                        apiToken,
                        {},
                    );
                    const transaction = transactionRes['data'];
                    console.log('transaction', transaction);
                }
            }
        }

        return;

    } catch (e) {
        console.error(e);
    }
}

sync();
