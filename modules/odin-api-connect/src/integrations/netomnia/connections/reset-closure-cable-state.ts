import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { sleep } from '../../../helpers/utilities';
import { FibreConnection } from './types/fibre.connection';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

export interface closureSummary {

    totalL4s: number;

}

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;

let odinDb;

let featureModels;

let connections: FibreConnection[] = [];
let fibreTraces = []
let inFibresToConnect = []
let fibreTracesExisting = []
let fibresUsed = [];
let searchNextTubeFibreOverride;

let argSetTrayModels = process.argv.find(arg => arg.indexOf('configtrays') > -1);
let configtrays = argSetTrayModels ? argSetTrayModels.split('=')[1] : null;

let argL2ClosureId = process.argv.find(arg => arg.indexOf('l2id') > -1);
let closureId = argL2ClosureId ? argL2ClosureId.split('=')[1] : null;

let argDryRun = process.argv.find(arg => arg.indexOf('dryrun') > -1);
let dryRun = argDryRun ? argDryRun.split('=')[1] : null;

let startingTubeFibre = 'T1:F1';
let searchNextTubeFibre = 'T1:F1';

let searchedFibreKeys = []

let startClosureType = 'L2'

async function execute() {

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

    try {

        const closuresNoConnections = await getAllClosuresWithNoFibreConnections()

        featureModels = await getAllRecordsByEntity('ProjectModule', 'FeatureModel', 'TRAY');

        console.log('LENGTH', closuresNoConnections.length)

        if(!configtrays) {

            for(const closure of closuresNoConnections) {

                // trace and map a fibre connection
                await createFibreConnectionMappings(closure.id)

                connections = []
                fibreTraces = []
            }
        }

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
    fibreTraces = []

    // starting closure "In" cable
    const inCable = await getInCableByClosureId(closureId)
    const inCableId = inCable[0]['cable_id']

    // get the in cables for the closure
    const { inClosure, inClosureType } = await getDownStreamClosureDetailsByCableId(inCableId)

    // get the fibre from the loop cable that is UNUSED
    const allFibres = await getAllFibresByCableId(inCableId)
    const firstAvailableFiber = allFibres.find(elem => elem['fiber_state'] === null)

    const tubeFibreKey = constructTubeFibreKey(firstAvailableFiber['tube_number'], firstAvailableFiber['fiber_number'])

    // reset the starting tube and fibre and set the default searchNextTube to be the same
    startingTubeFibre = tubeFibreKey
    searchNextTubeFibre = searchNextTubeFibreOverride ? searchNextTubeFibreOverride : tubeFibreKey

    console.log('----FROM_CLOSURE:   ', inClosure['from_closure_ext_ref'])
    console.log('----IN_CABLE:       ', inClosure['in_cable_ext_ref_from_closure'])
    console.log('----IN_CABLE_FIBER: ', tubeFibreKey)

    // Step 1: get the existing used fibre connections by cableId

    const fibresUsed = allFibres.filter(elem => elem['fiber_state'] !== null)

    console.log('fibresUsed', fibresUsed)

    // Step 2: get the total number of connections needed
    const closureCables = await getCablesAndConnectionsByClosureId(inClosure['closure_id'])

    let totalConnectionsNeeded = 0
    let outFibresToConnect = []

    const closureOutCableIds = closureCables.map(elem => elem['cable_id']);
    outFibresToConnect = await getCableFibreConnectionsByCableId(closureOutCableIds)

    console.log('outFibresToConnect', outFibresToConnect)

    // Step 3: Filter out fibres already connected
    if(fibresUsed.length > 0) {

        outFibresToConnect = outFibresToConnect.filter(elem => !fibresUsed.map(elem => elem['fiber_id']).includes(elem['in_fibre_id']))

    }

    outFibresToConnect = outFibresToConnect.filter(elem => elem['fiber_state'] !== null)

    // set the total number of connections needed
    totalConnectionsNeeded += outFibresToConnect.length


    // Step 3:  Configure slots
    const slotModel = featureModels.find(elem => elem.title === 'fist72:standard:12');
    console.log('slotModel', slotModel);

    const splitterType = getProperty(slotModel, 'SplitterType');
    const splitterQuantity = getProperty(slotModel, 'SplitterQuantity');
    const connectionsPerFibre = Number(splitterType.split('_')[1])

    console.log('__connectionsPerFibre', connectionsPerFibre)
    console.log('____totalConnectionsNeeded', totalConnectionsNeeded)

    // round up to the nearest integer
    const newConnectionsNeeded = Math.ceil(totalConnectionsNeeded / connectionsPerFibre)

    console.log('__newConnectionsNeeded', newConnectionsNeeded)

    await goToNextClosure(inCableId, 'L1', inClosureType, 'IN', closureId)

    console.log('_CONNECTIONS_TO_CUT', fibreTraces.filter(elem => elem['cableOutId'] === inCableId))

    // get only the in cable of the L2 that we need to create a connection for
    inFibresToConnect = fibreTraces.filter(elem => elem['cableOutId'] === inCableId)

    if(allFibres[0]) {

        // reset any params that are no needed after the mappings is created
        searchNextTubeFibreOverride = null
        searchedFibreKeys = []


        const clonedMapping = [ ...fibreTraces ];

        // we want to filter out any fibres that are null and L1 for all traces upstream
        const usedFibreIds = [
            ...clonedMapping.filter(elem => elem.fibreInId && elem.upstreamClosureType !== 'L1').map(elem => elem.fibreInId),
            ...clonedMapping.filter(elem => elem.fibreOutId && elem.upstreamClosureType !== 'L1').map(elem => elem.fibreOutId),
        ]

        fibresUsed.push(...usedFibreIds)

        // try to find fibre connections for this inFibresToConnect


        console.log('_IN_FIBRES_TO_CONNECT_COUNT', inFibresToConnect.length)

        const connectionsToDelete = []
        for(const inFibre of inFibresToConnect) {

            // get the upstream fibre connections
            const fibreConnections = await getFibreConnectionsByFibreId(inFibre['fibreOutId'], true)

            console.log('CHECK_EXISTING_FIBRES', fibreConnections)

            // we need to find the connections for the in cable
            // loop cables have multiple connections
            const fibreConnection = fibreConnections.find(elem => elem['cable_in'] === inCableId)

            console.log('fibreConnection');
            if(fibreConnection) {
                connectionsToDelete.push(fibreConnection)
            }

        }

        console.log('_FIBRES_USED', fibresUsed)
        console.log('_FIBRE_MAPPINGS', fibreTraces)
        console.log('_FIBRE_CONNECTIONS_IN', inFibresToConnect)
        console.log('_FIBRE_CONNECTIONS_OUT', outFibresToConnect)
        console.log('_FIBRE_CONNECTIONS_TO_DELETE', connectionsToDelete)

        console.log('_FIBRE_MAPPINGS_CT', fibreTraces.length)
        console.log('_FIBRE_CONNECTIONS_IN_CT', inFibresToConnect.length)
        console.log('_FIBRE_CONNECTIONS_OUT_CT', outFibresToConnect.length)
        console.log('_FIBRE_CONNECTIONS_TO_DELETE_CT', connectionsToDelete.length)

        console.log('fibresUsed', fibresUsed)


        // Update the fibre status if we have an upstream closure to create a connection with
        for(const fibreId of [ ...usedFibreIds, ...fibresUsed.map(elem => elem['fiber_id']) ]) {

            const newRecord = new DbRecordCreateUpdateDto()
            newRecord.entity = 'ProjectModule:FeatureComponent'
            newRecord.type = 'FIBRE'
            newRecord.properties = {
                FibreState: null,
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


        // delete any connections
        for(const item of connectionsToDelete) {
            if(item['fibreConnectionId']) {

                if(!dryRun) {
                    const deleteRes = await deleteRecord('FeatureConnection', item['fibreConnectionId'])
                    console.log('deleteRes', deleteRes)
                }
            }
        }

    }

}

/**
 *
 * @param cableId
 */
async function createMappingsForExistingConnections(cableId: string) {

    let splittersAvailable = []

    const allFibres = await getAllFibresByCableId(cableId)

    const fibresUsed = allFibres.filter(elem => elem['fiber_state'] !== null)

    console.log('_L2_FIBRES_USED', fibresUsed)

    for(const fibre of fibresUsed) {

        const availableFibre = await getAvailableFibreWithSplitters(cableId, fibre['fiber_id'])


        console.log('_AVAILABLE_FIBRE', availableFibre)

    }

    return splittersAvailable;

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

    await getNextAvailableFibreUpstreamCable(cableId, 'L1', isLoop, 'IN', startClosureId, firstFibre)

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

    await getNextAvailableFibreUpstreamCable(cableId, 'L1', isLoop, 'IN', startClosureId, firstFibre)

}

/**
 *
 * @param cableId
 * @param traceTo
 * @param isLoop
 * @param direction
 * @param startClosureId
 * @param firstFibre
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

        // get the upstream fibres
        const matchingFibresIn = await getUsedFibres(firstInCable['cable_id'])

        console.log('_MATCHING_FIBRE_IN', matchingFibresIn)


        if(matchingFibresIn) {
            for(const matchingFibreIn of matchingFibresIn) {

                // get the upstream fibre connections
                const fibreConnections = await getFibreConnectionsByFibreId(matchingFibreIn['fiber_id'], true)

                // we need to find the connections for the in cable
                // loop cables have multiple connections
                const fibreConnection = fibreConnections.find(elem => elem['cable_in'] === firstInCable['cable_id'])

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

                // this is the upstream fibre mapping
                fibreTraces.push({
                    isLoop: connection['is_loop'] === 'true',
                    fibreConnectionId: fibreConnection['id'],
                    fibreState: matchingFibreIn['fiber_state'],
                    // upstream closure parameters
                    upstreamClosureType,
                    inClosureExt: upstreamClosure['to_closure_ext_ref'],
                    closureId: upstreamClosure['closure_id'],
                    cableInId: connection['cable_id'],
                    cableInExt: connection['cable_external_ref'],
                    fibreInId: matchingFibreIn['fiber_id'],
                    tubeInId: matchingFibreIn['tube_id'],
                })

            }
            // console.log('_CABLE_CONNECTION', connection)
        }

        if(upstreamClosureType !== traceTo) {

            await goToNextClosure(firstInCable['cable_id'], traceTo, upstreamClosureType, direction, startClosureId)

        }

    }
}

/**
 * get fibres by cableId matching the tube numbers
 *
 */
async function getUsedFibres(cableId: string) {

    // get the cable fibres
    const cableFibres = await getAllFibresByCableId(cableId)

    // find the matching fibre by tube and fibre
    let matchingFibres = cableFibres.filter(fibre => fibre['fiber_state'] !== null);

    return matchingFibres;

}

/**
 * this will return all available fibre connections with a splitter
 *
 */
async function getAvailableFibreWithSplitters(cableId: string, fibreId: string) {

    // we need to check if this fibre has splitters
    if(fibreId) {
        // get the upstream fibre connections
        const fibreConnections = await getFibreConnectionsByFibreId(fibreId, true)

        console.log('fibreConnections', fibreConnections)

        // we need to check if the total number of fiber connections is less than the
        const fiberConnectionsByCable = fibreConnections.filter(elem => elem['cable_in'] === cableId)

        console.log('fiberConnectionsByCable', fiberConnectionsByCable)

        if(fiberConnectionsByCable) {

            // check if there is a fibre going out
            // if there is not out fibre then we can use this connection
            for(const conn of fiberConnectionsByCable) {

                if(!conn['fiber_out_id'] && conn['tray_splitter_id']) {
                    // no splitter means we can use this to create a connection
                    fibreTracesExisting.push(conn)

                }
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

/**
 *
 * @param cableId
 * @param traceTo
 * @param closureType
 * @param direction
 * @param startClosureId
 * @param firstFibre
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
 * @param closureId
 * @param inFibresToConnect
 * @param outFibresToConnect
 * @param usedFibreIds
 */
async function createFibreConnections(
    closureId: string,
    inFibresToConnect: any,
    outFibresToConnect: any,
    connectionsToDelete: any,
    usedFibreIds: any,
) {

    const filtered = inFibresToConnect.filter(elem => elem.upstreamClosureType !== 'L1')

    const mappings = filtered.filter(elem => elem.upstreamClosureType === 'L2')

    console.log('_CONNECTIONS_TO_CREATE', mappings.length)
    console.log('_CONNECTIONS_TO_DELETE', connectionsToDelete.length)

    // delete any connections
    for(const item of connectionsToDelete) {
        if(item['fibreConnectionId']) {

            if(!dryRun) {
                const deleteRes = await deleteRecord('FeatureConnection', item['fibreConnectionId'])
                console.log('deleteRes', deleteRes)
            }
        }
    }

    // create new connections with splitters
    for(const mapping of mappings) {

        // create a new connection in the upstream closure and connect the downstream fibre as the OUT
        // only create the connection if the fibreOut is null
        const connectionDetails = {

            upstreamClosureId: closureId,
            cableInExternalRef: mapping['cableOutExt'], // the IN Cable of the upstream closure
            inClosureExt: mapping['outClosureExt'],  // we trace up so the OUT params from the mapping are the IN
            cableInId: mapping['cableOutId'],
            tubeFibreIn: mapping['tubeFibreKeyOut'],
            tubeInId: mapping['tubeOutId'],
            fibreInId: mapping['fibreOutId'],
            outClosureExt: null,  // the IN Closure from the downstream closure
            cableOutExternalRef: null, // the IN Cable of the downstream closure
            tubeFibreOut: null, // this is the IN fibre of the downstream closure
            tubeOutId: null,
            fibreOutId: null,
            cableOutId: null,

        }

        await parseFibreConnection(connectionDetails, mappings.length);

    }

    console.log('_CONNECTIONS', connections.length)

    if(connections && connections.length > 0) {
        // Create connections
        for(let i = 0; i < connections.length; i++) {

            let connection = connections[i];
            const outFibre = outFibresToConnect[i]

            console.log('outFibre', outFibre)

            if(outFibre) {
                connection = Object.assign({}, connection, {

                    outClosureExt: outFibre['in_closure'],
                    cableOutExternalRef: outFibre['in_cable'],
                    tubeFibreOut: outFibre['in_tube_fiber'],
                    tubeOutId: outFibre['in_tube_id'],
                    fibreOutId: outFibre['in_fibre_id'],
                    cableOutId: outFibre['in_cable_id'],

                })
            }

            console.log('_CREATE_CONNECTION_MERGED', connection)

            // here we want to add the out connections

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
async function parseFibreConnection(connectionDetails: any, totalFibres: number, slotNumber?: number) {

    console.log('----------------------------------')
    console.log('CREATE_CONNECTIONS')
    console.log('----------------------------------')

    let startingSlotNumber = slotNumber ? slotNumber : 1;

    console.log('connectionDetails', connectionDetails)

    // need to find next available slot
    let slots = await getSlotsByClosureId(connectionDetails['upstreamClosureId'])

    console.log('slots', slots)

    const availableSlots = []
    for(const slot of slots) {
        if(slot['trays']) {
            for(const tray of slot['trays']) {
                if(!tray['splitters']) {
                    availableSlots.push(slot)
                }
            }
        } else {
            availableSlots.push(slot)
        }
    }

    console.log('AVAILABLE_SLOTS', availableSlots)

    if(!slotNumber) {
        startingSlotNumber = Number(availableSlots[0]['slot_number'])
    }

    console.log('startingSlotNumber', startingSlotNumber)

    const slot = availableSlots.find(elem => Number(elem['slot_number']) === Number(startingSlotNumber))
    console.log('_SELECTED_SLOT', slot)

    // get the next available slot

    // 1 slot
    // 1 tray
    // 2 splitters

    if(slot) {

        // add tray models to the slot
        const trayModel = await addTrayModelToSlot(slot, 'fist72:standard:12');

        const trays = slot['trays']

        const splitterType = getProperty(trayModel, 'SplitterType');
        const splitterQuantity = getProperty(trayModel, 'SplitterQuantity');

        const connectionsPerFibre = splitterType.split('_')[1]

        console.log('connectionsPerFibre', connectionsPerFibre)

        // break loop if the total number of connections meets the requirements
        let totalConnectionsForFibre = 0;
        let totalFibresAfterSplitter = Number(connectionsPerFibre) * Number(totalFibres);

        console.log('totalFibresAfterSplitter', totalFibresAfterSplitter)
        console.log('connectionssLenght', connections.length)

        if(totalFibresAfterSplitter <= connections.length) {
            return
        }

        let noTrayChecks = 0

        for(let i = 0; i < Number(connectionsPerFibre); i++) {

            console.log('_CONNECTION_NUMBER', i)

            // Keep searching for trays while they are being created
            while (!slot['trays']) {

                console.log('noTrayChecks', noTrayChecks)
                // run this again after 300 checks
                if(noTrayChecks > 50) {

                    noTrayChecks = 0
                    // delete the slot tray model if one exists then re-create it
                    await parseFibreConnection(connectionDetails, totalFibres, slotNumber)
                }

                noTrayChecks += 1

                console.log('connectionDetails[\'upstreamClosureId\']', connectionDetails['upstreamClosureId'])
                await sleep(1250)
                await parseFibreConnection(connectionDetails, totalFibres, startingSlotNumber)

                console.log('_TRAYS', slot['trays'])
            }

            // If there are trays find the next splitter
            if(trays) {

                let splitters;
                let nextSplitter;
                let tray = {};

                // because splitters are created from the queue it might take a few seconds for them to create
                // keep tyring to get them and search all the trays in this slot
                while (!splitters) {

                    for(let j = 0; j < trays.length; j++) {

                        tray = trays[j]

                        console.log('_TRAY_NUMBER', j)
                        // if there is no splice available in the tray

                        await sleep(1250)
                        console.log('WAITING_FOR_SPLITTERS_TO_BE_CREATED')
                        tray = await getSplittersByTrayId(tray['id']);

                        console.log('_SELECTED_TRAY', tray)
                        if(tray['splitters']) {

                            splitters = tray['splitters']

                            // sort the splices in ascending order
                            const sortedSplitters = tray['splitters'] ? tray['splitters'].sort((
                                a,
                                b,
                            ) => Number(a['splitter_number']) - Number(b['splitter_number'])) : null

                            // find the first available splice
                            const usedSplitters = connections.map(elem => `${elem['trayId']}_${elem['splitterNumber']}`);

                            console.log('usedSplitters', usedSplitters)

                            const usedSplitterIds = usedSplitters.filter(elem => elem.indexOf(tray['tray_id']) > -1).map(
                                elem => {
                                    const split = elem.split('_')
                                    return split[1]
                                })

                            console.log('usedSplitterIds', usedSplitterIds)

                            const splittersFiltered = sortedSplitters.filter(elem => usedSplitterIds.filter(
                                num => num === elem['splitter_number']).length < Number(connectionsPerFibre))

                            console.log('_SPLITTERS_FILTERED', splittersFiltered)

                            const nextAvailableSplitter = splittersFiltered.find(elem => elem.connections === null)

                            console.log('nextAvailableSplitter', nextAvailableSplitter);

                            nextSplitter = nextAvailableSplitter;

                            console.log('_HAS_NEXT_SPLITTER', nextSplitter)
                        }
                    }
                }

                // if there is no nextSplitter go to the next slot

                if(!nextSplitter) {

                    console.log('_DO_NOT_GO_HERE', nextSplitter)

                    // search the next slot no splitters are available in any of the trays
                    await parseFibreConnection(connectionDetails, totalFibres, startingSlotNumber + 1)

                } else {

                    // create a new  connection
                    const connection = new FibreConnection();
                    connection.closureId = connectionDetails['upstreamClosureId'];
                    connection.slotId = slot.id;
                    connection.trayModelId = trayModel.id;
                    connection.trayId = tray['tray_id'];
                    connection.trayInId = tray['tray_id'];
                    connection.trayOutId = tray['tray_id'];
                    connection.traySpliceId = null;
                    connection.traySplitterId = nextSplitter.id;
                    connection.inClosureExt = connectionDetails['inClosureExt'];
                    connection.outClosureExt = connectionDetails['outClosureExt'];
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
                    connection.splitterNumber = nextSplitter['splitter_number'];

                    connections.push(connection)

                    totalConnectionsForFibre += 1

                    console.log('THIS', Number(totalConnectionsForFibre))
                    console.log('COMP', Number(connectionsPerFibre))

                    if(Number(totalConnectionsForFibre) === Number(connectionsPerFibre)) {
                        return
                    }
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
const getFibreConnectionsByFibreId = async (fibreId: string, isUsed?: boolean) => {

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
         c12.value as closure_from_ext_ref,
         c13.value as tray_splitter_id,
         c13.value as tray_model_id
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
         left join db_records_columns c13 on (c13.record_id = cr.id and c13.column_name = 'TraySplitterId')
         left join db_records_columns c14 on (c14.record_id = cr.id and c13.column_name = 'TrayModelId')
        where a.child_record_id = '${fibreId}'
        and cr.entity = 'ProjectModule:FeatureConnection'
        and cr.type = 'FIBRE'
        and a.deleted_at IS NULL
        ${!isUsed ? 'and c7.value IS NULL' : 'and c7.value IS NOT NULL'}
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
const getAllFibresByCableId = async (cableId: string) => {

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
async function getSplittersByTrayId(trayId: string) {
    const res = await odinDb.query(`
        select
            a.id as tray_id,
            d.splitters
        from db_records a
            left join lateral(
            select
              json_agg(
              json_build_object(
                  'id', crb.id,
                  'type', crb.type,
                  'splitter_number', crb1.value,
                  'splitter_type', crb2.value,
                  'connections', e.connections
               )
              ) as splitters
              from db_records_associations b
            left join db_records crb on (b.child_record_id = crb.id)
            left join db_records_columns as crb1 on (crb1.record_id = crb.id and crb1.column_name = 'SplitterNumber')
            left join db_records_columns as crb2 on (crb2.record_id = crb.id and crb2.column_name = 'SplitterType')
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
              and crb.type = 'TRAY_SPLITTER'
            ) as d on true
        where a.id = '${trayId}'
        and a.deleted_at IS NULL
    `)

    return res[0]
}

/**
 *
 1    "L0"
 2    "L1"
 3    "L2"
 4    "L3"
 5    "L4"
 */
async function getAllClosuresWithNoFibreConnections() {

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
        and c1.value IN ('3')
        ${closureId ? `and c.value = '${closureId}'` : 'and c.value IS NOT NULL'}
        and db_records.deleted_at IS NULL
        and exists (
            select * from db_records_associations a
            left join db_records as r on (r.id = a.child_record_id)
            where a.child_entity = 'ProjectModule:FeatureConnection'
            and a.parent_record_id = db_records.id
            and a.deleted_at IS NULL
            and r.type = 'CABLE'
        )
    `)
}

/**
 *
 * @param closureId
 */
async function getCablesAndConnectionsByClosureId(closureId: string) {

    console.log('closureId', closureId)

    // cableType 3 is access cables

    return await odinDb.query(`
        select
            cr.type,
            c3.value as cable_direction,
            c2.value as cable_ext_ref,
            c1.value as cable_id
        from db_records_associations a
            left join db_records cr on (a.child_record_id = cr.id)
            left join db_records_columns c1 on (c1.record_id = cr.id and c1.column_name = 'CableId')
            left join db_records_columns c2 on (c2.record_id = cr.id and c2.column_name = 'CableExternalRef')
            left join db_records_columns c3 on (c3.record_id = cr.id and c3.column_name = 'Direction')
            left join db_records_columns c4 on (c4.record_id = cr.id and c4.column_name = 'CableType')
        where a.parent_record_id IN ('${closureId}')
        and cr.type = 'CABLE'
        and c4.value = '3'
        and c3.value = 'OUT'
        and a.deleted_at IS NULL
    `)
}

/**
 * This will return fibre connections by cable id
 *
 * @param fibreId
 */
const getCableFibreConnectionsByCableId = async (cableIds: string[]) => {

    return await odinDb.query(`
        select
        cr.type,
        c6.value as in_closure,
        c3.value as in_cable,
        c8.value as in_cable_id,
        c10.value as in_tube_id,
        c4.value as in_fibre_id,
        c1.value as in_tube_fiber,
        c5.value as fiber_state,
        c7.value as out_closure,
        c2.value as out_cable
        from db_records_associations a
        left join db_records cr on (a.child_record_id = cr.id)
        left join db_records_columns c1 on (c1.record_id = cr.id and c1.column_name = 'TubeFibreIn')
        left join db_records_columns c2 on (c2.record_id = cr.id and c2.column_name = 'CableOutExternalRef')
        left join db_records_columns c3 on (c3.record_id = cr.id and c3.column_name = 'CableInExternalRef')
        left join db_records_columns c4 on (c4.record_id = cr.id and c4.column_name = 'FibreInId')
        left join db_records_columns c5 on (c5.record_id = c4.value::uuid and c5.column_name = 'FibreState')
        left join db_records_columns c6 on (c6.record_id = cr.id and c6.column_name = 'InClosureExternalRef')
        left join db_records_columns c7 on (c7.record_id = cr.id and c7.column_name = 'OutClosureExternalRef')
        left join db_records_columns c8 on (c8.record_id = cr.id and c8.column_name = 'CableInId')
        left join db_records_columns c10 on (c10.record_id = cr.id and c10.column_name = 'TubeInId')
        where a.parent_record_id IN (${cableIds.map(elem => `'${elem}'`)})
        and cr.type = 'FIBRE'
        and a.parent_entity = 'ProjectModule:Feature'
        and a.deleted_at IS NULL
        order by c5.value, c3.value, c2.value, c1.value desc
        `);
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

