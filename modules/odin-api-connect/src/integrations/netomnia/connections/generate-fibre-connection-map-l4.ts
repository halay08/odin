import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { FibreConnection } from './types/fibre.connection';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

export interface closureSummary {

    totalL4s: number;

}

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;

let cosmosDb;
let odinDb;

let featureModels;

let connections: FibreConnection[] = [];
let fibreMappings = []
let fibresUsed = [];

let argSetTrayModels = process.argv.find(arg => arg.indexOf('configtrays') > -1);
let configtrays = argSetTrayModels ? argSetTrayModels.split('=')[1] : null;

let argL2PolygonId = process.argv.find(arg => arg.indexOf('l2polyid') > -1);
let l2Polygonid = argL2PolygonId ? argL2PolygonId.split('=')[1] : null;

let argL4ClosureId = process.argv.find(arg => arg.indexOf('l4id') > -1);
let l4ClosureId = argL4ClosureId ? argL4ClosureId.split('=')[1] : null;

let argDryRun = process.argv.find(arg => arg.indexOf('dryrun') > -1);
let dryRun = argDryRun ? argDryRun.split('=')[1] : null;

let startingTubeFibre = 'T1:F1';
let searchNextTubeFibre = 'T1:F1';
let searchNextTubeFibreOverride;

let searchedFibreKeys = []

async function execute() {


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

    try {

        let l4ClosureIds = l4ClosureId ? [ l4ClosureId ] : [];

        if(l2Polygonid) {

            const ids = await cosmosDb.query(`SELECT ftth.closure.id
                FROM ftth.closure, ftth.polygon
                WHERE ftth.polygon.id = ${l2Polygonid}
                 AND CASE
                    WHEN ST_GeometryType(ftth.closure.geometry) <> 'ST_MultiCurve'
                        THEN ST_Intersects(ftth.closure.geometry, ftth.polygon.geometry)
                    WHEN ST_GeometryType(ftth.closure.geometry) = 'ST_MultiCurve'
                        THEN ST_Intersects(ST_CurveToLine(ftth.closure.geometry), ftth.polygon.geometry)
                END
            `);

            if(ids[0]) {
                l4ClosureIds = ids.map(elem => elem['id'])
            }

        }

        const closuresNoConnections = await getAllClosuresWithNoFibreConnections(l4ClosureIds)

        featureModels = await getAllRecordsByEntity('ProjectModule', 'FeatureModel', 'TRAY');

        console.log('LENGTH', closuresNoConnections.length)

        if(!configtrays) {

            for(const closure of closuresNoConnections) {

                // trace and map a fibre connection
                await createFibreConnectionMappings(closure.id)

                connections = []
                fibreMappings = []
            }
        }

        cosmosDb.close();
        odinDb.close();

    } catch (e) {
        console.error(e);
    }

}


// Connection set 1
// - Loop cable -> True to Loop cable -> False (create connections)
// - Non loop cable -> find next available fibre for the upstream In cable
// repeat (find next available fibre and (create connection)

/**
 * Flow start 1
 * @param closureId
 * @param odinDb
 */
async function createFibreConnectionMappings(closureId: string) {

    console.log('----------------------------------')
    console.log('CREATE_FIBRE_MAPPINGS')
    console.log('----------------------------------')

    // reset the fibre mappings
    fibreMappings = []

    // starting closure "In" cable
    const inCable = await getInCableByClosureId(closureId)
    const inCableId = inCable[0]['cable_id']

    // get the in cables for the closure
    const { inClosure, inClosureType } = await getDownStreamClosureDetailsByCableId(inCableId)

    // get the fibre from the loop cable that is UNUSED
    const cableFibres = await getAvailableFibreByCableId(inCableId)
    const firstFibre = cableFibres.find(elem => elem['fiber_state'] === null)
    console.log('LOOP_FIBRE', firstFibre)


    if(firstFibre) {

        const tubeFibreKey = constructTubeFibreKey(firstFibre['tube_number'], firstFibre['fiber_number'])

        // reset the starting tube and fibre and set the default searchNextTube to be the same
        startingTubeFibre = tubeFibreKey
        searchNextTubeFibre = searchNextTubeFibreOverride ? searchNextTubeFibreOverride : tubeFibreKey

        console.log('----FROM_CLOSURE:   ', inClosure['from_closure_ext_ref'])
        console.log('----IN_CABLE:       ', inClosure['in_cable_ext_ref_from_closure'])
        console.log('----IN_CABLE_FIBER: ', tubeFibreKey)

        // this will recursively trace from the inCable and closure to the L2
        await goToNextClosure(inCableId, 'L2', inClosureType, 'IN', closureId, firstFibre)

        // reset any params that are no needed after the mappings is created

        searchNextTubeFibreOverride = null
        searchedFibreKeys = []

        const clonedMapping = [ ...fibreMappings ];

        // we want to filter out any fibres that are null and L2
        const usedFibreIds = [
            ...clonedMapping.filter(elem => elem.fibreInId && elem.upstreamClosureType !== 'L2').map(elem => elem.fibreInId),
            ...clonedMapping.filter(elem => elem.fibreOutId && elem.upstreamClosureType !== 'L2').map(elem => elem.fibreOutId),
        ]

        fibresUsed.push(...usedFibreIds)

        console.log('_MAPPINGS', fibreMappings)

        await createFibreConnections(fibreMappings, usedFibreIds)
    }

}


