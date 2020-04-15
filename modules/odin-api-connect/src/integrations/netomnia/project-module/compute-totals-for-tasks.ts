import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const milestoneId = null;

// Init http client
const httpClient = new BaseHttpClient();

/**
 * Script main function
 *
 * @returns void
 */
async function sync() {

    try {

        const youfibreDb = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const records = await youfibreDb.query(`SELECT db_records.id FROM db_records left join schemas on (schemas.id = db_records.schema_id) where schemas.entity_name = 'Task'`);


        for(const record of records) {


            const totalCost = await youfibreDb.query(`SELECT float8(SUM(Val_Name1.value::double precision)) AS total
            FROM db_records as Records
            LEFT JOIN SCHEMAS AS Record__Schema ON (records.schema_id = Record__Schema.id)
            RIGHT JOIN schemas_columns AS Col__Name1 ON (Record__Schema.id = Col__Name1.schema_id AND Col__Name1.name = 'Cost')
            RIGHT JOIN db_records_columns AS Val_Name1 ON (Val_Name1.record_id = Records.id AND Col__Name1.id = Val_Name1.column_id)
            WHERE Record__Schema.entity_name = 'Feature'
                AND EXISTS (
                     SELECT associations.id
                     FROM db_records_associations AS associations
                     RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
                     WHERE parent_schema.entity_name = 'Task'
                     AND associations.deleted_at IS NULL
                     AND associations.child_record_id = Records.id
                     AND associations.parent_record_id = '${record.id}')
            AND Records.deleted_at IS NULL;`);

            console.log('totalCost', totalCost);
            if(totalCost[0]) {

                const update = new DbRecordCreateUpdateDto();
                update.entity = `ProjectModule:Task`;
                update.properties = {
                    Cost: totalCost[0]['total'] ? Number(totalCost[0]['total']).toFixed(2) : 0,
                };

                console.log('update', update);

                const updateRes = await httpClient.putRequest(
                    baseUrl,
                    `ProjectModule/v1.0/db/Milestone/${record.id}`,
                    apiToken,
                    update,
                );
            }
        }

    } catch (err) {
        console.error(err);
    }
}

sync();
