import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { syncData } from './sync-data';

dotenv.config({ path: '../../../.env' });

const createdQuery = (tableName: string) => `select * from ${tableName} where created_at > '2020-01-01 19:49:57.106815';`;
const updatedQuery = (tableName: string) => `select * from ${tableName} where created_at < '2021-01-30 19:49:57.106815' AND updated_at > '2020-01-01 19:49:57.106815';`;


async function sync() {
    try {

        const step0 = await syncData(createdQuery('organizations_users'), 'organizations_users', true);

        const step1 = await syncData(createdQuery('db_records'), 'db_records', true);
        const step2 = await syncData(updatedQuery('db_records'), 'db_records', true);

        const step3 = await syncData(createdQuery('db_records_columns'), 'db_records_columns', true);
        const step4 = await syncData(updatedQuery('db_records_columns'), 'db_records_columns', true);

        const step5 = await syncData(createdQuery('db_records_associations'), 'db_records_associations');
        const step6 = await syncData(updatedQuery('db_records_associations'), 'db_records_associations');

        const step7 = await syncData(createdQuery('logs.user_activity'), 'logs.user_activity');

        const step8 = await syncData(createdQuery('gocardless.events'), 'gocardless.events');
        const step9 = await syncData(updatedQuery('gocardless.events'), 'gocardless.events');

        let csv = '';
        const fields = [ 'name', 'sourceCount', 'insertCount', 'updateCount' ];
        try {
            const parser = new Parser({ fields });
            csv = parser.parse([
                {
                    name: 'createdOrganizationUsers',
                    sourceCount: step0.sourceCount,
                    insertCount: step0.inserted,
                    updateCount: step0.updated,

                },
                {
                    name: 'createdDbRecords',
                    sourceCount: step1.sourceCount,
                    insertCount: step1.inserted,
                    updateCount: step1.updated,

                },
                {
                    name: 'updatedDbRecords',
                    sourceCount: step2.sourceCount,
                    insertCount: step2.inserted,
                    updateCount: step2.updated,

                },
                {
                    name: 'createdDbRecordsColumns',
                    sourceCount: step3.sourceCount,
                    insertCount: step3.inserted,
                    updateCount: step3.updated,

                },
                {
                    name: 'updatedDbRecordsColumns',
                    sourceCount: step4.sourceCount,
                    insertCount: step4.inserted,
                    updateCount: step4.updated,

                },
                {
                    name: 'createdDbRecordsAssociations',
                    sourceCount: step5.sourceCount,
                    insertCount: step5.inserted,
                    updateCount: step5.updated,

                },
                {
                    name: 'updatedDbRecordsAssociations',
                    sourceCount: step6.sourceCount,
                    insertCount: step6.inserted,
                    updateCount: step6.updated,

                },
                {
                    name: 'createdUserLogs',
                    sourceCount: step7.sourceCount,
                    insertCount: step7.inserted,
                    updateCount: step7.updated,

                },
                {
                    name: 'createdGocardlessEvents',
                    sourceCount: step8.sourceCount,
                    insertCount: step8.inserted,
                    updateCount: step8.updated,

                },
                {
                    name: 'updatedGocardlessEvents',
                    sourceCount: step9.sourceCount,
                    insertCount: step9.inserted,
                    updateCount: step9.updated,

                },
            ]);
        } catch (err) {
            console.error(err);
        }

        fs.writeFileSync(`./output/overview-recovery-report-${moment().format('DD-MM-YYYY')}.csv`, csv);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