/**
 * Creats a string T1:F1
 *
 * @param tubeNumber
 * @param fibreNumber
 */
function constructTubeFibreKey(tubeNumber: any, fibreNumber: any) {

    return `T${tubeNumber}:F${fibreNumber}`

}


/**
 * When the closure has a loop cable
 */
async function handleLoopCableConnections(
    cableId: string,
    traceTo: string,
    closureType: string,
    isLoop: string,
    startClosureId: string,
    firstFibre?: string,
) {

    console.log('----------------------------------')
    console.log('HANDLE_LOOP_CABLE_CONNECTIONS')
    console.log('----------------------------------')
    // console.log({ cableId, traceTo, closureType, isLoop })

    await getNextAvailableFibreUpstreamCable(cableId, 'L2', isLoop, 'IN', startClosureId, firstFibre)

}

/**
 * When the closure does not have a loop cable
 * We need to handle splicing fibres off the loop cable
 */
async function handleNonLoopCableConnections(
    cableId: string,
    traceTo: string,
    closureType: string,
    isLoop: string,
    startClosureId: string,
    firstFibre?: string,
) {

    console.log('----------------------------------')
    console.log('HANDLE_NON_LOOP_CABLE_CONNECTIONS')
    console.log('----------------------------------')
    // console.log({ cableId, traceTo, closureType, isLoop })

    await getNextAvailableFibreUpstreamCable(cableId, 'L2', isLoop, 'IN', startClosureId, firstFibre)

}

/**
 *
 * @param cableId
 * @param traceTo
 * @param isLoop
 * @param direction
 */
