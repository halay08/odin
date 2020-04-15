import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;
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

        const records = await pg.query(
            `SELECT r.id
            FROM db_records r
            RIGHT JOIN pipelines_stages as s ON (r.stage_id = s.id)
            WHERE r.entity = 'FieldServiceModule:WorkOrder'
            AND r.deleted_at IS NULL
            AND s.key = 'WorkOrderStageAccepted'`);

        console.log('records', records.length);

        for(const record of records) {
            const workOrderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.FIELD_SERVICE_MODULE),
                `v1.0/db/WorkOrder/${record.id}?entities=["Order"]`,
                apiToken,
            );

            const workOrder = workOrderRes['data'];
            const workOrderOrders = workOrder['Order'].dbRecords;

            if(workOrderOrders && workOrder) {

                if(getProperty(workOrder, 'Type') === 'INSTALL') {
                    for(const order of workOrderOrders) {

                        if(order.stage.key === 'OrderStageCancelled') {
                            console.log('ORDER_STAGE_CANCELLED', order.title);

                            const stageRes = await httpClient.getRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                                `v1.0/stages/byKey/WorkOrderStageCancelled`,
                                apiToken,
                            );

                            const stage = stageRes['data'];

                            console.log('stage', stage);

                            if(stage) {
                                const update = await pg.query(`UPDATE db_records set stage_id = '${stage.id}' WHERE id = '${record.id}'`);

                                console.log('update', update);
                            }


                        } else if(order.stage.key === 'OrderStageActive') {

                            console.log('ORDER_STAGE_ACTIVE', order.title);

                            const stageRes = await httpClient.getRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                                `v1.0/stages/byKey/WorkOrderStageDone`,
                                apiToken,
                            );

                            const stage = stageRes['data'];

                            console.log('stage', stage);

                            if(stage) {
                                const update = await pg.query(`UPDATE db_records set stage_id = '${stage.id}' WHERE id = '${record.id}'`);

                                console.log('update', update);
                            }

                        }
                    }
                }
            } else {
                console.log('no order linked to work order', workOrder.title, workOrder.id);
            }
        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
