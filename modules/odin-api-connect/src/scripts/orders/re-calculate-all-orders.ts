import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// Run this script every every day at midnight
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
            `SELECT orders.id, orders.title, orders.created_at
            FROM db_records as orders
            LEFT JOIN schemas on (orders.schema_id = schemas.id)
            LEFT JOIN pipelines_stages ON (pipelines_stages.id = orders.stage_id)
            WHERE schemas.entity_name = 'Order'
            AND orders.deleted_at IS NULL
            ORDER BY orders.created_at ASC
           `);

        console.log('records', records.length);

        for(const record of records) {
            console.log('record.title', record.title, 'created', record.created_at);
            const updateRes = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/orders/${record.id}/calculate`,
                apiToken,
                {},
            );

            console.log('updateRes', updateRes);

        }

        return 'done';
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