async function getNextAvailableFibreUpstreamCable(
    cableId: string,
    traceTo: string,
    isLoop: string,
    direction: 'IN' | 'OUT',
    startClosureId: string,
    firstFibre?: string,
) {

    console.log('cableId', cableId, 'direction', direction);


    // get the in cables for the closure
    const { upstreamClosure, upstreamClosureType, upstreamClosureInCables } = await getUpstreamClosureDetailsByCableId(
        cableId)
    const firstInCable = upstreamClosureInCables[0]
    // console.log('___UPSTREAM_CLOSURE', upstreamClosure)
    // console.log('___BEFORE', startingTubeFibre)
    // console.log('___UPSTREAM_IN_CABLE', firstInCable)

    console.log('TO_CLOSURE', { upstreamClosure, upstreamClosureType, upstreamClosureInCables, searchNextTubeFibre })


    if(firstInCable) {

        let matchingFibreOut

        if(firstFibre) {

            // if we are starting from the L4 closure we set the initial fibre T1:F1
            matchingFibreOut = firstFibre

        } else {
            // any subsequent traces through this function we want to match the same tube
            // and fibre of the loop cables
            const cableFibresDownstream = await getAvailableFibreByCableId(cableId)
            // console.log('cableFibresDownstream', cableFibresDownstream)
            if(isLoop) {
                matchingFibreOut = cableFibresDownstream.find(fibre => constructTubeFibreKey(
                    fibre['tube_number'],
                    fibre['fiber_number'],
                ) === searchNextTubeFibre && fibre['fiber_state'] === null)
            } else {
                // if it is not a loop cable then find the next available fibre
                matchingFibreOut = cableFibresDownstream.find(fibre => fibre['fiber_state'] === null)
            }
        }

        console.log('_MATCHING_FIBRE_DOWN', matchingFibreOut)

        // get the upstream fibres
        const cableFibres = await getAvailableFibreByCableId(firstInCable['cable_id'])
        const matchingFibreIn = cableFibres.find(fibre => constructTubeFibreKey(
            fibre['tube_number'],
            fibre['fiber_number'],
        ) === searchNextTubeFibre && fibre['fiber_state'] === null)

        console.log('_MATCHING_FIBRE_UP', matchingFibreIn)

        // we only want to trace up to search for a new fibre path up to the last L3
        // the reaason being is that the L2 requires splitters
        if(!matchingFibreIn && upstreamClosureType !== 'L2') {

            console.log('searchedFibreKeys', searchedFibreKeys)

            const nextFibre = cableFibres.find(fibre => !searchedFibreKeys.includes(constructTubeFibreKey(
                fibre['tube_number'],
                fibre['fiber_number'],
            )) && !fibre['fiber_state'])
            console.log('NEXT_FIBRE', nextFibre)

            if(nextFibre) {

                const tubeFibreKey = constructTubeFibreKey(nextFibre['tube_number'], nextFibre['fiber_number'])

                searchedFibreKeys.push(tubeFibreKey)

                searchNextTubeFibreOverride = tubeFibreKey

                // TODO: We want to start over from the start closure
                await createFibreConnectionMappings(startClosureId)

            }

        } else if(matchingFibreIn && upstreamClosureType !== 'L2') {

            // get the upstream fibre connections
            const fibreConnections = await getFibreConnectionsByFibreId(matchingFibreIn['fiber_id'])
            const fibreConnection = fibreConnections.find(elem => elem['cable_in'] === firstInCable['cable_id'])

            console.log('_FIBRE_CONNECTION_UPSTREAM', fibreConnection)

            const tubeFibreKeyIn = constructTubeFibreKey(
                matchingFibreIn['tube_number'],
                matchingFibreIn['fiber_number'],
            )
            const tubeFibreKeyOut = constructTubeFibreKey(
                matchingFibreOut['tube_number'],
                matchingFibreOut['fiber_number'],
            )


            if(fibreConnection) {

                // This is where we need to set the cable direction

                // If the upstream in cable === the fibre connection in cable (non-loop)
                // if the upstream in cable !== the fibre connection in cable (loop)
                console.log('_GET_CABLE_CONNECTION', fibreConnection[`cable_${direction}`.toLowerCase()], direction)

                const cableConnection = await getCableConnectionsByCableId(
                    fibreConnection[`cable_${direction}`.toLowerCase()],
                    direction,
                )
                const connection = cableConnection[0];

                console.log('_CABLE_CONNECTION', connection)

                console.log('----TO_CLOSURE:   ', fibreConnection['closure_to_ext_ref'])
                console.log('----IN_CABLE_C:   ', fibreConnection['in_cable_ext_ref_to_closure'])
                console.log('----IN_CABLE_FIBER: ', tubeFibreKeyIn)

                // this is the upstream fibre mapping
                fibreMappings.push({
                    isLoop: connection['is_loop'] === 'true',
                    fibreConnectionId: fibreConnection['id'],
                    fibreState: matchingFibreIn['fiber_state'],
                    // upstream closure parameters
                    upstreamClosureType,
                    tubeFibreKeyIn,
                    closureInExt: upstreamClosure['to_closure_ext_ref'],
                    closureId: upstreamClosure['closure_id'],
                    cableInId: connection['cable_id'],
                    cableInExt: connection['cable_external_ref'],
                    fibreInId: matchingFibreIn['fiber_id'],
                    tubeInId: matchingFibreIn['tube_id'],
                    // downstream closure parameters
                    tubeFibreKeyOut,
                    closureOutExt: upstreamClosure['from_closure_ext_ref'],
                    cableOutExt: upstreamClosure['in_cable_ext_ref_from_closure'],
                    fibreOutId: matchingFibreOut['fiber_id'],
                    tubeOutId: matchingFibreOut['tube_id'],
                    cableOutId: matchingFibreOut['cable_id'],
                })

                // console.log('_CABLE_CONNECTION', connection)

            } else {

                // get the in and out cable if there is no fibre connection
                const cableConnection = await getCableConnectionsByCableId(firstInCable['cable_id'], direction)
                const connection = cableConnection[0];

                console.log('----TO_CLOSURE:   ', connection['from_closure_ext_ref'])
                console.log('----IN_CABLE:       ', firstInCable['in_cable_ext_ref_from_closure'])
                console.log('----IN_CABLE_FIBER: ', tubeFibreKeyIn)

                // this is the upstream fibre mapping
                // the matching fibre is the upstream match which is the IN for the connection
                // and the OUT for the downstream connection
                // this fibre connection is created in the upstream closure
                fibreMappings.push({
                    isLoop: connection['is_loop'] === 'true',
                    fibreConnectionId: null,
                    fibreState: matchingFibreIn['fiber_state'],
                    // upstream closure parameters
                    tubeFibreKeyIn,
                    upstreamClosureType,
                    closureInExt: upstreamClosure['to_closure_ext_ref'],
                    closureId: upstreamClosure['closure_id'],
                    cableInId: connection['cable_id'],
                    cableInExt: connection['cable_external_ref'],
                    fibreInId: matchingFibreIn['fiber_id'],
                    tubeInId: matchingFibreIn['tube_id'],
                    // downstream
                    tubeFibreKeyOut,
                    closureOutExt: upstreamClosure['from_closure_ext_ref'],
                    cableOutExt: upstreamClosure['in_cable_ext_ref_from_closure'],
                    fibreOutId: matchingFibreOut['fiber_id'],
                    tubeOutId: matchingFibreOut['tube_id'],
                    cableOutId: matchingFibreOut['cable_id'],
                })

            }

            if(upstreamClosureType !== traceTo) {

                await goToNextClosure(firstInCable['cable_id'], traceTo, upstreamClosureType, direction, startClosureId)

            }

        }
    }

}

/**
 *
 * @param cableId
 */
async function getDownStreamClosureDetailsByCableId(cableId: any) {

    const inClosure = await getClosureByCableIdAndDirection(cableId, 'IN')
    const closure = inClosure[0];

    // get the IN loop cable by closure id
    const inClosureInCables = await getInCableByClosureId(closure['closure_id'])

    const inClosureTypeColumn = await getClosureTypeByClosureId(closure['closure_id'])
    const inClosureType = inClosureTypeColumn[0]['label']

    return {

        inClosure: closure,
        inClosureInCables,
        inClosureType,

    };

}

