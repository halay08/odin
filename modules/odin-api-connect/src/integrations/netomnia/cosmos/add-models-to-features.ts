import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { chunkArray, sleep } from '../../../helpers/utilities';

dotenv.config({ path: '../../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// ts-node add-models-to-features.ts ftype=CLOSURE prop=ClosureModel
// ts-node add-models-to-features.ts ftype=CABLE prop=CableModel

// Command line arguments
let argFeatureName = process.argv.find(arg => arg.indexOf('ftype') > -1);
let featureType = argFeatureName ? argFeatureName.split('=')[1] : null;

let argProp = process.argv.find(arg => arg.indexOf('prop') > -1);
let property = argProp ? argProp.split('=')[1] : null;

let argChunk = process.argv.find(arg => arg.indexOf('chunk') > -1);
let chunk = argChunk ? argChunk.split('=')[1] : null;

const httpClient = new BaseHttpClient();

let db;

async function sync() {


    console.log('featureType', featureType);
    console.log('property', property);
    console.log('chunk', chunk);


    try {

        db = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            entities: [],
        });

        const featureIds = await db.query(`SELECT id
        FROM db_records
        WHERE type = '${featureType}'
        AND entity = 'ProjectModule:Feature'
        AND NOT EXISTS (
            SELECT * from db_records_associations a
            WHERE a.child_entity = 'ProjectModule:FeatureModel'
            AND a.parent_record_id = db_records.id
            AND a.deleted_at IS NULL
        )
        AND db_records.deleted_at IS NULL
        ORDER BY record_number ASC`);

        console.log('featureIds', featureIds.length);

        const chunkedIds = chunkArray(featureIds, chunk ? Number(chunk) : 50);

        const parallelProcess = []

        for(const chunk of chunkedIds) {
            console.log('chunk', chunk);
            for(const { id } of chunk) {
                parallelProcess.push({ func: addModelsToFeature(id) })
            }

            await sleep(2000)
            await Promise.all(parallelProcess.map(elem => elem.func))
        }

    } catch (e) {
        console.error(e);
    }
}


async function addModelsToFeature(id: any) {

    const recordRes = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/Feature/${id}`,
        apiToken,
    );
    const record = recordRes['data'];

    console.log('record', record);

    const recordModel = getProperty(record, property);

    console.log('recordModel', recordModel);

    if(recordModel) {
        const model = await db.query(`
                SELECT r.id
                FROM db_records r
                LEFT JOIN db_records_columns c ON (c.record_id = r.id)
                WHERE r.type = '${record.type}'
                AND r.entity = 'ProjectModule:FeatureModel'
                AND c.column_name = 'ExternalRef'
                AND r.deleted_at IS NULL
                AND c.value = '${recordModel}'`);

        console.log('model', model);

        if(model[0]) {

            // creat association between feature and model
            const update = new DbRecordCreateUpdateDto();
            update.entity = record.entity;
            update.type = record.type;
            update.properties = {
                ExternalRef: getProperty(record, 'ExternalRef'),
            };
            update.associations = [
                {
                    recordId: model[0].id,
                },
            ];

            const updated = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
                `v1.0/db/batch?queueAndRelate=true`,
                apiToken,
                [ update ],
            );

            console.log(updated);

        }
    }
}

sync();
