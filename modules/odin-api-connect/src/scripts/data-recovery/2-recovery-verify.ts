import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { verifyData } from './verify-data';

dotenv.config({ path: '../../../.env' });

const createdQuery = (tableName: string) => `select * from ${tableName} where created_at > '2020-11-12';`;
const updatedQuery = (tableName: string) => `select * from ${tableName} where created_at < '2020-11-12' AND updated_at > '2020-11-12';`;


async function sync() {
    try {

        const step1 = await verifyData(createdQuery('db_records'), 'db_records');
        const step2 = await verifyData(updatedQuery('db_records'), 'db_records');

        const step3 = await verifyData(createdQuery('db_records_columns'), 'db_records_columns');
        const step4 = await verifyData(updatedQuery('db_records_columns'), 'db_records_columns');

        const step5 = await verifyData(createdQuery('db_records_associations'), 'db_records_associations');
        const step6 = await verifyData(updatedQuery('db_records_associations'), 'db_records_associations');

        const step7 = await verifyData(createdQuery('logs.user_activity'), 'logs.user_activity');

        const step8 = await verifyData(createdQuery('gocardless.events'), 'gocardless.events');
        const step9 = await verifyData(updatedQuery('gocardless.events'), 'gocardless.events');

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
