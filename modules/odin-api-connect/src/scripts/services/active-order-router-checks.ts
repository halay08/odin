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

        const routerInvalidSerial = [];
        const orderItemNoRouter = [];
        const orderItemNoItems = [];

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

                    if(orderItemRouter) {
                        // // get the router details if 404 flag for serialNumber check
                        // const serial = getProperty(orderItemRouter[0], 'SerialNumber');
                        // const routerCheckRes = await httpClient.getRequest(
                        //      Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                        //     `v1.0/network/eero/eeros/${serial}`,
                        //     apiToken,
                        // );
                        // const routerCheck = routerCheckRes['data'];
                        // console.log('routerCheck', routerCheck);
                        //
                        // if(routerCheck && routerCheck['network']) {
                        //     console.log('router_check_success');
                        // } else {
                        //     routerInvalidSerial.push(`${order.title}: ${orderItem.title}: ${serial}`);
                        // }
                    } else {
                        orderItemNoRouter.push(`${order.title}: ${orderItem.title}`);
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
                        // // get the router details if 404 flag for serialNumber check
                        // const serial = getProperty(orderItemRouter[0], 'SerialNumber');
                        // const routerCheckRes = await httpClient.getRequest(
                        //      Utilities.getBaseUrl(SERVICE_NAME.SERVICE_MODULE),
                        //     `v1.0/network/eero/eeros/${serial}`,
                        //     apiToken,
                        // );
                        // const routerCheck = routerCheckRes['data'];
                        // console.log('routerCheck', routerCheck);
                        //
                        // if(routerCheck && routerCheck['network']) {
                        //     console.log('router_check_success');
                        // } else {
                        //     routerInvalidSerial.push(`${order.title}: ${orderItem.title}: ${serial}`);
                        // }
                    } else {
                        orderItemNoRouter.push(`${order.title}: ${orderItem.title}`);
                    }
                }
            } else {
                orderItemNoItems.push(`${order.recordNumber} ${order.title}`);
            }
        }

        console.log({
            summary: {
                routerInvalidSerial: routerInvalidSerial.length,
                orderItemNoRouter: orderItemNoRouter.length,
            },
            routerInvalidSerial,
            orderItemNoRouter,
            orderItemNoItems,
        });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
