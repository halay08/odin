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

// ts-node import-features.ts tname=ftth.closure fname=CLOSURE chunk=100
// ts-node import-features.ts tname=ftth.cable fname=CABLE chunk=100
// ts-node import-features.ts tname=ftth.duct fname=DUCT chunk=100
// ts-node import-features.ts tname=ftth.seal fname=SEAL chunk=100
// ts-node import-features.ts tname=ftth.pole fname=POLE chunk=100
// ts-node import-features.ts tname=ftth.chamber fname=CHAMBER chunk=100

async function sync() {

    // Command line arguments
    let argL1PlygonId = process.argv.find(arg => arg.indexOf('l1polyid') > -1);
    let l1PolygonId = argL1PlygonId ? argL1PlygonId.split('=')[1] : null;

    let argL2PolygonId = process.argv.find(arg => arg.indexOf('l2polyid') > -1);
    let l2Polygonid = argL2PolygonId ? argL2PolygonId.split('=')[1] : null;

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

        console.log('schema', schema)

        const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

        const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);

        let l2PolygonIds = l2Polygonid ? [ l2Polygonid ] : [];

        if(l1PolygonId) {

            const ids = await cosmosDb.query(`
                SELECT
                    a.id
                FROM ftth.polygon as a, ftth.polygon as b
                WHERE ST_Intersects(a.geometry, b.geometry)
                AND a.name = 'L2'
                AND b.id = ${l1PolygonId}
           `);

            if(ids[0]) {
                l2PolygonIds = ids.map(elem => elem['id'])
            }

        }


        console.log('l2PolygonIds', l2PolygonIds)

        for(const l2Id of l2PolygonIds) {

            const exPolygon = await cosmosDb.query(`
            SELECT
            a.id
        FROM ftth.polygon as a, ftth.polygon as b
         WHERE ST_Intersects(a.geometry, b.geometry)
        AND a.name = 'EX'
        AND b.id = ${l2Id}
        `);

            console.log('exPolygon', exPolygon)

            const featureIds = await cosmosDb.query(`SELECT ${tableName}.id
        FROM ${tableName}, ftth.polygon
        WHERE ftth.polygon.id = ${l2Id}
         AND CASE
            WHEN ST_GeometryType(${tableName}.geometry) <> 'ST_MultiCurve'
                THEN ST_Intersects(${tableName}.geometry, ftth.polygon.geometry)
            WHEN ST_GeometryType(${tableName}.geometry) = 'ST_MultiCurve'
                THEN ST_Intersects(ST_CurveToLine(${tableName}.geometry), ftth.polygon.geometry)
        END
        `);

            console.log('LENGTH', featureIds.length)

            const chunkedIds = chunkArray(featureIds, chunk ? Number(chunk) : 15);

            for(const chunk of chunkedIds) {

                const data = await cosmosDb.query(`
            SELECT *
            FROM ${tableName}
            WHERE id IN (${chunk.map(elem => elem.id).join()})
            `);


                console.log('filteredCols', filteredCols)
                console.log('data', data)

                let creates = [];
                for(const item of data) {

                    const newObj = new DbRecordCreateUpdateDto();
                    newObj.entity = `${PROJECT_MODULE}:${FEATURE}`;
                    newObj.type = constantCase(featureType);
                    newObj.properties = {
                        ExPolygonId: exPolygon[0]['id'],
                        L2PolygonId: l2Id,
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
                    `v1.0/db/batch?queue=true`,
                    apiToken,
                    creates,
                );

                console.log(res);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

sync();
