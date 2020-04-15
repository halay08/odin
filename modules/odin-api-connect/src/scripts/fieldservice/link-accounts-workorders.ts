import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
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
            `SELECT db_records.id
            FROM db_records
            RIGHT JOIN schemas as schema ON (db_records.schema_id = schema.id)
            WHERE schema.entity_name = 'WorkOrder' AND db_records.deleted_at IS NULL;`);


        for(const record of records) {
            const workOrderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.FIELD_SERVICE_MODULE),
                `v1.0/db/WorkOrder/${record.id}?entities=["Order"]`,
                apiToken,
            );
            const workOrder = workOrderRes['data'];
            const workOrderOrder = workOrder['Order'].dbRecords;

            if(workOrderOrder) {

                const orderRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/db/Order/${workOrderOrder[0].id}?entities=["Account"]`,
                    apiToken,
                );
                const order = orderRes['data'];
                const orderAccount = order['Account'].dbRecords;

                const newFeatureAssociation = new DbRecordAssociationCreateUpdateDto();

                newFeatureAssociation.recordId = orderAccount[0].id;

                const newAssociation = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.FIELD_SERVICE_MODULE),
                    `v1.0/db-associations/WorkOrder/${workOrder.id}`,
                    apiToken,
                    [ newFeatureAssociation ],
                );

                console.log('newAssociation', newAssociation);
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
