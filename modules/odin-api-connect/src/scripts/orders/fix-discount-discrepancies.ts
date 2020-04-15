import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
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
            `SELECT db_records.id as record_id
            FROM db_records
            WHERE entity = 'OrderModule:Order' AND deleted_at IS NULL`);

        console.log('records', records.length);


        for(const record of records) {
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.record_id}?entities=["Discount"]`,
                productionToken,
            );
            const order = orderRes['data'];
            const discount = order['Discount'].dbRecords;

            console.log('order', order.id);

            if(discount) {
                const discountValue = getProperty(order, 'DiscountValue');
                console.log('discountValue', discountValue);
                if(Number(discountValue) < 1) {

                    console.log('discountValue', discountValue);

                    const update: DbRecordCreateUpdateDto = {
                        entity: `OrderModule:Order`,
                        properties: {
                            DiscountValue: discount[0].properties['DiscountValue'],
                            DiscountType: discount[0].properties['DiscountType'],
                            DiscountUnit: discount[0].properties['DiscountUnit'],
                            DiscountLength: discount[0].properties['DiscountLength'],
                            TrialUnit: discount[0].properties['TrialUnit'],
                            TrialLength: discount[0].properties['TrialLength'],
                        },
                    };

                    console.log('update', update);

                    const updateRes = await httpClient.putRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/db/Order/${order.id}`,
                        productionToken,
                        update,
                    );

                    console.log('updateRes', updateRes);

                    const calculateRes = await httpClient.postRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/orders/${order.id}/calculate`,
                        productionToken,
                        {},
                    );
                    console.log('calculateRes', calculateRes);
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