/**
 *
 * @param cableId
 */
async function getUpstreamClosureDetailsByCableId(cableId: any) {

    const upstreamClosure = await getClosureByCableIdAndDirection(cableId, 'OUT')
    const closure = upstreamClosure[0];

    if(closure) {
        // get the IN loop cable by closure id
        const upstreamClosureInCables = await getInCableByClosureId(closure['closure_id'])

        const upstreamClosureTypeColumn = await getClosureTypeByClosureId(closure['closure_id'])
        const upstreamClosureType = upstreamClosureTypeColumn[0]['label']

        return {

            upstreamClosure: closure,
            upstreamClosureInCables,
            upstreamClosureType,

        };

    }

    return {

        upstreamClosure: undefined,
        upstreamClosureInCables: [],
        upstreamClosureType: undefined,

    };

}

/**
 *
 * @param cableId
 * @param odinDb
 * @param tubeFibre
 */
async function goToNextClosure(
    cableId: string,
    traceTo: string,
    closureType: string,
    direction,
    startClosureId: string,
    firstFibre?: any,
) {

    // get the cable connection
    const cableConnection = await getCableConnectionsByCableId(cableId, direction)
    const connection = cableConnection[0];

    if(connection) {

        if(connection['is_loop'] === 'false') {

            await handleNonLoopCableConnections(
                cableId,
                traceTo,
                closureType,
                connection['is_loop'],
                startClosureId,
                firstFibre,
            )

        } else if(connection['is_loop'] === 'true') {

            await handleLoopCableConnections(
                cableId,
                traceTo,
                closureType,
                connection['is_loop'],
                startClosureId,
                firstFibre,
            )

        }

    }

}


/**
 *
 * @param fibreMappings
 */
async function createFibreConnections(fibreMappings: any, usedFibreIds: any) {

    const filtered = fibreMappings.filter(elem => elem.upstreamClosureType !== 'L2')

    const remainingL3s = filtered.filter(elem => elem.upstreamClosureType === 'L3')

    // if there are L3s without fibre connections we need to create connections
    for(const mapping of remainingL3s) {

        // We want to check if we are splicing an L3 to an L3
        // when the down stream fibreOut is null that means it is not a continuation of the upstream
        // loop cable and we want to delete it.
        // TODO: A more robust verification condition should be set here
        if(mapping['fibreConnectionId']) {

            if(!dryRun) {
                const deleteRes = await deleteRecord('FeatureConnection', mapping['fibreConnectionId'])
                console.log('deleteRes', deleteRes)
            }
        }

        // create a new connection in the upstream closure and connect the downstream fibre as the OUT
        // only create the connection if the fibreOut is null
        const connectionDetails = {

            outClosureId: mapping['closureId'],
            closureOutExt: mapping['closureOutExt'],  // the OUT Closure from the upstream closure
            cableOutExternalRef: mapping['cableOutExt'], // the OUT Cable of the upstream closure
            tubeFibreOut: mapping['tubeFibreKeyOut'], // this is the OUT fibre of the upstream closure
            tubeOutId: mapping['tubeOutId'],
            fibreOutId: mapping['fibreOutId'],
            cableOutId: mapping['cableOutId'],
            cableInExternalRef: mapping['cableInExt'], // the IN Cable of the upstream closure
            closureInExt: mapping['closureInExt'],  // the IN Closure of the upstream closure
            cableInId: mapping['cableInId'],
            tubeFibreIn: mapping['tubeFibreKeyIn'],
            tubeInId: mapping['tubeInId'],
            fibreInId: mapping['fibreInId'],

        }

        console.log('connectionDetails', connectionDetails)

        await parseFibreConnection(connectionDetails);


    }

    if(connections && connections.length > 0) {
        // Create connections
        for(const connection of connections) {
            console.log('_CREATE_CONNECTION', connection)

            if(!dryRun) {
                await createFibreConnection(connection)
            }
        }


        // Update the fibre status if we have an upstream closure to create a connection with
        for(const fibreId of usedFibreIds) {

            const newRecord = new DbRecordCreateUpdateDto()
            newRecord.entity = 'ProjectModule:FeatureComponent'
            newRecord.type = 'FIBRE'
            newRecord.properties = {
                FibreState: 'USED',
            }

            console.log('UPDATE_REQUEST____________', newRecord)
            if(!dryRun) {
                const updateRes = await updateRecord(
                    'FeatureComponent',
                    fibreId,
                    newRecord,
                )
                console.log('updateRes', updateRes)
            }
        }
    }

}


/**
 *
 * @param connectionDetails
 */
