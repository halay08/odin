import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { constantCase } from 'change-case';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

export interface closureSummary {

    totalL4s: number;

}

const httpClient = new BaseHttpClient();

const apiToken = process.env.ODIN_API_TOKEN;

const searched = [];
const traces = {};

let odinDb;

let cableColumns;
let closureColumns;


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

        cableColumns = await getSchemaColumnsByType('ProjectModule', 'Feature', 'CABLE');
        closureColumns = await getSchemaColumnsByType('ProjectModule', 'Feature', 'CLOSURE');

        // console.log('cableColumns', JSON.stringify(cableColumns));

        // const startClosureId = 'e2b5c14f-b608-4daa-a3f1-4cee7366925d'
        const startClosureId = '6d99e85e-7a21-411c-97a4-2fdd291aed4e'
        await traceAll(startClosureId, odinDb)

        console.log('traces', traces)

        fs.writeFileSync('./connections-traced-odin.json', JSON.stringify(traces))

        odinDb.close();

    } catch (e) {
        console.error(e);
    }
}

/**
 *
 * @param closureId
 * @param odinDb
 */
const traceAll = async (closureId: string, odinDb: any) => {

    console.log('searched', searched, closureId);

    const closureCableConnections = await getClosureConnections(closureId, odinDb);

    traces[closureId] = closureCableConnections[0];

    if(closureCableConnections[0]) {

        // find the IN cable
        const inCables = closureCableConnections[0].connections.map(cab => {
            let newCab = cab;

            console.log('cab[\'cableType\']', cab['cableType'])

            if(cab['cableType']) {

                const type = returnLabelForEnum(cableColumns, 'CableType', cab['cableType']);
                console.log('type', type);
                newCab['cableType'] = type;

            }

            if(cab['closureType']) {

                const type = returnLabelForEnum(closureColumns, 'ClosureType', cab['closureType']);
                console.log('type', type);
                newCab['closureType'] = type;

            }

            return newCab;
        })

        for(const inCableConnection of inCables) {
            // find the upstream closure
            // console.log('inCableConnection', inCableConnection)
            const nextConnection = await getNextConnectionByCableIdAndDirection(inCableConnection.cableId, odinDb);
            // filter the list to only have cable connections that are not for the current closure
            const filtered = nextConnection[0].connections.filter(elem => ![
                closureId,
                ...searched,
            ].includes(elem.closureId));

            let traces = [];

            for(const conn of filtered) {
                // recursively trace closures toconnections
                // add the closureId to the searched array so we don't loop it again
                searched.push(closureId);
                traces = await traceAll(conn.closureId, odinDb)

            }

            console.log('traces', traces)

            inCableConnection['connections'] = traces
        }

        return closureCableConnections;

    }
}

/**
 * This will get the connections by closureId
 *
 * @param closureId
 * @param odinDb
 */
const getClosureConnections = async (closureId: string, odinDb: any) => {

    return await odinDb.query(`
        SELECT r.record_number,
               r.type,
               r.entity,
               extRef.value as closureExt,
               c.connections
        FROM db_records as r
        LEFT JOIN db_records_columns as extRef on (extRef.record_id = r.id and extRef.column_name = 'ExternalRef')
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
                    LEFT JOIN db_records_columns as closureExternalRef on (closureExternalRef.record_id = conn.id and closureExternalRef.column_name = 'ClosureExternalRef')
                    LEFT JOIN db_records_columns as closureType on (closureType.record_id = conn.id and closureType.column_name = 'ClosureType')
                WHERE a.child_entity = 'ProjectModule:FeatureConnection'
                    AND a.parent_record_id = r.id
                    AND conn.type = 'CABLE'
                    AND direction.value IN ('IN', 'OUT')
            ) AS c on true
        WHERE r.entity = 'ProjectModule:Feature'
        AND r.id = '${closureId}'
        `);
}

/**
 * This will return the next connection info by cableId
 * It will get the other connections for this cable
 *
 * @param cableId
 * @param direction
 */
const getNextConnectionByCableIdAndDirection = async (cableId: string, odinDb: any) => {

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
                    LEFT JOIN db_records_columns as closureExternalRef on (closureExternalRef.record_id = conn.id and closureExternalRef.column_name = 'ClosureExternalRef')
                    LEFT JOIN db_records_columns as closureType on (closureType.record_id = conn.id and closureType.column_name = 'ClosureType')
                WHERE a.child_entity = 'ProjectModule:FeatureConnection'
                    AND a.parent_record_id = r.id
                    AND conn.type = 'CABLE'
                    AND direction.value IN ('IN', 'OUT')
            ) AS c on true
        WHERE r.entity = 'ProjectModule:Feature'
        AND r.id = '${cableId}'
        `);
}


/**
 *Get the schema columns by module and entity
 *
 * @param moduleName
 * @param entityName
 * @param featureType
 */
const getSchemaColumnsByType = async (moduleName: string, entityName: string, featureType: string) => {

    const schemaRes = await httpClient.getRequest(
        Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
        `v1.0/schemas/bymodule?moduleName=${moduleName}&entityName=${entityName}`,
        apiToken,
    );
    const schema = schemaRes['data'];

    const schemaType = schema.types.find(elem => elem.name === constantCase(featureType));

    const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType.id || !elem.schemaTypeId);


    return filteredCols;

}

/**
 * Match the schema columns valus with labels for ENUMS
 * @param columns
 * @param key
 * @param value
 */
const returnLabelForEnum = (columns: SchemaColumnEntity[], key: string, value: string) => {

    if(columns) {
        for(const column of columns) {
            if(column.type === SchemaColumnTypes.ENUM) {
                // For enum values we want to show the label instead of the value
                const option = column.options.find((opt: SchemaColumnOptionEntity) => opt.value === value);

                if(option) {

                    return option.label;

                } else {
                    return value;
                }
            }
        }

    }
    return value;
}


execute();

