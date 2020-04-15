import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

const productionToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

// Run this daily to clean up records that have been soft deleted in the last 15 days
async function sync() {
    try {

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const queryStart = moment().utc().subtract(15, 'days').startOf('day').format('YYYY-MM-DD');
        console.log('queryStart', queryStart);
        // Get all records with a deleted_at <= the last 15 days
        const softDeletedDbRecords = await pg.query(`DELETE FROM db_records WHERE deleted_at <= '${queryStart}' AND deleted_at IS NOT NULL`);
        const softDeletedDbRecordColumns = await pg.query(`DELETE FROM db_records_columns WHERE deleted_at <= '${queryStart}' AND deleted_at IS NOT NULL`);
        const softDeletedDbRecordAssociations = await pg.query(`DELETE FROM db_records_columns WHERE deleted_at <= '${queryStart}' AND deleted_at IS NOT NULL`);

        console.log('softDeletedDbRecords', softDeletedDbRecords);
        console.log('softDeletedDbRecordColumns', softDeletedDbRecordColumns);
        console.log('softDeletedDbRecordAssociations', softDeletedDbRecordAssociations);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
