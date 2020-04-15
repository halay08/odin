import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { chunkArray } from '../../../helpers/utilities';
import { FibreConnection } from './types/fibre.connection';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;

const connectionMappings = require('./closure-cable-mappings-gis.json');

let argCableType = process.argv.find(arg => arg.indexOf('ctype') > -1);
let cableType = argCableType ? argCableType.split('=')[1] : null;

let fibreConnections = []
let fibreConnectionMappings = {}
let outTubeAndFibres = {}
let inTubeAndFibres = {}

async function execute() {

    let odinDb;

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
        odinDb = await getConnection('cosmosDb');

    }

    const errors = [];
    const modified = [];

    try {

        let outClosureType;
        if(cableType === 'Spine') {
            outClosureType = 'L1'
        } else if(cableType === 'Distribution') {
            outClosureType = 'L2'
        } else if(cableType === 'Access') {
            outClosureType = 'L3'
        }

        const loopCables = connectionMappings.filter(elem => elem.isLoopCable === true && elem.outCableType === cableType && elem.outClosureType === outClosureType);
        const sorted = loopCables.sort((a, b) => a.outClosure - b.outClosure).sort((
            a,
            b,
        ) => a.l4ClosureCount - b.l4ClosureCount);

        const chunkedConnections = chunkArray(sorted, 25);

        console.log('MAPPINGS_LENGTH', loopCables.length)

        console.log('sorted', sorted);

        let counts = {};
        for(const connection of sorted) {

            if(!counts[connection.outClosure]) {
                counts[connection.outClosure] = {
                    count: connection['l4ClosureCount'],
                    longestLoop: connection.outCable,
                }
            }

            console.log(`${connection.outClosure}_COUNT_BEFORE`, counts[connection.outClosure]['count']);
            console.log(`${connection.outClosure}_COUNT_NEW`, connection['l4ClosureCount']);

            if(counts[connection.outClosure]['count'] < connection['l4ClosureCount']) {

                console.log(
                    'PREVIOUS_COUNT_LESS',
                    counts[connection.outClosure]['count'],
                    connection['l4ClosureCount'],
                    connection.outCable,
                )
                counts[connection.outClosure] = {
                    count: connection['l4ClosureCount'],
                    longestLoop: connection.outCable,
                }
            }
        }

        // find the loop cable in the closure that has the most L4 counts

        const processMappings = []

        // create closure + cable connections
        for(const connections of chunkedConnections) {

            console.log('TOTAL_MAPPINGS', Object.keys(fibreConnectionMappings).length)

            for(const connection of connections) {

                if(connection.inCable === counts[connection.outClosure]['longestLoop']) {

                    processMappings.push({
                        func: configureFibreMappings(connection, odinDb),
                    })

                }

            }

            await Promise.all(processMappings.map(elem => elem.func)).catch(e => console.error(e))
        }


        // CONNECTIONS TO BE CREATED
        const keys = Object.keys(fibreConnectionMappings);

        for(const key of keys) {

            const mappings = fibreConnectionMappings[key];

            if(mappings['inClosure'] && mappings['outClosure']) {

                const inFibreKeys = Object.keys(mappings['inClosure']['tubesFibres']);
                for(const fkey of inFibreKeys) {

                    console.log('fkey', fkey)

                    // TODO: Handle getting the same tubeAndFibre or the nextAvailableFibre
                    // TODO: Add tracing from this closure back to L2 to find the next available fibre

                    const downstreamClosure = mappings['inClosure'];
                    const upstreamClosure = mappings['outClosure'];

                    const downStreamTubeAndFibre = downstreamClosure['tubesFibres'][fkey];
                    const upstreamTubeAndFibre = upstreamClosure['tubesFibres'][fkey];
                    console.log('downStreamTubeAndFibre', downStreamTubeAndFibre)
                    console.log('upstreamTubeAndFibre', upstreamTubeAndFibre)

                    if(downStreamTubeAndFibre && upstreamTubeAndFibre) {

                        const connection = new FibreConnection();

                        connection.closureId = upstreamClosure['closureId'];
                        connection.inClosureExt = upstreamClosure['closureExt'];
                        connection.cableInId = upstreamClosure['cableId'];
                        connection.cableInExternalRef = upstreamClosure['cableExt'];
                        connection.tubeFibreIn = fkey;
                        connection.tubeInId = upstreamTubeAndFibre['tubeId'];
                        connection.fibreInId = upstreamTubeAndFibre['fibreId'];
                        // closureId is the closure where the connections are happening
                        connection.outClosureExt = downstreamClosure['closureExt'];
                        connection.cableOutId = downstreamClosure['cableId'];
                        connection.cableOutExternalRef = downstreamClosure['cableExt'];
                        connection.tubeFibreOut = fkey;
                        connection.tubeOutId = downStreamTubeAndFibre['tubeId'];
                        connection.fibreOutId = downStreamTubeAndFibre['fibreId'];

                        fibreConnections.push(connection)

                    }

                }

            }

        }

        fs.writeFileSync('./closure-fibre-mappings.json', JSON.stringify(fibreConnections))

        console.log('fibreConnectionMappings', fibreConnectionMappings)
        console.log('inTubeAndFibres', inTubeAndFibres)
        console.log('outTubeAndFibres', outTubeAndFibres)

        odinDb.close();

        return { modified, errors };

    } catch (e) {
        console.error(e);
    }
}


