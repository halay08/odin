import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { constantCase } from 'change-case';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { chunkArray } from '../../../helpers/utilities';

dotenv.config({ path: '../../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;

async function sync() {

    const httpClient = new BaseHttpClient();

    try {

        let argDbSchema = process.argv.find(arg => arg.indexOf('tname') > -1);
        let tableName = argDbSchema ? argDbSchema.split('=')[1] : null;

        let argFeatureType = process.argv.find(arg => arg.indexOf('fname') > -1);
        let featureType = argFeatureType ? argFeatureType.split('=')[1] : null;

        let argChunk = process.argv.find(arg => arg.indexOf('chunk') > -1);
        let chunk = argChunk ? argChunk.split('=')[1] : null;

        console.log('tableName', tableName);
        console.log('featureType', featureType);
        console.log('chunk', chunk);

        const myahDb = await createConnection({
            type: 'postgres',
            name: 'myahDb',
            host: process.env.DB_MYAH_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_MYAH_USERNAME,
            password: process.env.DB_MYAH_PASSWORD,
            database: process.env.DB_MYAH_NAME,
            entities: [],
        });


        const schemaRes = await httpClient.getRequest(
            Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
            `v1.0/schemas/bymodule?moduleName=${PROJECT_MODULE}&entityName=${FEATURE}`,
            apiToken,
        );
        const schema = schemaRes['data'];

        const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

        const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);

        const featureIds = await myahDb.query(`SELECT objectid FROM ${tableName}`);
        const chunkedIds = chunkArray(featureIds, chunk ? Number(chunk) : 10);

        for(const chunk of chunkedIds) {

            const data = await myahDb.query(`SELECT * FROM ${tableName} WHERE objectid IN (${chunk.map(elem => elem.objectid).join()})`);


            let creates = [];
            for(const item of data) {

                const newObj = new DbRecordCreateUpdateDto();
                newObj.entity = `${PROJECT_MODULE}:${FEATURE}`;
                newObj.type = constantCase(featureType);
                newObj.properties = {
                    ExternalRef: item.objectid,
                };
                newObj.options = {
                    skipCreateEvent: true,
                };

                for(const key of Object.keys(item)) {

                    const col = filteredCols.find(elem => elem.mapping === key);

                    if(col && col.name !== 'Coordinates') {
                        newObj.properties = Object.assign({}, newObj.properties, { [col.name]: item[key] })
                    }
                }

                creates.push(newObj);

            }

            console.log('creates', creates);

            const res = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
                `v1.0/db/batch?upsert=true&queueAndRelate=true`,
                apiToken,
                creates,
            );

            console.log('res', res);

        }

    } catch (e) {
        console.error(e);
    }
}


sync();
