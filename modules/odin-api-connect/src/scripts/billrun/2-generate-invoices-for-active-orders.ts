import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { getAllRelations, getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import { sortDbRecordsByCreatedAtNewestFirst } from '../../helpers/utilities';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// Run this at 12:00 am UTC daily
async function sync() {
    try {

        // Command line arguments
        let argDryRun = process.argv.find(arg => arg.indexOf('dryrun') > -1);
        let dryRun = argDryRun ? argDryRun.split('=')[1] : null;

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
        const nextInvoiceDate = moment().utc().add(7, 'days').startOf('day').format('YYYY-MM-DD');
        console.log('serverDate', serverDate);
        console.log('nextInvoiceDate', nextInvoiceDate);

        // Next Invoice Date (should be each month)
        // Trial period end date
        // Discount period end date

        // Get all records with a next billing date in 7 days
        const recurringItems = await pg.query(
            `SELECT dbrc.record_id, dbrc.value as next_invoice_date \
            FROM schemas_columns sc \
            RIGHT JOIN schemas as s ON (sc.schema_id = s.id) \
            RIGHT JOIN db_records_columns dbrc ON (sc.id = dbrc.column_id AND sc.name = 'NextInvoiceDate') \
            LEFT JOIN db_records_associations as order_association on (order_association.child_record_id = dbrc.record_id) \
            LEFT JOIN db_records as order_record on (order_association.parent_record_id = order_record.id) \
            LEFT JOIN pipelines_stages as order_stage on (order_record.stage_id = order_stage.id) \
            WHERE s.entity_name = 'OrderItem' \
            AND dbrc.deleted_at IS NULL \
            AND order_stage.key = 'OrderStageActive' \
            AND sc.name = 'NextInvoiceDate' \
            AND dbrc.value = '${nextInvoiceDate}' \
            GROUP BY dbrc.record_id, dbrc.value`);

        // Add logic to group order items by Account
        // Add logic to generate an Invoice with all products from all the orders
        // and link all the orders that are on that Invoice.

        console.log('recurringItems', recurringItems);
        // process.exit(1);

        let items = {};
        for(const record of [ ...recurringItems ]) {
            console.log('record', record);
            // get the order items order
            const order = await pg.query(
                `SELECT parent_record_id \
            FROM db_records_associations dbra \
            RIGHT JOIN schemas as s ON (dbra.parent_schema_id = s.id)
            WHERE s.entity_name = 'Order'
            AND dbra.deleted_at IS NULL
            AND child_record_id = '${record.record_id}'`);

            // process.exit(1);
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

            console.log('get order')
            console.log(`v1.0/db/Order/${orderIdKey}?entities=["Invoice"]`)
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${orderIdKey}?entities=["Invoice"]`,
                apiToken,
            );
            // console.log('orderRes', orderRes);
            const order = orderRes['data'];
            const billingStartDate = getProperty(order, 'BillingStartDate');
            const invoices = getAllRelations(order, 'Invoice');
            const filteredInv = invoices ? invoices.filter(elem => getProperty(elem, 'Status') !== 'VOID') : [];
            const invoiceCount = filteredInv.length;

            const lastInvoice = sortDbRecordsByCreatedAtNewestFirst(invoices);

            const diffFromBillingStart = moment().utc().diff(billingStartDate, 'months');

            if(order && order.stage.name.toLowerCase() === 'active') {

                if(diffFromBillingStart + 1 >= invoiceCount) {

                    if(lastInvoice && getProperty(lastInvoice[0], 'Status') === 'SCHEDULED') {
                        console.log('-------INVOICE_RECENTLY_PROCESSED', lastInvoice[0].title)
                    } else {
                        // Create a new invoice
                        console.log(
                            'GENERATE_INVOICE: ',
                            order.title,
                            {
                                billingStartDate,
                                totalInvoiceCount: invoices ? invoices.length : 0,
                                invNotVoided: invoiceCount,
                                diffFromBillingStart: diffFromBillingStart + 1,
                            },
                        );
                        // if not a dry run process the invoice
                        if(!dryRun) {
                            const processRes = await httpClient.postRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                                `v1.0/invoices/orders/${orderIdKey}`,
                                apiToken,
                                items[orderIdKey],
                            );
                            console.log('processRes', processRes);
                            const invoice = processRes['data'];


                            invoiceIds.push(invoice.id);
                        }
                    }
                } else {
                    console.log('-------INVOICE_UP_TO_DATE', lastInvoice[0].title)
                }
            }
        }

        // if not a dry run send notifications
        if(!dryRun) {
            if(invoiceIds) {
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
        }
        return;
    } catch (e) {
        console.error(e);
    }
}

sync();
