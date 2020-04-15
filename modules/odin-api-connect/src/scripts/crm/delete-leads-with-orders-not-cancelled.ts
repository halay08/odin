import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

class DataRow {
    leadId: string;
    title: string;
    stageName: string;
    salesStatus: string;
    emailAddress: string;
    type: string;
    product: string;
    createdAt: string;
}

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
            WHERE schema.entity_name = 'Lead' AND db_records.deleted_at IS NULL;`);

        let deletes = 0;
        for(const record of records) {
            const response = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                `v1.0/db/Lead/${record.id}?entities=["Address"]`,
                apiToken,
            );

            const lead = response['data'];
            const address = lead['Address'].dbRecords;

            if(address) {
                const addressRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                    `v1.0/db/Address/${address[0].id}?entities=["Order"]`,
                    apiToken,
                );

                const orders = addressRes['data']['Order'].dbRecords;

                console.log('orders', orders);

                if(orders) {
                    for(const order of orders) {
                        if(![ 'OrderStageCancelled' ].includes(order.stage.key)) {
                            console.log('delete the lead', lead);
                            deletes += 1;
                            const deleteRes = await httpClient.deleteRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                                `v1.0/db/Lead/${lead.id}`,
                                apiToken,
                            );
                            console.log('deleteRes', deleteRes);
                        }
                    }
                }
            }
        }

        console.log('deletes', deletes);

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
