import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
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

        const invalidRouterSerial = [];
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

                const addOnItem = orderOrderItem.find(elem => {
                    return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                        getProperty(elem, 'ProductType') === 'ADD_ON_PRODUCT'
                });

                if(baseItem) {
                    // Get the order item w/ product
                    const orderItemRes = await httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/db/OrderItem/${baseItem.id}?entities=["CustomerDeviceRouter"]`,
                        apiToken,
                    );
                    const orderItem = orderItemRes['data'];
                    const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;
                    // update the router serialNumber

                    if(orderItemRouter) {
                        // remove the dashes
                        let serialNumber = getProperty(orderItemRouter[0], 'SerialNumber');

                        if(serialNumber.includes('-')) {
                            serialNumber = serialNumber ? serialNumber.replace(/-/g, '') : serialNumber;
                            serialNumber = serialNumber ? serialNumber.replace(' ', '') : serialNumber;
                            serialNumber = serialNumber ? serialNumber.trim() : serialNumber;

                            if(serialNumber && serialNumber.length < 16 || serialNumber.length > 16) {
                                invalidRouterSerial.push(`${orderItemRouter[0].id}: ${serialNumber}`);
                            }

                            const update = new DbRecordCreateUpdateDto();
                            update.entity = 'ServiceModule:CustomerDeviceRouter';
                            update.properties = {
                                SerialNumber: serialNumber,
                            };
                            console.log('update', update);
                            const updateRes = await
                                httpClient.putRequest(
                                    Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                    `v1.0/db/CustomerDeviceRouter/${orderItemRouter[0].id}`,
                                    apiToken,
                                    update,
                                );
                            console.log('updateRes', updateRes['data']);
                        }
                    }
                }

                if(addOnItem) {
                    // Get the order item w/ product
                    const orderItemRes = await httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                        `v1.0/db/OrderItem/${addOnItem.id}?entities=["CustomerDeviceRouter"]`,
                        apiToken,
                    );

                    const orderItem = orderItemRes['data'];
                    const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;

                    if(orderItemRouter) {
                        //clean serial
                        let serialNumber = getProperty(orderItemRouter[0], 'SerialNumber');

                        if(serialNumber.includes('-')) {
                            serialNumber = serialNumber ? serialNumber.replace(/-/g, '') : serialNumber;
                            serialNumber = serialNumber ? serialNumber.replace(' ', '') : serialNumber;
                            serialNumber = serialNumber ? serialNumber.trim() : serialNumber;

                            if(serialNumber && serialNumber.length < 16 || serialNumber.length > 16) {
                                invalidRouterSerial.push(`${orderItemRouter[0].id}: ${serialNumber}`);
                            }

                            const update = new DbRecordCreateUpdateDto();
                            update.entity = 'ServiceModule:CustomerDeviceRouter';
                            update.properties = {
                                SerialNumber: serialNumber,
                            };
                            console.log('update', update);
                            console.log('update', update);
                            const updateRes = await
                                httpClient.putRequest(
                                    Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                                    `v1.0/db/CustomerDeviceRouter/${orderItemRouter[0].id}`,
                                    apiToken,
                                    update,
                                );
                            console.log('updateRes', updateRes['data']);
                        }
                    }


                }
            } else {
                orderItemNoItems.push(`${order.recordNumber} ${order.title}`);
            }
        }

        console.log({
            invalidRouterSerial,
            orderItemNoItems,
        });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
