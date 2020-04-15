import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

// this script can run every 10 minutes
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

        // Get work orders that are in Supply and have a Work order in Done
        const records = await pg.query(`select orders.id as id, orders.record_number as record_number, orders.title as title from db_records as orders LEFT JOIN schemas on (orders.schema_id = schemas.id)
            WHERE schemas.entity_name = 'Order'`);

        for(const record of records) {

            let recordNumber = record.record_number;

            if(!recordNumber) {
                console.log('order missing recordNumber', record.title, recordNumber);
            } else if(recordNumber.indexOf('-') > -1) {
                recordNumber = recordNumber.replace('-', '');
                console.log('split number', recordNumber);

                const update = await pg.query(`update db_records set record_number = '${recordNumber}' where id = '${record.id}'`);
                console.log('update', update);
            }
        }
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
