import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

class RecoveryAuditEntry {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    recoveredAt: string;
    action: string;
}

export async function verifyData(sourceDataQuery: string, tableName: string) {
    try {

        let sourceDb;
        let targetDb;

        try {
            sourceDb = await createConnection({
                type: 'postgres',
                name: 'sourceDb',
                host: process.env.DB_HOSTNAME_SOURCE,
                port: Number(process.env.DB_PORT_SOURCE),
                username: process.env.DB_USERNAME_SOURCE,
                password: process.env.DB_PASSWORD_SOURCE,
                database: process.env.DB_NAME_SOURCE,
            });
        } catch (e) {
            sourceDb = await getConnection('sourceDb');
        }

        try {
            targetDb = await createConnection({
                type: 'postgres',
                name: 'targetDb',
                host: process.env.DB_HOSTNAME,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });
        } catch (e) {
            targetDb = await getConnection('targetDb');
        }

        // Get work orders that are in Supply and have a Work order in Done
        const records = await sourceDb.query(sourceDataQuery);

        console.log('source length', records.length);

        const auditData = [];

        for(const record of records) {

            // check if the record exists in the targetDb
            const targetRecord = await targetDb.query(`select * from ${tableName} where id = '${record.id}'`);

            if(!targetRecord[0]) {
                console.log('!targetRecord[0]', targetRecord[0]);

                const entry = new RecoveryAuditEntry();
                entry.id = record.id;
                entry.title = record.title; // should scramble data flag
                entry.createdAt = record.created_at;
                entry.updatedAt = record.updated_at;
                entry.recoveredAt = moment().utc().toISOString();
                entry.action = 'target_missing_record';

                auditData.push(entry);
            }
        }

        if(auditData[0]) {
            let csv = '';
            const fields = Object.keys(auditData[0]).map(elem => (elem));

            try {
                const parser = new Parser({ fields });
                csv = parser.parse(auditData);
            } catch (err) {
                console.error(err);
            }

            fs.writeFileSync(`./output/errors-${tableName}-recovery-report-${moment().format('DD-MM-YYYY')}.csv`, csv);
        }
        return;

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

