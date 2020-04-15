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

        const gtOneOnt = [];
        const gtOneRouter = [];
        const missingOnt = [];
        const missingRouter = [];
        const addOnWithOnt = [];
        const voiceWithOnt = [];
        const voiceWithRouter = [];

        let baseBroadband = 0;
        let baseOnts = 0;
        let addOnYouMesh = 0;
        let primaryNodeRouter = 0;
        let youMeshRouter = 0

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

            const voiceItem = orderOrderItem.find(elem => {
                return getProperty(elem, 'ProductCategory') === 'VOICE'
            });

            const baseItem = orderOrderItem.find(elem => {
                return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                    getProperty(elem, 'ProductType') === 'BASE_PRODUCT'
            });

            const addOnItem = orderOrderItem.find(elem => {
                return getProperty(elem, 'ProductCategory') === 'BROADBAND' &&
                    getProperty(elem, 'ProductType') === 'ADD_ON_PRODUCT'
            });

            if(voiceItem) {
                // Get the order item w/ product
                const orderItemRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/OrderItem/${voiceItem.id}?entities=["CustomerDeviceOnt", "CustomerDeviceRouter"]`,
                    apiToken,
                );
                const orderItem = orderItemRes['data'];
                const orderItemOnt = orderItem['CustomerDeviceOnt'].dbRecords;
                const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;

                if(orderItemOnt) {
                    voiceWithOnt.push(`${order.title}: ${orderItem.title}`);
                }
                if(orderItemRouter) {
                    voiceWithRouter.push(`${order.title}: ${orderItem.title}: ${orderItemRouter[0].id}`);
                }
            }

            if(baseItem) {
                // Get the order item w/ product
                const orderItemRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/OrderItem/${baseItem.id}?entities=["CustomerDeviceOnt", "CustomerDeviceRouter"]`,
                    apiToken,
                );
                const orderItem = orderItemRes['data'];
                const orderItemOnt = orderItem['CustomerDeviceOnt'].dbRecords;
                const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;

                baseBroadband += 1;

                if(orderItemOnt) {
                    baseOnts += 1;
                }

                if(orderItemRouter) {
                    primaryNodeRouter += 1;
                }

                if(orderItemOnt && orderItemOnt.length > 1) {
                    gtOneOnt.push(`${order.title}: ${orderItem.title}`);
                }

                if(orderItemRouter && orderItemRouter.length > 1) {
                    gtOneRouter.push(`${order.title}: ${orderItem.title}`);
                }

                if(!orderItemOnt) {
                    missingOnt.push(`${order.title}: ${orderItem.title}`);
                }

                if(!orderItemRouter) {
                    missingRouter.push(`${order.title}: ${orderItem.title}`);
                }
            }

            if(addOnItem) {
                // Get the order item w/ product
                const orderItemRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/OrderItem/${addOnItem.id}?entities=["CustomerDeviceOnt", "CustomerDeviceRouter"]`,
                    apiToken,
                );

                const orderItem = orderItemRes['data'];
                const orderItemRouter = orderItem['CustomerDeviceRouter'].dbRecords;
                const orderItemOnt = orderItem['CustomerDeviceOnt'].dbRecords;

                addOnYouMesh += 1;

                if(orderItemRouter) {
                    youMeshRouter += 1;
                }

                if(orderItemOnt) {
                    addOnWithOnt.push(`${order.title}: ${orderItem.title}`);
                }

                if(!orderItemRouter) {
                    missingRouter.push(`${order.title}: ${orderItem.title}`);
                }

                if(orderItemRouter && orderItemRouter.length > 1) {
                    gtOneRouter.push(`${order.title}: ${orderItem.title}`);
                }
            }
        }

        console.log({
            summary: {
                baseBroadband,
                baseOnts,
                primaryNodeRouter,
                addOnYouMesh,
                youMeshRouter,
            },
            missingOnt,
            missingRouter,
            gtOneOnt,
            gtOneRouter,
            addOnWithOnt,
            voiceWithOnt,
            voiceWithRouter,
        });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