/**
 *
 * @param connection
 * @param odinDb
 */
async function configureFibreMappings(connection, odinDb) {

    try {
        console.log('connection', connection)

        const closureConnectionKey = `${connection.outClosure}_${connection.inClosure}`

        const inClosure = await getOdinRecordByExternalRef(
            connection.inClosure,
            odinDb,
            'CLOSURE',
        )

        // get the in closure cable connections
        const inClosureConnections = await getRelatedRecords(
            inClosure.id,
            'Feature',
            [ '\"FeatureConnection\"' ],
            [ '\"SchemaType:CABLE\"' ],
        )
        const inCableConnections = inClosureConnections['FeatureConnection'].dbRecords;

        if(inCableConnections) {
            // console.log('inCableConnections', inCableConnections)
            const inConnection = inCableConnections.find(elem => getProperty(elem, 'Direction') === 'IN');

            const inCable = await getRecordDetail(
                getProperty(inConnection, 'CableId'),
                'Feature',
                [],
            )
            const inCableTubeIds = inCable.links.filter(elem => elem.type === 'CABLE_TUBE').map(elem => elem.id)
            const inCableTubes = await getManyRecordsDetail(inCableTubeIds)
            const inCableTubesSorted = inCableTubes.sort((a, b) => Number(getProperty(a, 'TubeNumber')) - Number(
                getProperty(b, 'TubeNumber')));

            fibreConnectionMappings[closureConnectionKey] = {
                ...fibreConnectionMappings[closureConnectionKey],
                inClosure: {
                    closureExt: connection.inClosure,
                    cableExt: connection.inCable,
                    closureId: inClosure.id,
                    cableId: inCable.id,
                    tubesFibres: {},
                },
            }

            for(const inCableTube of inCableTubesSorted) {

                const inCableFibres = await getRelatedRecords(
                    inCableTube.id,
                    'FeatureComponent',
                    [ '\"FeatureComponent\"' ],
                )
                const inFibreRecords = inCableFibres['FeatureComponent'].dbRecords;
                const sorted = inFibreRecords.sort((a, b) => Number(getProperty(a, 'FibreNumber')) - Number(
                    getProperty(b, 'FibreNumber')));

                for(const fibre of sorted) {
                    fibreConnectionMappings[closureConnectionKey]['inClosure']['tubesFibres']
                        [`T${getProperty(
                        inCableTube,
                        'TubeNumber',
                    )}:F${getProperty(
                        fibre,
                        'FibreNumber',
                    )}`] = {
                        tubeId: inCableTube.id,
                        fibreId: fibre.id,
                    }
                }
            }

            // OUT CLOSURE

            // gets the upstream closure where the in cable is coming from
            const upstreamConnections = await getNextConnectionByCableIdAndDirection(
                getProperty(inConnection, 'CableId'),
                odinDb,
                'OUT',
                getProperty(inCable, 'CableType'),
            );
            console.log('upstreamConnections', upstreamConnections[0]['connections'])

            if(upstreamConnections[0]['connections'][0]) {

                // gets the upstream closures In cable that we need to make the fibre connections with
                const cableToConnect = await getUpstreamClosureCableConnection(
                    upstreamConnections[0]['connections'][0]['closureId'],
                    'Feature',
                    'IN',
                    getProperty(inCable, 'CableType'),
                )

                if(cableToConnect) {
                    const outCableTubeIds = cableToConnect.links.filter(elem => elem.type === 'CABLE_TUBE').map(elem => elem.id)
                    const outCableTubes = await getManyRecordsDetail(outCableTubeIds)
                    const outCableTubesSorted = outCableTubes.sort((a, b) => Number(getProperty(
                        a,
                        'TubeNumber',
                    )) - Number(getProperty(b, 'TubeNumber')));

                    fibreConnectionMappings[closureConnectionKey] = {
                        ...fibreConnectionMappings[closureConnectionKey],
                        outClosure: {
                            closureExt: Number(upstreamConnections[0]['connections'][0]['closureExt']),
                            cableExt: Number(getProperty(cableToConnect, 'ExternalRef')),
                            closureId: upstreamConnections[0]['connections'][0]['closureId'],
                            cableId: cableToConnect.id,
                            tubesFibres: {},
                        },
                    }

                    for(const outCableTube of outCableTubesSorted) {

                        console.log('outCableTube', outCableTube)

                        const outCableFibres = await getRelatedRecords(
                            outCableTube.id,
                            'FeatureComponent',
                            [ '\"FeatureComponent\"' ],
                        )
                        const outFibreRecords = outCableFibres['FeatureComponent'].dbRecords;
                        const sorted = outFibreRecords.sort((a, b) => Number(getProperty(
                            a,
                            'FibreNumber',
                        )) - Number(
                            getProperty(b, 'FibreNumber')));

                        for(const fibre of sorted) {
                            fibreConnectionMappings[closureConnectionKey]['outClosure']['tubesFibres']
                                [`T${getProperty(
                                outCableTube,
                                'TubeNumber',
                            )}:F${getProperty(
                                fibre,
                                'FibreNumber',
                            )}`] = {
                                tubeId: outCableTube.id,
                                fibreId: fibre.id,
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {

        console.error(e)

    }
}


/**
 *
 * @param closureId
 * @param odinDb
 * @param direction
 */
const getUpstreamClosureCableConnection = async (
    closureId: any,
    odinDb: any,
    direction: 'IN' | 'OUT',
    cableType: string,
) => {

    try {

        // get the port seals
        const closureConnections = await getRelatedRecords(
            closureId,
            'Feature',
            [ '\"FeatureConnection\"' ],
            [ '\"SchemaType:CABLE\"' ],
        )

        const inRecords = closureConnections['FeatureConnection'].dbRecords;

        console.log('inRecords', inRecords)
        console.log('cableType', cableType)
        console.log('direction', direction)

        // console.log('inRecords', inRecords)
        const connection = inRecords.find(elem => getProperty(elem, 'Direction') === direction && getProperty(
            elem,
            'CableType',
        ) === cableType);

        if(connection) {

            const cable = await getRecordDetail(
                getProperty(connection, 'CableId'),
                'Feature',
                [],
            )

            return cable;

        }

    } catch (e) {
        console.error(e)
    }


}

/**
 *
 * @param externalRef
 * @param odinDb
 * @param entities
 */
const getOdinRecordByExternalRef = async (
    externalRef: number,
    odinDb: any,
    type: string,
    entities?: string[],
) => {

    const res = await odinDb.query(`
        SELECT r.id, r.type
        FROM db_records r
         LEFT JOIN db_records_columns c ON (c.record_id = r.id and c.column_name = 'ExternalRef')
         WHERE r.type  = '${type}'
         AND r.deleted_at IS NULL
         AND c.value = '${externalRef}'`)

    if(res[0]) {
        return await getRecordDetail(res[0].id, 'Feature', entities || []);
    }

}


/**
 *
 * @param recordIds
 */
const getManyRecordsDetail = async (recordIds: string) => {

    const res = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/many/?ids=${recordIds}`,
        apiToken,
    );

    return res['data'];

}


/**
 *
 * @param recordId
 * @param entityName
 * @param entities
 */
const getRecordDetail = async (recordId: string, entityName: string, entities: string[]) => {

    const res = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/${entityName}/${recordId}?entities=[${entities}]`,
        apiToken,
    );

    return res['data'];

}


/**
 *
 * @param recordId
 * @param featureName
 * @param entities
 * @param filters
 */
const getRelatedRecords = async (
    recordId: string,
    featureName: string,
    entities: string[],
    filters?: string[],
) => {

    const res = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db-associations/${featureName}/${recordId}/relations?entities=[${entities}]&filters=[${filters || []}]`,
        apiToken,
    );

    console.log(`v1.0/db-associations/${featureName}/${recordId}/relations?entities=[${entities}]&filters=[${filters || []}]`)

    return res['data'];

}


/**
 * This will return the next connection info by cableId
 * It will get the other connections for this cable
 *
 * @param cableId
 * @param odinDb
 * @param direction
 * @param cableType
 */
const getNextConnectionByCableIdAndDirection = async (
    cableId: string,
    odinDb: any,
    direction: 'IN' | 'OUT',
    cableType: string,
) => {

    return await odinDb.query(`
        SELECT r.record_number,
               r.type,
               r.entity,
               c.connections
        FROM db_records as r
            LEFT JOIN LATERAL (
                SELECT json_agg(
                       json_build_object(
                           'connId', conn.id,
                           'closureId', closureId.value,
                           'closureType', closureType.value,
                           'closureExt', closureExternalRef.value,
                           'cableId', cableId.value,
                           'cableExt', cableExternalRef.value,
                           'cableType', cableType.value,
                           'direction', direction.value
                          )
                   ) AS connections
                FROM db_records_associations AS a
                    LEFT JOIN db_records as conn on (conn.id = a.child_record_id)
                    LEFT JOIN db_records_columns as direction on (direction.record_id = conn.id and direction.column_name = 'Direction')
                    LEFT JOIN db_records_columns as cableId on (cableId.record_id = conn.id and cableId.column_name = 'CableId')
                    LEFT JOIN db_records_columns as cableExternalRef on (cableExternalRef.record_id = conn.id and cableExternalRef.column_name = 'CableExternalRef')
                    LEFT JOIN db_records_columns as cableType on (cableType.record_id = conn.id and cableType.column_name = 'CableType')
                    LEFT JOIN db_records_columns as closureId on (closureId.record_id = conn.id and closureId.column_name = 'ClosureId')
                    LEFT JOIN db_records_columns as closureExternalRef on (closureExternalRef.record_id = conn.id and closureExternalRef.column_name = 'OutClosureExternalRef')
                    LEFT JOIN db_records_columns as closureType on (closureType.record_id = conn.id and closureType.column_name = 'ClosureType')
                WHERE a.child_entity = 'ProjectModule:FeatureConnection'
                    AND a.parent_record_id = r.id
                    AND conn.type = 'CABLE'
                    AND cableType.value = '${cableType}'
                    AND direction.value IN ('${direction}')
            ) as c on true
        WHERE r.entity = 'ProjectModule:Feature'
        AND r.id = '${cableId}'
        `);
}

execute();

