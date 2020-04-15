import * as dotenv from 'dotenv';
import * as faker from 'faker';
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

export async function syncData(sourceDataQuery: string, tableName: string, scrambleData?: boolean) {
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

        const randomName = faker.name.findName(); // Rowan Nikolaus
        const randomFirstName = faker.name.firstName(); // Rowan
        const randomLastName = faker.name.firstName(); //  Nikolaus
        const randomPhone = faker.phone.phoneNumber(); //  Nikolaus
        const randomEmail = faker.internet.email(); // Kassandra.Haley@erich.biz

        const contactSchemaId = 'e38bfb72-a9ee-4cfd-8dba-138bc26e8a5a';
        const accountSchemaId = '5697b901-8e83-494c-a4ff-dd61c2d05c4c';

        const contactFirstNameId = '5bb9383d-6e1f-481b-a9b1-a6d703407b25';
        const contactLastNameId = '6a0ff810-174b-4ac3-827a-e196fe3521bf';
        const contactEmailId = '24dfda5c-ec88-453a-9897-b3f1b70e7801';
        const contactReferralEmailId = '988ffe15-6032-4944-addb-111ea16ff5e6';
        const contactPhoneNameId = 'bfec4832-bfd9-425b-a51c-8229b50ef855';


        let inserted = 0;
        let updated = 0;

        const auditData = [];

        for(const row of records) {

            let record = row;

            if(tableName === 'db_records' && scrambleData) {
                // scramble values
                if(record.schema_id === contactSchemaId) {
                    record.title = randomName;
                }

                if(record.schema_id === accountSchemaId) {
                    record.title = randomEmail;
                }
            }

            if(tableName === 'db_records_columns' && scrambleData) {
                // scramble values
                if(record.column_id === contactFirstNameId) {
                    record.value = randomFirstName;
                }
                if(record.column_id === contactLastNameId) {
                    record.value = randomLastName;
                }
                if(record.column_id === contactEmailId) {
                    record.value = randomEmail;
                }
                if(record.column_id === contactReferralEmailId) {
                    record.value = randomEmail;
                }
                if(record.column_id === contactPhoneNameId) {
                    record.value = randomPhone;
                }
            }
            console.log('record', record);

            // check if the record exists in the targetDb
            const targetRecord = await targetDb.query(`select * from ${tableName} where id = '${record.id}'`);

            if(targetRecord[0]) {

                // check that the target updated date is not after the source updated date
                const isSameOrBefore = moment(targetRecord[0].updated_at).isSameOrBefore(record.updated_at);
                console.log('isSameOrBefore', isSameOrBefore);

                if(isSameOrBefore) {
                    // update
                    const updateRes = await targetDb.manager.createQueryBuilder()
                        .update(tableName)
                        .set(record)
                        .where('id = :id', { id: record.id })
                        .execute();

                    const entry = new RecoveryAuditEntry();
                    entry.id = record.id;
                    entry.title = record.title; // should scramble data flag
                    entry.createdAt = record.created_at;
                    entry.updatedAt = record.updated_at;
                    entry.recoveredAt = moment().utc().toISOString();
                    entry.action = 'update';

                    auditData.push(entry);

                    console.log('updateRes', updateRes);
                    updated += 1;
                }
            } else {
                try {

                    // insert
                    const insertRes = await targetDb.manager.createQueryBuilder()
                        .insert()
                        .into(tableName, Object.keys(record))
                        .values(record)
                        .onConflict(`("id") DO NOTHING`)
                        .execute();
                    console.log('insertRes', insertRes);

                    const entry = new RecoveryAuditEntry();
                    entry.id = record.id;
                    entry.title = record.title;
                    entry.createdAt = record.created_at;
                    entry.updatedAt = record.updated_at;
                    entry.recoveredAt = moment().utc().toISOString();
                    entry.action = 'insert';

                    auditData.push(entry);
                    inserted += 1;
                } catch (e) {
                    console.error(e);
                }
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

            fs.writeFileSync(`./output/${tableName}-recovery-report-${moment().format('DD-MM-YYYY')}.csv`, csv);
        }
        return {
            sourceCount: records.length,
            inserted,
            updated,
        };
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

