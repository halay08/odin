import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const productionToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

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

        const queryStart = moment().utc().startOf('day').format('YYYY-MM-DD');
        console.log('queryStart', queryStart);
        // Count # of months since order billing start date
        // Count # of invoices for the order
        // Check that the total orders = total invoices
        const records = await pg.query(
            `SELECT dbrc.record_id, dbrc.value as billing_start_date \
            FROM schemas_columns sc \
            RIGHT JOIN schemas as s ON (sc.schema_id = s.id)
            RIGHT JOIN db_records_columns dbrc ON (sc.id = dbrc.column_id AND sc.name = 'BillingStartDate') \
            WHERE s.entity_name = 'Order' AND dbrc.deleted_at IS NULL AND sc.name = 'BillingStartDate' AND dbrc.value::date < '${queryStart}'`);

        console.log('records', records.length);

        for(const record of records) {
            if(!!record.billing_start_date) {
                const orderRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/Order/${record.record_id}`,
                    productionToken,
                );
                const order = orderRes['data'];
                if(order && order.stage.key === 'OrderStageActive') {
                    const getOrderRes = await httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/db/Order/${record.record_id}?entities=["Invoice"]`,
                        productionToken,
                    );
                    const order = getOrderRes['data'];

                    let invoices = order['Invoice'].dbRecords;
                    if(invoices) {
                        invoices = invoices.filter(elem => getProperty(elem, 'Status') !== 'VOID');

                        const diffBillingStartToday = moment().utc().diff(
                            moment(getProperty(order, 'BillingStartDate'), 'YYYY-MM-DD').format('YYYY-MM-DD'),
                            'months',
                        );

                        // console.log('invoiceCount', invoices.length);
                        // console.log('diff from billing start', diffBillingStartToday);

                    }
                    if(!invoices) {
                        // get diff from billingStart date to orderItem nextBillingDate
                        // get diff from billingStart to today
                        console.log('NO INVOICES', order.title, getProperty(order, 'BillingStartDate'));
                        // If no invoices and order is active, assign order to a user and flag with an issue.
                    }
                }
            }
        }
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