async function parseFibreConnection(connectionDetails: any, slotNumber?: number) {

    console.log('----------------------------------')
    console.log('CREATE_CONNECTIONS')
    console.log('----------------------------------')

    const startingSlotNumber = slotNumber ? slotNumber : 1;

    console.log('connectionDetails', connectionDetails)

    const slots = await getSlotsByClosureId(connectionDetails['outClosureId'])
    const slot = slots.find(elem => Number(elem['slot_number']) === startingSlotNumber)
    console.log('_SLOTS', slots)
    console.log('_SELECTED_SLOT', slot)

    // get the next available slot

    if(slot) {

        // add tray models to the slot
        const trayModel = await addTrayModelToSlot(slot, 'fist72:standard:12');

        let trays;

        let noTrayChecks = 0

        while (!trays) {

            console.log('noTrayChecks', noTrayChecks)
            // run this again after 300 checks
            if(noTrayChecks > 300) {

                noTrayChecks = 0
                // delete the slot tray model if one exists then re-create it
                await parseFibreConnection(connectionDetails)
            }

            noTrayChecks += 1

            console.log('connectionDetails[\'outClosureId\']', connectionDetails['outClosureId'])
            const slots = await getSlotsByClosureId(connectionDetails['outClosureId'])
            const slot = slots.find(elem => Number(elem['slot_number']) === startingSlotNumber)
            trays = slot['trays']

            if(trays) {

                let splices;
                let nextSplice;
                let tray = {};

                // because splices are created from the queue it might take a few seconds for them to create
                // keep tyring to get them
                while (!splices) {
                    // if there is no splice available in the tray

                    console.log('WAITING_FOR_SPLICES_TO_BE_CREATED')
                    console.log('_TRAYS', slot['trays'])
                    const trays = await getSplicesByTrayId(slot['trays'][0].id);
                    tray = trays[0];

                    console.log('_SELECTED_TRAY', tray)
                    if(tray['splices']) {

                        splices = tray['splices']

                        // sort the splices in ascending order 1 -> 12+
                        const sortedSplices = tray['splices'] ? tray['splices'].sort((
                            a,
                            b,
                        ) => Number(a['splice_number']) - Number(b['splice_number'])) : null

                        // find the first available splice
                        const nextAvailableSplice = sortedSplices.find(elem => elem.connections === null)
                        console.log('nextAvailableSplice', nextAvailableSplice);

                        nextSplice = nextAvailableSplice;

                        console.log('_HAS_NEXT_SPLICE', nextSplice)
                    }
                }

                if(!nextSplice) {
                    // search the next slot no splices are available
                    await parseFibreConnection(connectionDetails, startingSlotNumber + 1)
                } else {

                    console.log('CREATING_NEW_CONNECTION')

                    // create a new  connection
                    const connection = new FibreConnection();
                    connection.closureId = connectionDetails['outClosureId'];
                    connection.slotId = slot.id;
                    connection.trayModelId = trayModel.id;
                    connection.trayId = tray['tray_id'];
                    connection.trayInId = tray['tray_id'];
                    connection.trayOutId = tray['tray_id'];
                    connection.traySpliceId = nextSplice.id;
                    connection.traySplitterId = null;
                    connection.inClosureExt = connectionDetails['closureInExt'];
                    connection.outClosureExt = connectionDetails['closureOutExt'];
                    connection.cableInId = connectionDetails['cableInId'];
                    connection.cableInExternalRef = connectionDetails['cableInExternalRef'];
                    connection.tubeFibreIn = connectionDetails['tubeFibreIn'];
                    connection.tubeInId = connectionDetails['tubeInId'];
                    connection.fibreInId = connectionDetails['fibreInId'];
                    connection.tubeFibreOut = connectionDetails['tubeFibreOut'];
                    connection.cableOutId = connectionDetails['cableOutId'];
                    connection.cableOutExternalRef = connectionDetails['cableOutExternalRef'];
                    connection.tubeOutId = connectionDetails['tubeOutId'];
                    connection.fibreOutId = connectionDetails['fibreOutId'];

                    connections.push(connection)

                    return

                }
            }
        }
    }
}

/**
 *
 *
 * @param closureId
 * @param odinDb
 */
const getInCableByClosureId = async (closureId: string) => {

    return await odinDb.query(`
        select
            r.entity,
            r.type,
            c.value as is_loop,
            c1.value as direction,
            c2.value as cable_id,
            c4.value as from_closure_ext_ref,
            c3.value as in_cable_ext_ref_from_closure,
            c5.value as to_closure_ext_ref
        from db_records r
            left join db_records_columns as c on (c.record_id = r.id and c.column_name = 'IsLoop')
            left join db_records_columns as c1 on (c1.record_id = r.id and c1.column_name = 'Direction')
            left join db_records_columns as c2 on (c2.record_id = r.id and c2.column_name = 'CableId')
            left join db_records_columns as c3 on (c3.record_id = r.id and c3.column_name = 'CableExternalRef')
            left join db_records_columns as c4 on (c4.record_id = r.id and c4.column_name = 'OutClosureExternalRef')
            left join db_records_columns as c5 on (c5.record_id = r.id and c5.column_name = 'InClosureExternalRef')
        where r.entity = 'ProjectModule:FeatureConnection'
            and r.type = 'CABLE'
            and c1.value = 'IN'
            and r.deleted_at IS NULL
            and exists (
                select * from db_records_associations a
                where a.child_entity = 'ProjectModule:FeatureConnection'
                and a.parent_record_id = '${closureId}'
                and a.child_record_id = r.id
                and a.deleted_at IS NULL
            )
        `);
}

