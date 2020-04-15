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
import { chunkArray, sleep } from '../../../helpers/utilities';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

export interface closureSummary {

    totalL4s: number;

}

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;


const connectionMappings = require('./closure-cable-mappings-gis.json');


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

        const sealModels = await getAllRecordsByEntity(odinDb, 'ProjectModule', 'FeatureModel', 'SEAL');


        const chunkedConnections = chunkArray(connectionMappings, 50);

        console.log('MAPPINGS_LENGTH', connectionMappings.length)

        // create closure + cable connections
        for(const connections of chunkedConnections) {

            console.log('PROCESSED_LOOP_1')
            console.log('connections', connections)

            const processAll = [];
            for(const connection of connections) {

                console.log('connection', connection)

                processAll.push({
                    func: createCableConnections(
                        odinDb,
                        sealModels,
                        connection,
                    ),
                })

            }

            await sleep(2000)
            await Promise.all(processAll.map(elem => elem.func));
        }

        odinDb.close();

        return { modified, errors };

    } catch (e) {
        console.error(e);
    }
}

// When you are creating a cable connection and need to get then next port and seal to use
export const getNextAvailablePort = (ports: DbRecordEntityTransform[], connections: DbRecordEntityTransform[]) => {

    if(ports) {
        return ports.find(elem => getProperty(elem, 'PortNumber') === '1');
    }

}


// When you are creating a cable connection and need to get then next port and seal to use
export const getNextAvailableSealInterface = async (
    port: DbRecordEntityTransform,
    connections: DbRecordEntityTransform[],
) => {

    // get the port seals
    const portSeals = await getRelatedRecords(
        port.id,
        'FeatureComponent',
        [ '\"FeatureComponent\"' ],
        [ '\"SchemaType:PORT_SEAL\"' ],
    )

    const records = portSeals['FeatureComponent'].dbRecords

    if(records) {
        return records.find(elem => getProperty(elem, 'InterfaceNumber') === '1');
    }

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

    if(res[0]) {
        return await getRecordDetail(res[0].id, 'Feature', []);
    }

}

/**
 *
 * @param odinDb
 * @param moduleName
 * @param entityName
 * @param schemaType
 */
