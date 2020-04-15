import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { chunkArray, sleep } from '../../../helpers/utilities';
import { FibreConnection } from './types/fibre.connection';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

export interface closureSummary {

    totalL4s: number;

}

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;

const fibreConnections = require('./closure-fibre-mappings.json');

let argL2PolygonId = process.argv.find(arg => arg.indexOf('l2polyid') > -1);
let l2Polygonid = argL2PolygonId ? argL2PolygonId.split('=')[1] : null;

let argL2ClosureId = process.argv.find(arg => arg.indexOf('l2id') > -1);
let l2ClosureId = argL2ClosureId ? argL2ClosureId.split('=')[1] : null;

async function execute() {

    let odinDb;
    let cosmosDb;

    try {

        cosmosDb = await createConnection({
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

    } catch (e) {

        console.error(e);
        cosmosDb = await getConnection('cosmosDb');
    }


    try {

        odinDb = await createConnection({
            type: 'postgres',
            name: 'odinDb',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [],
        });
    } catch (e) {

        console.error(e);
        odinDb = await getConnection('odinDb');
    }

    const errors = [];
    const modified = [];

    try {

        console.log('fibreConnections', fibreConnections.length);

        let closureIds = l2ClosureId ? [ l2ClosureId ] : [];

        if(l2Polygonid) {

            const ids = await cosmosDb.query(`SELECT ftth.closure.id
                FROM ftth.closure, ftth.polygon
                WHERE ftth.polygon.id = ${l2Polygonid}
                AND ST_Intersects(ftth.closure.geometry, ftth.polygon.geometry)
            `);

            if(ids[0]) {
                closureIds = ids.map(elem => elem['id'])
            }

        }


        // create fibre connections
        const processAll = [];

        console.log('fibreConnections', fibreConnections)
        console.log('closureIds', closureIds)

        const inFibres = fibreConnections.filter(elem => elem['inClosureExt'] ? closureIds.includes(elem['inClosureExt']) : false)
        const outFibres = fibreConnections.filter(elem => elem['outClosureExt'] ? closureIds.includes(elem['outClosureExt']) : false)

        console.log('inFibres', inFibres)
        console.log('outFibres', outFibres)

        const fibreConnectionsChunked = chunkArray([ ...inFibres, ...outFibres ], 50);

        for(const connections of fibreConnectionsChunked) {

            console.log('connections', connections)

            for(const connection of connections) {

                processAll.push({
                    func: createFibreConnection(connection),
                })

            }

            await sleep(3000)
            await Promise.all(processAll.map(elem => elem.func));

        }

        cosmosDb.close();
        odinDb.close();

        return { modified, errors };

    } catch (e) {
        console.error(e);
    }
}


/**
 *
 * @param recordId
 * @param entityName
 * @param body
 */
const createRecord = async (
    entityName: string,
    body: DbRecordCreateUpdateDto[],
) => {

    const res = await httpClient.postRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/batch?queueAndRelate=true`,
        apiToken,
        body,
    );
    console.log(res['data'])

    return res['data'];

}

/**
 * Creates a cable connection to a closure
 *
 * @param connection
 */
export async function createFibreConnection(
    connection: FibreConnection,
) {
    const newRecord = new DbRecordCreateUpdateDto()
    newRecord.entity = 'ProjectModule:FeatureConnection'
    newRecord.type = 'FIBRE'
    newRecord.properties = {
        OutClosureExternalRef: connection.outClosureExt,
        InClosureExternalRef: connection.inClosureExt,
        SlotId: connection.slotId || null,
        TrayModelId: connection.trayModelId || null,
        TrayId: connection.trayId || null,
        TrayInId: connection.trayInId || connection.trayId || null,
        TrayOutId: connection.trayOutId || connection.trayId || null,
        TraySpliceId: connection.traySpliceId || null,
        TraySplitterId: connection.traySplitterId || null,
        CableInId: connection.cableInId,
        CableInExternalRef: connection.cableInExternalRef,
        TubeFibreIn: connection.tubeFibreIn,
        TubeInId: connection.tubeInId,
        FibreInId: connection.fibreInId,
        CableOutExternalRef: connection.cableOutExternalRef,
        TubeFibreOut: connection.tubeFibreOut,
        CableOutId: connection.cableOutId,
        TubeOutId: connection.tubeOutId,
        FibreOutId: connection.fibreOutId,
    }
    newRecord.associations = [
        {
            recordId: connection.closureId,
        },
        {
            recordId: connection.slotId,
        },
        {
            recordId: connection.trayModelId,
        },
        {
            recordId: connection.trayId,
        },
        {
            recordId: connection.trayInId,
        },
        {
            recordId: connection.trayOutId,
        },
        {
            recordId: connection.cableInId,
        },
        {
            recordId: connection.tubeInId,
        },
        {
            recordId: connection.fibreInId,
        },
        {
            recordId: connection.cableOutId,
        },
        {
            recordId: connection.tubeOutId,
        },
        {
            recordId: connection.fibreOutId,
        },
        {
            recordId: connection.traySplitterId,
        },
        {
            recordId: connection.traySpliceId,
        },
    ]

    console.log('newRecord', newRecord);

    const sourceCableConnection = await createRecord(
        'FeatureConnection',
        [ newRecord ],
    )
    return sourceCableConnection;
}


execute();