/**
 *
 *
 * @param closureId
 * @param odinDb
 */
const getClosureByCableIdAndDirection = async (cableId: string, direction: 'IN' | 'OUT') => {

    return await odinDb.query(`
        select
            r.entity,
            r.type,
            c2.value as closure_id,
            c4.value as to_closure_ext_ref,
            c3.value as in_cable_ext_ref_from_closure,
            c5.value as from_closure_ext_ref
        from db_records r
            left join db_records_columns as c on (c.record_id = r.id and c.column_name = 'IsLoop')
            left join db_records_columns as c1 on (c1.record_id = r.id and c1.column_name = 'Direction')
            left join db_records_columns as c2 on (c2.record_id = r.id and c2.column_name = 'ClosureId')
            left join db_records_columns as c3 on (c3.record_id = r.id and c3.column_name = 'CableExternalRef')
            left join db_records_columns as c4 on (c4.record_id = r.id and c4.column_name = 'OutClosureExternalRef')
            left join db_records_columns as c5 on (c5.record_id = r.id and c5.column_name = 'InClosureExternalRef')
        where r.entity = 'ProjectModule:FeatureConnection'
            and r.type = 'CABLE'
            and c1.value = '${direction}'
            and r.deleted_at IS NULL
            and exists (
                select * from db_records_associations a
                where a.child_entity = 'ProjectModule:FeatureConnection'
                and a.parent_record_id = '${cableId}'
                and a.child_record_id = r.id
                and a.deleted_at IS NULL
            )
        `);
}

/**
 * This will return the next connection info by fibreId
 *
 * @param fibreId
 */
const getFibreConnectionsByFibreId = async (fibreId: string) => {

    return await odinDb.query(`
      select
         a.parent_entity,
         a.child_entity,
         cr.id,
         cr.type,
         c.value as tube_fiber_in,
         c1.value as tube_fiber_out,
         c2.value as cable_out,
         c3.value as cable_in,
         c4.value as fiber_in_id,
         c7.value as fiber_state,
         c8.value as fiber_out_id,
         c9.value as tube_in_id,
         c10.value as tube_out_id,
         c6.value as in_cable_ext_ref_to_closure,
         c11.value as closure_to_ext_ref,
         c5.value as in_cable_ext_ref_from_closure,
         c12.value as closure_from_ext_ref
        from db_records_associations a
         left join db_records cr on (a.parent_record_id = cr.id)
         left join db_records_columns c on (c.record_id = cr.id and c.column_name = 'TubeFibreIn')
         left join db_records_columns c1 on (c1.record_id = cr.id and c1.column_name = 'TubeFibreOut')
         left join db_records_columns c2 on (c2.record_id = cr.id and c2.column_name = 'CableOutId')
         left join db_records_columns c3 on (c3.record_id = cr.id and c3.column_name = 'CableInId')
         left join db_records_columns c4 on (c4.record_id = cr.id and c4.column_name = 'FibreInId')
         left join db_records_columns c5 on (c5.record_id = cr.id and c5.column_name = 'CableOutExternalRef')
         left join db_records_columns c6 on (c6.record_id = cr.id and c6.column_name = 'CableInExternalRef')
         left join db_records_columns c7 on (c7.record_id = c4.value::uuid and c7.column_name = 'FibreState')
         left join db_records_columns c8 on (c8.record_id = cr.id and c8.column_name = 'FibreOutId')
         left join db_records_columns c9 on (c9.record_id = cr.id and c9.column_name = 'TubeInId')
         left join db_records_columns c10 on (c10.record_id = cr.id and c10.column_name = 'TubeOutId')
         left join db_records_columns c11 on (c11.record_id = cr.id and c11.column_name = 'OutClosureExternalRef')
         left join db_records_columns c12 on (c12.record_id = cr.id and c12.column_name = 'InClosureExternalRef')
        where a.child_record_id = '${fibreId}'
        and cr.entity = 'ProjectModule:FeatureConnection'
        and cr.type = 'FIBRE'
        and a.deleted_at IS NULL
        and c7.value IS NULL
        order by c.value asc
        `);
}


/**
 * This will return the next connection info by cableId
 * It will get the other connections for this cable
 *
 * @param cableId
 * @param direction
 */
