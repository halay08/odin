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
            `
            select r.id, r1.title, c3.value as next_invoice_date
            from db_records r
            left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'TotalPrice')
            left join db_records_columns c3 on (r.id = c3.record_id and c3.column_name = 'NextInvoiceDate')
            left join db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
            left join db_records r1 on (r1.id = a.parent_record_id)
            left join pipelines_stages s on (r1.stage_id = s.id)
            where r.entity = 'OrderModule:OrderItem'
            and s.key = 'OrderStageActive'
            and TO_TIMESTAMP(c3.value, 'YYYY-MM-DD') <= now() - INTERVAL '1 DAYS'
            and TO_TIMESTAMP(c3.value, 'YYYY-MM-DD') >= now() - INTERVAL '60 days'
            group by r.id, r1.title, c3.value
            order by c3.value asc`);

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
