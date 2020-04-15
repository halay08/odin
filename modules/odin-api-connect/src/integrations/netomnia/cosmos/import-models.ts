import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
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
const FEATURE_MODEL = 'FeatureModel';

async function sync() {

    // Command line arguments
    let argDbSchema = process.argv.find(arg => arg.indexOf('tname') > -1);
    let tableName = argDbSchema ? argDbSchema.split('=')[1] : null;

    let argFeatureType = process.argv.find(arg => arg.indexOf('fname') > -1);
    let featureType = argFeatureType ? argFeatureType.split('=')[1] : null;

    let argChunk = process.argv.find(arg => arg.indexOf('chunk') > -1);
    let chunk = argChunk ? argChunk.split('=')[1] : null;

    console.log('tableName', tableName);
    console.log('featureType', featureType);
    console.log('chunk', chunk);

    const httpClient = new BaseHttpClient();

    try {
        const cosmosDb = await createConnection({
            type: 'postgres',
            name: 'netomniaConnection',
            host: process.env.DB_GIS_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_GIS_USERNAME,
            password: process.env.DB_GIS_PASSWORD,
            database: process.env.DB_GIS_NAME,
            synchronize: false,
            entities: [],
        });

        const schemaRes = await httpClient.getRequest(
            Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
            `v1.0/schemas/bymodule?moduleName=${PROJECT_MODULE}&entityName=${FEATURE_MODEL}`,
            apiToken,
        );
        const schema = schemaRes['data'];

        const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

        const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);

        const featureIds = await cosmosDb.query(`SELECT id FROM ${tableName}`);

        const chunkedIds = chunkArray(featureIds, chunk ? Number(chunk) : 15);

        for(const chunk of chunkedIds) {

            const data = await cosmosDb.query(`
            SELECT *
            FROM ${tableName}
            WHERE id IN (${chunk.map(elem => elem.id).join()})
            `);


            let creates = [];
            for(const item of data) {

                const newObj = new DbRecordCreateUpdateDto();
                newObj.entity = `${PROJECT_MODULE}:${FEATURE_MODEL}`;
                newObj.type = constantCase(featureType);
                newObj.title = item.name;
                newObj.properties = {};
                newObj.options = {
                    skipCreateEvent: true,
                };

                for(const key of Object.keys(item)) {

                    const col = filteredCols.find(elem => elem.mapping === key);

                    if(col) {
                        newObj.properties = Object.assign({}, newObj.properties, { [col.name]: item[key] })
                    }

                    if(featureType === 'TRAY') {

                        newObj.properties = Object.assign({}, newObj.properties, {

                            SplitterQuantity: 4,
                            SplitterType: '1_4',
                            SpliceCount: 12,

                        })
                    }
                }

                creates.push(newObj);

            }

            console.log('creates', creates);

            const res = await httpClient.postRequest(
                Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
                `v1.0/db/batch?queueAndRelate=true`,
                apiToken,
                creates,
            );

            console.log(res);
        }

    } catch (e) {
        console.error(e);
    }
}

sync();