const getCableConnectionsByCableId = async (cableId: string, direction: 'IN' | 'OUT') => {

    return await odinDb.query(`
        select
        r.entity,
        r.type,
        c.value as is_loop,
        c1.value as direction,
        c2.value as cable_id,
        c4.value as from_closure_ext_ref,
        c5.value as cable_external_ref,
        c3.value as to_closure_ext_ref
        from db_records r
        left join db_records_columns as c on (c.record_id = r.id and c.column_name = 'IsLoop')
        left join db_records_columns as c1 on (c1.record_id = r.id and c1.column_name = 'Direction')
        left join db_records_columns as c2 on (c2.record_id = r.id and c2.column_name = 'CableId')
        left join db_records_columns as c3 on (c3.record_id = r.id and c3.column_name = 'OutClosureExternalRef')
        left join db_records_columns as c4 on (c4.record_id = r.id and c4.column_name = 'InClosureExternalRef')
        left join db_records_columns as c5 on (c5.record_id = r.id and c5.column_name = 'CableExternalRef')
        where r.entity = 'ProjectModule:FeatureConnection'
        and r.type = 'CABLE'
        and c1.value = '${direction}'
        and r.deleted_at IS NULL
        and exists (
            select * from db_records_associations a
            where a.child_entity = 'ProjectModule:FeatureConnection'
            and a.parent_record_id = '${cableId}'
            and a.child_record_id = r.id
            and a.deleted_at IS NULL
        )
      `);
}


/**
 * This will return the next connection info by cableId
 * It will get the other connections for this cable
 *
 * @param cableId
 * @param direction
 */
const getAvailableFibreByCableId = async (cableId: string) => {

    return await odinDb.query(`
        select
        a.parent_record_id as cable_id,
        cra.id as tube_id,
        crac1.value as tube_number,
        crb.id as fiber_id,
        crbc1.value as fiber_number,
        crbc2.value as fiber_state
        from db_records_associations a
        left join db_records cra on (a.child_record_id = cra.id and cra.type = 'CABLE_TUBE')
        left join db_records_columns as crac1 on (crac1.record_id = cra.id and crac1.column_name = 'TubeNumber')
        left join db_records_associations b on (b.parent_record_id = cra.id and b.child_entity = 'ProjectModule:FeatureComponent')
        left join db_records crb on (b.child_record_id = crb.id and crb.type = 'TUBE_FIBRE')
        left join db_records_columns as crbc1 on (crbc1.record_id = crb.id and crbc1.column_name = 'FibreNumber')
        left join db_records_columns as crbc2 on (crbc2.record_id = crb.id and crbc2.column_name = 'FibreState')
        where a.parent_record_id = '${cableId}'
        and cra.type = 'CABLE_TUBE'
        and crb.type = 'TUBE_FIBRE'
        and a.deleted_at IS NULL
        order by crac1.value::integer, crbc1.value::integer asc
        `);
}

/**
 * This will return the next connection info by cableId
 * It will get the other connections for this cable
 *
 * @param cableId
 * @param direction
 */
const getClosureTypeByClosureId = async (closureId: string) => {

    return await odinDb.query(`
        select c1.column_name, sco.label
        from db_records r
        left join db_records_columns as c1 on (c1.record_id = r.id and c1.column_name = 'ClosureType')
        left join schemas_columns_options as sco on (sco.column_id = c1.column_id and sco.value = c1.value)
        where r.id = '${closureId}'
        and r.deleted_at is null
      `);
}

/**
 *
 *
 * @param closureId
 * @param odinDb
 */
async function getSlotsByClosureId(closureId: string) {

    return await odinDb.query(`
        select
        a.parent_entity,
        a.child_entity,
        cra.id,
        cra.type,
        cra1.value as slot_number,
        d.trays
        from db_records_associations a
        left join db_records cra on (a.child_record_id = cra.id)
        left join db_records_columns as cra1 on (cra1.record_id = cra.id and cra1.column_name = 'SlotNumber')
        left join lateral(
          select
          json_agg(
          json_build_object(
          'id', crb.id,
          'type', crb.type
           )
          ) as trays
          from db_records_associations c
            left join db_records crb on (c.child_record_id = crb.id)
          where c.child_entity = 'ProjectModule:FeatureComponent'
          and c.parent_record_id = cra.id
          and c.deleted_at IS NULL
          and crb.type = 'SLOT_TRAY'
        ) as d on true
        where a.parent_record_id = '${closureId}'
        and cra.type = 'CLOSURE_SLOT'
        and a.deleted_at IS NULL
        order by cra1.value::integer asc
    `)
}


/**
 *
 * @param trayId
 */
async function getSplicesByTrayId(trayId: string) {
    return await odinDb.query(`
        select
            a.id as tray_id,
            d.splices
        from db_records a
            left join lateral(
            select
              json_agg(
              json_build_object(
                  'id', crb.id,
                  'type', crb.type,
                  'splice_number', crb1.value,
                  'connections', e.connections
               )
              ) as splices
              from db_records_associations b
            left join db_records crb on (b.child_record_id = crb.id)
            left join db_records_columns as crb1 on (crb1.record_id = crb.id and crb1.column_name = 'SpliceNumber')
            left join lateral(
              select
              json_agg(
              json_build_object(
                  'id', crc.id,
                  'type', crc.type
               )
              ) as connections
              from db_records_associations c
                left join db_records crc on (c.parent_record_id = crc.id)
              where c.parent_entity = 'ProjectModule:FeatureConnection'
              and crc.type = 'FIBRE'
              and c.child_record_id = b.child_record_id
              and c.deleted_at IS NULL
            ) as e on true
              where b.child_entity = 'ProjectModule:FeatureComponent'
              and b.parent_record_id = a.id
              and b.deleted_at IS NULL
              and crb.type = 'TRAY_SPLICE'
            ) as d on true
        where a.id = '${trayId}'
        and a.deleted_at IS NULL
    `)
}


