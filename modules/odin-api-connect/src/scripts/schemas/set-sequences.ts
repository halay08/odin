import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

async function sync() {

    try {

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            entities: [],
        });

        const schemas = await pg.query('SELECT id, is_sequential, record_number FROM schemas');

        for(const schema of schemas) {
            if(schema.is_sequential) {
                const sequenceName = `${schema.id}_seq`;
                await pg.query(`DROP SEQUENCE IF EXISTS "${sequenceName}"`);
            }
        }

        for(const schema of schemas) {
            if(schema.is_sequential) {
                const sequenceName = `${schema.id}_seq`;
                await pg.query(`CREATE SEQUENCE IF NOT EXISTS "${sequenceName}" START ${schema.record_number || 1} MAXVALUE 1000000000000`);
            }
        }


    } catch (e) {
        console.error(e);
    }
}

sync();
