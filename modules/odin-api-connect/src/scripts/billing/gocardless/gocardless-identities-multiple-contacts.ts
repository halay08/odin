import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const productionToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

// Run this every minute
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
            `SELECT record_id FROM db_records_columns WHERE value = 'GOCARDLESS' AND column_name = 'Name' AND deleted_at IS NULL`);

        console.log('records', records.length);
        for(const record of records) {

            const getRes = await httpClient.getRequest(
                baseUrl,
                `CrmModule/v1.0/db/ContactIdentity/${record.record_id}?entities=["Contact"]`,
                productionToken,
            );

            console.log('getRes', getRes);

            const identity = getRes['data'];
            const contacts = identity['Contact'].dbRecords;

            if(contacts && contacts.length > 1) {
                console.log('MORE_THAN_1_CONTACT', identity);
            }

        }
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
