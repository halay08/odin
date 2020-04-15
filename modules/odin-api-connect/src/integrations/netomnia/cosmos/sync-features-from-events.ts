import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { constantCase } from 'change-case';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;

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
            `v1.0/schemas/bymodule?moduleName=${PROJECT_MODULE}&entityName=${FEATURE}`,
            apiToken,
        );
        const schema = schemaRes['data'];

        const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

        const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);

        const events = await cosmosDb.query(`SELECT *, hstore_to_json (row_data) row_data_json FROM audit.logged_actions as a WHERE a.action_tstamp_tx > now() - '60 minutes'::interval`);

        console.log('events', events);

        for(const event of events) {

            if(event.action === 'U') {

                console.log('---------UPDATE_EVENT');
                const schemaName = event.schema_name;
                const tableName = event.table_name;
                const featureId = event.row_data_json.id;

                console.log({ schemaName, tableName, featureId, action: 'UPDATE' });

            } else if(event.action === 'I') {

                console.log('---------INSERT_EVENT');
                const schemaName = event.schema_name;
                const tableName = event.table_name;
                const featureId = event.row_data_json.id;

                console.log({ schemaName, tableName, featureId, action: 'INSERT' });

            } else if(event.action === 'D') {

                console.log('---------DELETE_EVENT');
                const schemaName = event.schema_name;
                const tableName = event.table_name;
                const featureId = event.row_data_json.id;

                console.log({ schemaName, tableName, featureId, action: 'DELETE' });

            }


        }


    } catch (e) {
        console.error(e);
    }
}

sync();
