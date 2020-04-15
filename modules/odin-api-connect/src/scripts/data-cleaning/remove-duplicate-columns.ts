import * as dotenv from 'dotenv';
import 'reflect-metadata';
import {createConnection} from 'typeorm';
import {BaseHttpClient} from '../../common/Http/BaseHttpClient';

dotenv.config({path: '../../../.env'});

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

        /* Get all orders with duplicates */
        const allOrdersWithDuplicates = await pg.query(
            `SELECT record_id, column_id, COUNT(*)
            FROM db_records_columns
            GROUP BY record_id, column_id
            HAVING COUNT(*) > 1`);

        let allDuplicates = []

        /* Get all duplicated records from the orders above*/
        for (const order of allOrdersWithDuplicates) {
            try {
                allDuplicates.push(await pg.query(
                    `SELECT record_id, column_id
                        FROM db_records_columns
                        WHERE record_id = '${order.record_id}'
                        AND column_id = '${order.column_id}'
                        GROUP BY record_id, column_id, created_at
                        ORDER BY created_at ASC;`))
                console.log('.')
            } catch (e) {
                console.log('%cError:', 'color:red', e)
            }
        }

        /* Remove all duplicated items */
        for (const record of allDuplicates) {

            try {
                await pg.query(
                    `delete from db_records_columns t1
                    where exists (select id
                    from db_records_columns t2
                    where t2.record_id = t1.record_id
                    and t2.column_id = t1.column_id
                    and t2.id <> t1.id
                    and t2.created_at > t1.created_at)
                    and t1.record_id = '${record[0].record_id}'
                    and t1.column_id = '${record[0].column_id}'`
                )
                console.log('%cDeleted record ', 'color:limegreen', record[0].record_id)
                console.log('%cDeleted column ', 'color:limegreen', record[0].column_id)
                console.log('------------------------------------------------------')
            } catch (e) {
                console.log('%cError:', 'color:red', e)
            }
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