const getAllRecordsByEntity = async (
    odinDb: any,
    moduleName: string,
    entityName: string,
    schemaType: string,
) => {

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
export const getRecordDetail = async (recordId: string, entityName: string, entities: string[]) => {

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
export const getRelatedRecords = async (
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
export const createRecord = async (
    entityName: string,
    body: DbRecordCreateUpdateDto[],
) => {

    const res = await httpClient.postRequest(
        Utilities.getBaseUrl(SERVICE_NAME.PROJECT_MODULE),
        `v1.0/db/batch?queueAndRelate=true`,
        apiToken,
        body,
    );
    console.log(`v1.0/db/${entityName}`)
    return res['data'];

}

/**
 * Adds a seal model to a port in the closure
 * which will create seal interfaces for the port
 *
 * @param sealModels
 * @param nextAvailablePortOnTarget
 */
async function addSealModelToPort(
    sealModels: DbRecordEntityTransform[],
    nextAvailablePortOnTarget: DbRecordEntityTransform,
    name: string,
) {
    const targetSealModel = sealModels.find(elem => elem.title === name);
    console.log('targetSealModel', targetSealModel);

    const createRel = new DbRecordAssociationCreateUpdateDto()
    createRel.recordId = targetSealModel.id;

    const newAssociation = await createAssociation(
        nextAvailablePortOnTarget.id,
        'FeatureComponent',
        [ createRel ],
    );
    console.log('newAssociation', newAssociation);
    return targetSealModel;
}


/**
 * Creates a cable connection to a closure
 *
 * @param closure
 * @param port
 * @param sealModel
 * @param sealInterface
 * @param cable
 * @param direction
 * @param connection
 */
async function createCableConnection(
    closure: DbRecordEntityTransform,
    port: DbRecordEntityTransform,
    sealModel: DbRecordEntityTransform,
    sealInterface: DbRecordEntityTransform,
    cable: DbRecordEntityTransform,
    direction: 'IN' | 'OUT',
    connection: any,
) {
    const newRecord = new DbRecordCreateUpdateDto()
    newRecord.entity = 'ProjectModule:FeatureConnection'
    newRecord.type = 'CABLE'
    newRecord.properties = {
        ClosureId: closure.id,
        OutClosureExternalRef: connection.outClosure,
        InClosureExternalRef: connection.inClosure,
        PortId: port.id,
        SealModelId: sealModel.id,
        SealId: sealInterface.id,
        CableId: cable.id,
        CableExternalRef: getProperty(cable, 'ExternalRef'),
        CableType: getProperty(cable, 'CableType'),
        Direction: direction,
        IsLoop: connection.isLoopCable,
        L4ClosureCount: connection.l4ClosureCount,
    }
    newRecord.associations = [
        {
            recordId: port.id,
        },
        {
            recordId: sealInterface.id,
        },
        {
            recordId: sealInterface.id,
        },
        {
            recordId: cable.id,
        },
        {
            recordId: closure.id,
        },
    ]

    // console.log('newRecord', newRecord);

    const sourceCableConnection = await createRecord(
        'FeatureConnection',
        [ newRecord ],
    )
    return sourceCableConnection;
}


interface IConnectionMapping {
    'outClosure': number,
    'outClosureType': string,
    'outCable': number,
    'outCableType': string,
    'inClosure': number,
    'inClosureType': string,
    'inCable': number,
    'inCableType': string
    'isLoopCable': string
}

/**
 *
 * @param closuresByPolygon
 * @param odinDb
 * @param sealModels
 * @param connection
 */
async function createCableConnections(
    odinDb,
    sealModels,
    connection: IConnectionMapping,
) {

    // get the in closure
    const outClosure = await getOdinRecordByExternalRef(
        connection.outClosure,
        odinDb,
        'CLOSURE',
    )

    if(outClosure) {

        // get the in closure ports
        const outClosurePortsLinks = outClosure.links.filter(elem => elem.type === 'CLOSURE_PORT');
        const outClosurePorts = await getManyRecordsDetail(outClosurePortsLinks.map(elem => elem.id));

        // get the in closure existing connections
        const inClosureConnectionsLinks = outClosure.links.filter(elem => elem.type === 'CABLE_CONNECTION');
        const inClosureCableConnections = await getManyRecordsDetail(inClosureConnectionsLinks.map(elem => elem.id));


        // get next available out port
        const nextAvailableOutPort = getNextAvailablePort(outClosurePorts, inClosureCableConnections);

        // add seal model to out port
        const sealModelForOutPort = await addSealModelToPort(
            sealModels,
            nextAvailableOutPort,
            'mech_4_SST',
        );

        // get the In cable by external reference id
        const outCable = await getOdinRecordByExternalRef(
            connection.outCable,
            odinDb,
            'CABLE',
        )

        if(nextAvailableOutPort && outCable) {

            const nextAvailableSeal = await getNextAvailableSealInterface(
                nextAvailableOutPort,
                inClosureCableConnections,
            );
            // console.log('nextAvailableSeal', nextAvailableSeal);

            if(nextAvailableSeal) {
                // Create IN cable Connection and Loop: false
                const sourceCableConnection = await createCableConnection(
                    outClosure,
                    nextAvailableOutPort,
                    sealModelForOutPort,
                    nextAvailableSeal,
                    outCable,
                    'OUT',
                    connection,
                );
                console.log('sourceCableConnection', sourceCableConnection);
            }

            //
            // Add the OUT connection for the cable
            //

            const inClosure = await getOdinRecordByExternalRef(
                connection.inClosure,
                odinDb,
                'CLOSURE',
            )

            console.log('inClosure', inClosure);

            if(inClosure) {

                const inClosurePortsLinks = inClosure.links.filter(elem => elem.type === 'CLOSURE_PORT');
                const inClosurePorts = await getManyRecordsDetail(inClosurePortsLinks.map(elem => elem.id));

                const inClosureConnectionsLinks = inClosure.links.filter(elem => elem.type === 'CABLE_CONNECTION');
                const inClosureCableConnections = await getManyRecordsDetail(inClosureConnectionsLinks.map(
                    elem => elem.id));

                // console.log('ports', ports);
                // console.log('cableConnections', cableConnections);

                const nextAvailableInPort = getNextAvailablePort(
                    inClosurePorts,
                    inClosureCableConnections,
                );
                // console.log('nextAvailableInPort', nextAvailableInPort);

                if(nextAvailableInPort) {

                    const targetSealModel = await addSealModelToPort(
                        sealModels,
                        nextAvailableInPort,
                        'mech_4_SST',
                    );

                    const nextAvailableSealTarget = await getNextAvailableSealInterface(
                        nextAvailableInPort,
                        inClosureCableConnections,
                    );


                    if(nextAvailableSealTarget) {
                        console.log('nextAvailableSealTarget', nextAvailableSealTarget);

                        console.log('nextAvailableSealTarget', nextAvailableSealTarget);
                        const targetCableConnection = await createCableConnection(
                            inClosure,
                            nextAvailableInPort,
                            targetSealModel,
                            nextAvailableSealTarget,
                            outCable,
                            'IN',
                            connection,
                        );
                        console.log('targetCableConnection', targetCableConnection);
                    }
                }
            }
        }
    } else {
        console.log('NO_OUT_CLOSURE')
    }
}


execute();

