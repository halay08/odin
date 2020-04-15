import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

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

        const orders = await pg.query(
            `SELECT db_records.id
            FROM db_records
            RIGHT JOIN schemas as s ON (db_records.schema_id = s.id)
            LEFT JOIN pipelines_stages ON (db_records.stage_id = pipelines_stages.id)
            WHERE s.entity_name = 'Order' AND db_records.deleted_at IS NULL AND pipelines_stages.key IN ('OrderStageActive')`);


        const ontsUp = [];
        const ontsDown = [];

        const failedStatusCheck = [];
        const orderItemNoOnt = [];
        const orderItemNoItems = [];

        console.log('orders', orders.length);

        for(const record of orders) {

            // Get the order item w/ product
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/OrderItem/${record.id}?entities=["OrderItem"]`,
                apiToken,
            );
            const order = orderRes['data'];


            const orderOrderItem = order['OrderItem'].dbRecords;

            if(orderOrderItem) {

                const baseItem = orderOrderItem.find(elem => {
                    return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                        getProperty(elem, 'ProductType') === 'BASE_PRODUCT'
                });

                if(baseItem) {
                    // Get the order item w/ product
                    const orderItemRes = await httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/db/OrderItem/${baseItem.id}?entities=["CustomerDeviceOnt"]`,
                        apiToken,
                    );
                    const orderItem = orderItemRes['data'];
                    const orderItemOnt = orderItem['CustomerDeviceOnt'].dbRecords;

                    if(orderItemOnt) {
                        // do a check status of the olt on port and onuId
                        const ontStatusCheckRes = await httpClient.postRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                            `v1.0/network/adtranont/data/${orderItem.id}/check`,
                            apiToken,
                            {},
                        );

                        const statusCheck = ontStatusCheckRes['data'];
                        console.log('statusCheck', statusCheck);

                        if(statusCheck) {
                            if(statusCheck['adminStatus'] === 'up' && statusCheck['operStatus'] === 'up') {
                                ontsUp.push(`${order.title}: ${orderItem.title}`);
                            } else {
                                ontsDown.push(`${order.title}: ${orderItem.title}`);
                            }
                        } else {
                            failedStatusCheck.push(`${order.title}: ${orderItem.title}`);
                        }
                    } else {
                        orderItemNoOnt.push(`${order.title}: ${orderItem.title}`);
                    }
                } else {
                    orderItemNoItems.push(`${order.recordNumber} ${order.title}`);
                }
            }
        }

        console.log({
            summary: {
                ontsUp: ontsUp.length,
                ontsDown: ontsDown.length,
                failedStatusCheck: failedStatusCheck.length,
                orderItemNoOnt: orderItemNoOnt.length,
            },
            ontsUp,
            ontsDown,
            failedStatusCheck,
            orderItemNoOnt,
            orderItemNoItems,
        });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
