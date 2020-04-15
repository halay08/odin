import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import { chunkArray } from '../../helpers/utilities';
import moment = require('moment');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

export async function execute() {

    const httpClient = new BaseHttpClient();

    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    const es = new ElasticSearchClient(client);

    let myahDb;
    let cosmosDb;
    let youfibreDb;
    try {
        myahDb = await createConnection({
            type: 'postgres',
            name: process.env.DB_MYAH_NAME,
            host: process.env.DB_MYAH_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_MYAH_USERNAME,
            password: process.env.DB_MYAH_PASSWORD,
            database: process.env.DB_MYAH_NAME,
            entities: [],
        });
    } catch (e) {
        console.error(e);
        myahDb = await getConnection('myahDb');
    }

    try {

        cosmosDb = await createConnection({
            type: 'postgres',
            name: 'cosmosDb',
            host: process.env.DB_GIS_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_GIS_USERNAME,
            password: process.env.DB_GIS_PASSWORD,
            database: process.env.DB_GIS_NAME,
            entities: [],
        });
    } catch (e) {

        console.error(e);
        cosmosDb = await getConnection('cosmosDb');
    }

    try {
        youfibreDb = await createConnection({
            type: 'postgres',
            name: 'youfibreDb',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
    } catch (e) {

        console.error(e);
        youfibreDb = await getConnection('youfibreDb');
    }

    const schemaRes = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
        `v1.0/schemas/bymodule?moduleName=CrmModule&entityName=Premise`,
        apiToken,
    );
    console.log('schemaRes', schemaRes);
    const schema = schemaRes['data'];

    const osCoreRecords = await cosmosDb.query(
        `SELECT ftth.polygon.name, ftth.polygon.geometry, ftth.polygon.id as polygon_id, ftth.build_status.name as build_status, ftth.polygon.target_release_date
        FROM ftth.polygon
        LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        WHERE ftth.polygon.name = 'L4'
        AND ftth.build_status.name IN ('6-In Progress','7-Build Done','8-RFS')
        `);

    console.log('osCoreRecords', osCoreRecords.length);

    const chunkedArray = chunkArray(osCoreRecords, 100);

    const errors = [];
    const modified = [];
    const esDataSet = [];

    for(let i = 0; i < chunkedArray.length; i++) {

        const elem = chunkedArray[i];

        const polygonGeoms = elem.map(poly => ({ geometry: `${poly.geometry}`, target_release_date: poly.target_release_date, build_status: poly.build_status }));

        let query = '';
        for(let i = 0; i < polygonGeoms.length; i++) {
            if(i === 0) {
                query = `SELECT os.ab_plus.udprn, ${polygonGeoms[i].target_release_date ? `'${polygonGeoms[i].target_release_date}'` : null} as target_release_date, '${polygonGeoms[i].build_status}' as build_status
                FROM os.ab_plus WHERE St_Intersects(os.ab_plus.geom, '${polygonGeoms[i].geometry}') AND udprn IS NOT NULL AND postcode ILIKE '%SR8%'`
            } else {
                query = query.concat(` OR St_Intersects(os.ab_plus.geom, '${polygonGeoms[i].geometry}')`);
            }
        }

        const premises = await myahDb.query(query);

        console.log('premises', premises.length);

        for(const premise of premises) {

            if(premise.udprn) {
                try {
                    console.log('premise', premise);

                    const udprn = premise.udprn;
                    const targetReleaseDate = premise.target_release_date ? moment(premise.target_release_date).format(
                        'YYYY-MM-DD') : null;
                    const buildStatusName = premise.build_status;

                    // get the lats visit and set the detail against the premise

                    const visit = await youfibreDb.query(`
                    SELECT r.id, r.created_by_id
                    FROM db_records r
                    LEFT JOIN db_records_columns c ON (r.id = c.record_id)
                    WHERE c.value = ${premise.udprn}::text
                    AND r.entity = 'CrmModule:Visit'
                    AND c.column_name = 'UDPRN'
                    ORDER BY r.created_at ASC
                    LIMIT 1`);

                    console.log('visit', visit);

                    let visitObj;
                    if(visit[0]) {

                        const getRes = await httpClient.getRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                            `v1.0/db/Visit/${visit[0].id}`,
                            apiToken,
                        );

                        console.log('getRes', getRes);

                        visitObj = getRes['data'];
                    }

                    if(udprn) {

                        // update the premise in elastic search
                        const recordId = `${udprn}-${0}`;
                        const esBody = {
                            'script': {
                                'lang': 'painless',
                                'source': `ctx._source.properties.TargetReleaseDate = ${targetReleaseDate ? `'${targetReleaseDate}'` : null}; ctx._source.properties.BuildStatus = ${buildStatusName ? buildStatusName : null}; ctx._source.properties.VisitOutcome = ${visitObj && getProperty(
                                    visitObj,
                                    'Outcome',
                                ) ? `${getProperty(
                                    visitObj,
                                    'Outcome',
                                )}` : null}; ctx._source.properties.VisitFollowUpDate = ${visitObj && getProperty(
                                    visitObj,
                                    'FollowUpDate',
                                ) ? `'${getProperty(
                                    visitObj,
                                    'FollowUpDate',
                                )}'` : null}; ctx._source.properties.LastVisitBy = ${visitObj ? `'${visitObj.createdBy.id}'` : null};`,
                            },
                        };

                        console.log('esBody', esBody);
                        esDataSet.push({ 'update': { '_index': schema.id, '_id': recordId } });
                        esDataSet.push(esBody);
                    }

                } catch (e) {
                    console.error(e);
                }
            } else {
                errors.push(premise);
            }
        }


        console.log('esDataSet', esDataSet);

        await es.bulk(esDataSet);
    }
    console.log('errors', errors);
    console.log('modified', modified);

    cosmosDb.close();
    myahDb.close();

    return { modified, errors };
}

execute();

