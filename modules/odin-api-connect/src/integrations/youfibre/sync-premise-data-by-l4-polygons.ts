import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import { groupAndChunkDataSet } from '../../helpers/utilities';
import moment = require('moment');

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;


// ts-node sync-premise-data-by-l4-polygons.ts interval='10 days' buildstatus='5-ToDo, 6-In Progress, 7-Build Done'
// salesstatus='PRE_ORDER' opsstatus=2 export=true

// ts-node sync-premise-data-by-l4-polygons.ts interval='365 days' buildstatus='8-RFS' salesstatus='ORDER' opsstatus=1
// export=true

export async function execute() {

    let argInterval = process.argv.find(arg => arg.indexOf('interval') > -1);
    let interval = argInterval ? argInterval.split('=')[1] : null;

    let argBuildStatus = process.argv.find(arg => arg.indexOf('buildstatus') > -1);
    let buildStatuses = argBuildStatus ? argBuildStatus.split('=')[1] : null;

    let argAddrStatus = process.argv.find(arg => arg.indexOf('salesstatus') > -1);
    let addressStatus = argAddrStatus ? argAddrStatus.split('=')[1] : null;

    let argOpsStatus = process.argv.find(arg => arg.indexOf('opsstatus') > -1);
    let opsStatus = argOpsStatus ? argOpsStatus.split('=')[1] : null;

    let argExport = process.argv.find(arg => arg.indexOf('export') > -1);
    let exportCsv = argExport ? argExport.split('=')[1] : null;

    if(!interval) {
        throw Error('interval required (i.e: interval="1 days"');
    }

    const httpClient = new BaseHttpClient();

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

    const parsedBuildStatuses = buildStatuses.split(',').map(elem => `'${elem.trim()}'`);

    console.log({
        buildStatuses,
        addressStatus,
        opsStatus,
        interval,
    })

    const osCoreRecords = await cosmosDb.query(
        `SELECT
               DISTINCT(p1.id),
               ex.name                as ex_name,
               ex.id                  as ex_polygon_id,
               p2.name                as l2_name,
               p2.id                  as l2_id,
               p2.target_release_date as l2_target_release_date,
               p2.build_status        as l2_build_status,
               p2.build_status_id     as l2_build_status_id,
               p1.name                as l4_name,
               p1.geometry            as l4_geometry,
               p1.id                  as l4_id,
               p1bs.name              as l4_build_status
        FROM ftth.polygon as p1
                 LEFT JOIN ftth.build_status AS p1bs ON (p1.build_status_id = p1bs.id)
                 LEFT JOIN LATERAL (
            SELECT p2.id,
                   p2.name,
                   p2.geometry,
                   p2.target_release_date as target_release_date,
                   p2bs.id                as build_status_id,
                   p2bs.name              as build_status
            FROM ftth.polygon AS p2
                 LEFT JOIN ftth.build_status AS p2bs ON (p2.build_status_id = p2bs.id)
            WHERE p2.name = 'L2'
            ) AS p2 ON St_Intersects(ST_Centroid(p1.geometry), p2.geometry)
                 LEFT JOIN LATERAL (
            SELECT ex.id, ex.name, ex.geometry, exbs.id as build_status_id, exbs.name as build_status
            FROM ftth.polygon AS ex
                     LEFT JOIN ftth.build_status AS exbs ON (ex.build_status_id = exbs.id)
            WHERE ex.name = 'EX'
            ) AS ex ON St_Intersects(ex.geometry, p2.geometry)
        WHERE p1.name = 'L4'
          AND p1bs.name IN (${parsedBuildStatuses})
          AND p1.modified_at > now() - '${interval}'::interval
          ORDER BY p1.id DESC
        `);

    console.log('osCoreRecords', osCoreRecords.length);

    const chunkedArray = groupAndChunkDataSet(osCoreRecords, 'l4_id', 100);

    console.log('chunkedArray', chunkedArray.length);

    const errors = [];
    const modified = [];

    for(let i = 0; i < chunkedArray.length; i++) {

        const elem = chunkedArray[i];

        const polygonGeoms = elem.map(poly => ({
            geometry: `${poly.l4_geometry}`,
            target_release_date: poly.l2_target_release_date,
            build_status: poly.l4_build_status,
            ex_polygon_id: poly.ex_polygon_id,
            l2_polygon_id: poly.l2_id,
            l4_polygon_id: poly.l4_id,
        }));

        console.log('polygonGeoms.length', polygonGeoms.length);

        let query = '';
        for(let i = 0; i < polygonGeoms.length; i++) {
            if(i === 0) {
                query = `SELECT *,
                    ${polygonGeoms[i].ex_polygon_id} as ex_polygon_id,
                    ${polygonGeoms[i].l2_polygon_id} as l2_polygon_id,
                    ${polygonGeoms[i].l4_polygon_id} as l4_polygon_id,
                    ${polygonGeoms[i].target_release_date ? `'${polygonGeoms[i].target_release_date}'` : null} as target_release_date,
                    '${polygonGeoms[i].build_status}' as build_status
                FROM os.ab_plus WHERE St_Intersects(os.ab_plus.geom, '${polygonGeoms[i].geometry}')`
            } else {
                query = query.concat(` OR St_Intersects(os.ab_plus.geom, '${polygonGeoms[i].geometry}')`);
            }
        }

        const premises = await myahDb.query(query);

        console.log('premises', premises.length);

        for(const premise of premises) {

            if(premise.udprn) {

                try {
                    const udprn = premise.udprn;
                    const targetReleaseDate = moment(premise.target_release_date).isValid() ? moment(premise.target_release_date).format(
                        'YYYY-MM-DD') : undefined;
                    const buildStatusName = premise.build_status;

                    const opsPremiseUpdated = await youfibreDb.query(`
                    INSERT INTO ops.premises (uprn, udprn, umprn, geom, target_release_date, build_status_name, sales_status_id)
                    VALUES(${premise.uprn}, ${premise.udprn}, 0, '${premise.geom}', ${targetReleaseDate ? `'${targetReleaseDate}'` : null}, ${buildStatusName ? `'${buildStatusName}'` : null}, ${opsStatus})
                    ON CONFLICT (udprn, umprn)
                    DO
                        UPDATE SET
                        target_release_date = ${targetReleaseDate ? `'${targetReleaseDate}'` : null},
                        build_status_name = ${buildStatusName ? `'${buildStatusName}'` : null},
                        sales_status_id = ${opsStatus},
                        ex_polygon_id = ${premise.ex_polygon_id},
                        l2_polygon_id = ${premise.l2_polygon_id},
                        l4_polygon_id = ${premise.l4_polygon_id},
                        ab_plus_class_1 = '${premise.class_1}'
                    RETURNING id
                    `);


                    const addressRecords = await youfibreDb.query(`SELECT r.id as record_id, r.title as record_title
                        FROM db_records_columns
                        LEFT JOIN db_records r on (db_records_columns.record_id = r.id)
                        WHERE value = ${udprn}::text
                        AND db_records_columns.column_name = 'UDPRN'
                        AND r.entity = 'CrmModule:Address';`);

                    // If the premise is updated in ops.premises then Update the Address

                    if(addressRecords[0]) {

                        for(const address of addressRecords) {

                            console.log('UPDATE_ADDRESS_RECORD', address.title);

                            const getRes = await httpClient.getRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                                `v1.0/db/Address/${address.record_id}`,
                                apiToken,
                            );

                            const addressObj = getRes['data'];

                            // Update Address
                            const update = new DbRecordCreateUpdateDto();
                            update.entity = `${SchemaModuleTypeEnums.CRM_MODULE}:${SchemaModuleEntityTypeEnums.ADDRESS}`;
                            update.properties = {
                                TargetReleaseDate: targetReleaseDate,
                                BuildStatus: buildStatusName,
                                SalesStatus: addressStatus,
                                L4PolygonId: premise.l4_polygon_id,
                                L2PolygonId: premise.l2_polygon_id,
                                ExPolygonId: premise.ex_polygon_id,
                                Classification: premise.class_1,
                            };

                            const updateRes = await
                                httpClient.putRequest(
                                    Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                                    `v1.0/db/Address/${address.record_id}`,
                                    apiToken,
                                    update,
                                );

                            console.log('updateRes', updateRes['statusCode']);

                            modified.push({
                                id: address.record_id,
                                udprn: udprn,
                                title: address.record_title,
                                sales_status_id: opsStatus,
                                ex_polygon_id: premise.ex_polygon_id,
                                l2_polygon_id: premise.l2_polygon_id,
                                l4_polygon_id: premise.l4_polygon_id,
                                ab_plus_class_1: premise.class_1,
                                previousStatus: getProperty(addressObj, 'SalesStatus'),
                                nextStatus: update.properties['SalesStatus'],
                                previousBuild: getProperty(addressObj, 'BuildStatus'),
                                nextBuild: update.properties['BuildStatus'],
                                updated: updateRes['statusCode'] === 200,
                            });

                            console.log({
                                id: address.record_id,
                                udprn: udprn,
                                title: address.record_title,
                                sales_status_id: opsStatus,
                                ex_polygon_id: premise.ex_polygon_id,
                                l2_polygon_id: premise.l2_polygon_id,
                                l4_polygon_id: premise.l4_polygon_id,
                                ab_plus_class_1: premise.class_1,
                                previousStatus: getProperty(addressObj, 'SalesStatus'),
                                nextStatus: update.properties['SalesStatus'],
                                previousBuild: getProperty(addressObj, 'BuildStatus'),
                                nextBuild: update.properties['BuildStatus'],
                                updated: updateRes['statusCode'] === 200,
                            })
                        }
                    }

                } catch (e) {
                    console.error('ERROR', e);
                }
            } else {
                errors.push(premise);
            }
        }

    }
    console.log('errors', errors);
    console.log('modified', modified);

    if(exportCsv) {
        let csvModified = '';
        try {
            // csv = parse({ data: report, fields });
            const parser = new Parser({ fields: Object.keys(modified[0]).map(elem => (elem)) });
            csvModified = parser.parse(modified);
        } catch (err) {
            console.error(err);
        }

        let csvErrors = '';
        try {
            // csv = parse({ data: report, fields });
            const parser = new Parser({ fields: Object.keys(errors[0]).map(elem => (elem)) });
            csvErrors = parser.parse(modified);
        } catch (err) {
            console.error(err);
        }


        fs.writeFileSync(`modified-${addressStatus}-${moment().format('DD-MM-YYYY')}.csv`, csvModified)
        fs.writeFileSync(`errors-${addressStatus}-${moment().format('DD-MM-YYYY')}.csv`, csvErrors)
    }

    cosmosDb.close();
    youfibreDb.close();
    return { modified, errors };
}

execute();