/**
 *
 1    "L0"
 2    "L1"
 3    "L2"
 4    "L3"
 5    "L4"
 */
async function getAllClosuresWithNoFibreConnections(l4ClosureIds: string[]) {

    return await odinDb.query(`
        select
        db_records.id,
        c.value,
        c1.value
        from db_records
        left join db_records_columns as c on (c.record_id = db_records.id and c.column_name = 'ExternalRef')
        left join db_records_columns as c1 on (c1.record_id = db_records.id and c1.column_name = 'ClosureType')
        where db_records.entity = 'ProjectModule:Feature'
        and db_records.type = 'CLOSURE'
        and c1.value IN ('5')
        ${l4ClosureIds ? `and c.value IN (${l4ClosureIds.map(elem => `'${elem}'`)})` : 'and c.value IS NOT NULL'}
        and db_records.deleted_at IS NULL
        and exists (
            select * from db_records_associations a
            left join db_records as r on (r.id = a.child_record_id)
            where a.child_entity = 'ProjectModule:FeatureConnection'
            and a.parent_record_id = db_records.id
            and a.deleted_at IS NULL
            and r.type = 'CABLE'
        )
        and not exists (
            select * from db_records_columns c1
            left join db_records as r on (r.id = c1.record_id)
            where r.entity = 'ProjectModule:FeatureConnection'
            and r.type = 'FIBRE'
            and c1.column_name = 'OutClosureExternalRef'
            and c1.value  = c.value
            and c1.deleted_at IS NULL
        )
        order by c.value::integer asc
    `)
}

/**
 *
 * @param odinDb
 * @param moduleName
 * @param entityName
 * @param schemaType
 */
async function getAllRecordsByEntity(
    moduleName: string,
    entityName: string,
    schemaType: string,
) {

    const res = await odinDb.query(`
        SELECT id, title
        FROM db_records r
        WHERE r.entity = '${moduleName}:${entityName}'
        AND r.deleted_at IS NULL
        AND r.type = '${schemaType}'`)

    return await getManyRecordsDetail(res.map(elem => elem.id).join());

}

/**
 *
 * @param recordIds
 */
async function getManyRecordsDetail(recordIds: string) {

    const res = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/many/?ids=${recordIds}`,
        apiToken,
    );

    console.log('getManYRecords', res)

    return res['data'];

}

/**
 *
 * @param recordId
 * @param entityName
 * @param body
 */
export const createAssociation = async (
    recordId: string,
    entityName: string,
    body: DbRecordAssociationCreateUpdateDto[],
) => {

    const res = await httpClient.postRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db-associations/${entityName}/${recordId}`,
        apiToken,
        body,
    );
    console.log(`v1.0/db-associations/${entityName}/${recordId}`)

    return res['data'];

}

/**
 *
 * @param recordId
 * @param entityName
 * @param body
 */
const updateRecord = async (
    entityName: string,
    recordId: string,
    body: DbRecordCreateUpdateDto,
) => {


    console.log('`v1.0/db/${entityName}/${recordId}`', `v1.0/db/${entityName}/${recordId}`)
    const res = await httpClient.putRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/${entityName}/${recordId}`,
        apiToken,
        body,
    );
    console.log('updateRecord', res['data'])

    return res['data'];

}

/**
 *
 * @param externalRef
 * @param odinDb
 * @param entities
 */
export const getOdinRecordByExternalRef = async (externalRef: number, odinDb: any, entityName: string) => {

    const res = await odinDb.query(`
                        SELECT r.id, r.type
                        FROM db_records r
                         LEFT JOIN db_records_columns c ON (c.record_id = r.id and c.column_name = 'ExternalRef')
                         WHERE r.type  = '${entityName}'
                         AND r.deleted_at IS NULL
                         AND c.value = '${externalRef}'`)

    return res[0]

}


/**
 * Adds a seal model to a port in the closure
 * which will create seal interfaces for the port
 *
 * @param slot
 * @param name
 */
async function addTrayModelToSlot(
    slot: DbRecordEntityTransform,
    name: string,
): Promise<DbRecordEntityTransform> {

    const slotModel = featureModels.find(elem => elem.title === name);
    console.log('slotModel', slotModel);

    const createRel = new DbRecordAssociationCreateUpdateDto()
    createRel.recordId = slotModel.id;

    const newAssociation = await createAssociation(
        slot.id,
        'FeatureModel',
        [ createRel ],
    );
    console.log('newAssociation', newAssociation);
    return slotModel;
}

/**
 *
 * @param recordId
 * @param entityName
 * @param body
 */
const deleteRecord = async (
    entityName: string,
    recordId: string,
) => {


    try {
        const res = await httpClient.deleteRequest(
            Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
            `v1.0/db/${entityName}/${recordId}`,
            apiToken,
        );
        console.log('deleteRes', res)

        return res['data'];

    } catch (e) {
        console.error(e)
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
    console.log('createRes', res)

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

