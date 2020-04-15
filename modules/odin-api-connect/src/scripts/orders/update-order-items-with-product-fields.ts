import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getFirstRelation, getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;
const apiBaseUrl = process.env.K8_BASE_URL;

const priceBookId = '860fa9a3-39f4-4d8a-9091-62034071b3ee';

// this script can run every 10 minutes
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

        const orderItems = await pg.query(
            `SELECT r.id, a.related_association_id
            FROM db_records r
            LEFT JOIN db_records_associations a ON (a.parent_record_id = r.id)
            WHERE r.entity = 'OrderModule:OrderItem'
            AND a.child_entity = 'ProductModule:Product'
            AND EXISTS (
                SELECT * FROM db_records_associations a2 WHERE
                a2.id = a.related_association_id
                AND a2.parent_entity = 'ProductModule:PriceBook'
                AND a2.parent_record_id = '${priceBookId}'
            )
            AND r.deleted_at IS NULL`);

        const missingProducts = [];
        console.log(orderItems);
        for(const record of orderItems) {

            // Get the order item w/ product
            const orderItemRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/OrderItem/${record.id}?entities=["Order", "Product"]`,
                apiToken,
            );
            const orderItem = orderItemRes['data'];
            const orderItemOrder = getFirstRelation(orderItem, 'Order');
            const orderItemProduct = orderItem['Product'].dbRecords;


            if(orderItemProduct && orderItemOrder) {

                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `OrderModule:OrderItem`;
                updateDto.title = getProperty(orderItemProduct[0], 'DisplayName') || orderItemProduct[0].title;
                updateDto.properties = {
                    UnitPrice: getProperty(orderItemProduct[0], 'UnitPrice'),
                    DiscountValue: getProperty(orderItemProduct[0], 'DiscountValue'),
                    DiscountType: getProperty(orderItemProduct[0], 'DiscountType'),
                };

                const updateRes = await httpClient.putRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/OrderItem/${orderItem.id}`,
                    apiToken,
                    updateDto,
                );
                console.log('updateRes', updateRes);

                const orderUpdateRes = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/orders/${orderItemOrder.id}/calculate`,
                    apiToken,
                    {},
                );
                console.log('orderUpdateRes', orderUpdateRes);

            } else {
                console.log('MISSING PRODUCT OR ORDER', orderItemProduct);
                missingProducts.push({ id: orderItem.id, title: orderItem.title });
            }
        }

        console.log('missingProducts', missingProducts);
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
