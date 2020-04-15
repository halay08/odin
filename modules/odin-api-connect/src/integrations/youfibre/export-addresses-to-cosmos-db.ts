import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection, getConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import moment = require('moment');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {

    const httpClient = new BaseHttpClient();

    let myahDb;
    let cosmosDb;
    let youfibreDb;

    try {
        myahDb = await createConnection({
            type: 'postgres',
            name: 'myahDb',
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

    const queryStart = moment().utc().subtract(1, 'days').startOf('day').toISOString();

    // Get the addresses that have leads and no orders or orders in cancelled
    const leadsWithNoInProgressOrders = await youfibreDb.query(
        `SELECT addresses.title, addresses.id as addr_id, Addr_Udprn_val.value as addr_udprn, Addr_PostalCode_val.value as addr_postcode, 'lead' as status
        FROM db_records AS addresses
        LEFT JOIN schemas as schema ON (addresses.schema_id = schema.id)
        LEFT JOIN schemas_columns as Addr_Udprn_col ON (addresses.schema_id = Addr_Udprn_col.schema_id  AND Addr_Udprn_col.name = 'UDPRN')
        LEFT JOIN db_records_columns as Addr_Udprn_val ON (Addr_Udprn_val.record_id = addresses.id AND Addr_Udprn_col.id = Addr_Udprn_val.column_id)
        LEFT JOIN schemas_columns as Addr_PostalCode_col ON (addresses.schema_id = Addr_PostalCode_col.schema_id  AND Addr_PostalCode_col.name = 'PostalCode')
        LEFT JOIN db_records_columns as Addr_PostalCode_val ON (Addr_PostalCode_val.record_id = addresses.id AND Addr_PostalCode_col.id = Addr_PostalCode_val.column_id)
        WHERE schema.entity_name = 'Address'
        AND addresses.deleted_at IS NULL
        AND EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            WHERE associations.child_record_id = addresses.id
            AND parent_schema.entity_name = 'Lead'
            AND associations.deleted_at IS NULL
        )
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as orders ON (orders.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (orders.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key NOT IN ('OrderStageCancelled')
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
        )
        GROUP BY addresses.id, addresses.title, Addr_Udprn_val.value, Addr_PostalCode_val.value
        ORDER BY addresses.id ASC;`);

    // Get the addresses that have orders in all stages
    const preOrdersAndNoActive = await youfibreDb.query(
        `SELECT addresses.title, addresses.id as addr_id, Addr_Udprn_val.value as addr_udprn,Addr_PostalCode_val.value as addr_postcode, 'pre_order' as status
        FROM db_records AS addresses
        LEFT JOIN schemas as schema ON (addresses.schema_id = schema.id)
        LEFT JOIN schemas_columns as Addr_Udprn_col ON (addresses.schema_id = Addr_Udprn_col.schema_id  AND Addr_Udprn_col.name = 'UDPRN')
        LEFT JOIN db_records_columns as Addr_Udprn_val ON (Addr_Udprn_val.record_id = addresses.id AND Addr_Udprn_col.id = Addr_Udprn_val.column_id)
        LEFT JOIN schemas_columns as Addr_PostalCode_col ON (addresses.schema_id = Addr_PostalCode_col.schema_id  AND Addr_PostalCode_col.name = 'PostalCode')
        LEFT JOIN db_records_columns as Addr_PostalCode_val ON (Addr_PostalCode_val.record_id = addresses.id AND Addr_PostalCode_col.id = Addr_PostalCode_val.column_id)
        WHERE schema.entity_name = 'Address'
        AND addresses.deleted_at IS NULL
        AND EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (parent_records.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key = 'OrderStagePreOrder'
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
        )
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (parent_records.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key = 'OrderStageActive'
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
        )
        GROUP BY addresses.id, addresses.title, Addr_Udprn_val.value, Addr_PostalCode_val.value
        ORDER BY addresses.id ASC;`);

    // Get the addresses that have orders in all stages
    const preOrdersInProgress = await youfibreDb.query(
        `SELECT addresses.title, addresses.id as addr_id, Addr_Udprn_val.value as addr_udprn,Addr_PostalCode_val.value as addr_postcode, 'in_progress' as status
        FROM db_records AS addresses
        LEFT JOIN schemas as schema ON (addresses.schema_id = schema.id)
        LEFT JOIN schemas_columns as Addr_Udprn_col ON (addresses.schema_id = Addr_Udprn_col.schema_id  AND Addr_Udprn_col.name = 'UDPRN')
        LEFT JOIN db_records_columns as Addr_Udprn_val ON (Addr_Udprn_val.record_id = addresses.id AND Addr_Udprn_col.id = Addr_Udprn_val.column_id)
        LEFT JOIN schemas_columns as Addr_PostalCode_col ON (addresses.schema_id = Addr_PostalCode_col.schema_id  AND Addr_PostalCode_col.name = 'PostalCode')
        LEFT JOIN db_records_columns as Addr_PostalCode_val ON (Addr_PostalCode_val.record_id = addresses.id AND Addr_PostalCode_col.id = Addr_PostalCode_val.column_id)
        WHERE schema.entity_name = 'Address'
        AND addresses.deleted_at IS NULL
        AND EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (parent_records.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key IN ('OrderStageSold', 'OrderStageSupply')
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
        )
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (parent_records.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key = 'OrderStagePreOrder'
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
        )
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (parent_records.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key = 'OrderStageActive'
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
        )
        GROUP BY addresses.id, addresses.title, Addr_Udprn_val.value, Addr_PostalCode_val.value
        ORDER BY addresses.id ASC;`);

    const activeOrders = await youfibreDb.query(
        `SELECT addresses.title, addresses.id as addr_id, Addr_Udprn_val.value as addr_udprn, Addr_PostalCode_val.value as addr_postcode, 'active' as status
        FROM db_records AS addresses
        LEFT JOIN schemas as schema ON (addresses.schema_id = schema.id)
        LEFT JOIN schemas_columns as Addr_Udprn_col ON (addresses.schema_id = Addr_Udprn_col.schema_id  AND Addr_Udprn_col.name = 'UDPRN')
        LEFT JOIN db_records_columns as Addr_Udprn_val ON (Addr_Udprn_val.record_id = addresses.id AND Addr_Udprn_col.id = Addr_Udprn_val.column_id)
        LEFT JOIN schemas_columns as Addr_PostalCode_col ON (addresses.schema_id = Addr_PostalCode_col.schema_id  AND Addr_PostalCode_col.name = 'PostalCode')
        LEFT JOIN db_records_columns as Addr_PostalCode_val ON (Addr_PostalCode_val.record_id = addresses.id AND Addr_PostalCode_col.id = Addr_PostalCode_val.column_id)
        WHERE schema.entity_name = 'Address'
        AND addresses.deleted_at IS NULL
        AND EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (parent_records.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND pipe_stages.key = 'OrderStageActive'
            AND parent_schema.entity_name = 'Order'
            AND associations.deleted_at IS NULL
            AND parent_records.deleted_at IS NULL
        )
        GROUP BY addresses.id, addresses.title, Addr_Udprn_val.value, Addr_PostalCode_val.value
        ORDER BY addresses.id ASC;`);

    const cancelledOrdersAndNoLead = await youfibreDb.query(
        `SELECT addresses.title, addresses.id as addr_id, Addr_Udprn_val.value as addr_udprn, Addr_PostalCode_val.value as addr_postcode, 'cancelled' as status
        FROM db_records AS addresses
        LEFT JOIN schemas as schema ON (addresses.schema_id = schema.id)
        LEFT JOIN schemas_columns as Addr_Udprn_col ON (addresses.schema_id = Addr_Udprn_col.schema_id  AND Addr_Udprn_col.name = 'UDPRN')
        LEFT JOIN db_records_columns as Addr_Udprn_val ON (Addr_Udprn_val.record_id = addresses.id AND Addr_Udprn_col.id = Addr_Udprn_val.column_id)
        LEFT JOIN schemas_columns as Addr_PostalCode_col ON (addresses.schema_id = Addr_PostalCode_col.schema_id  AND Addr_PostalCode_col.name = 'PostalCode')
        LEFT JOIN db_records_columns as Addr_PostalCode_val ON (Addr_PostalCode_val.record_id = addresses.id AND Addr_PostalCode_col.id = Addr_PostalCode_val.column_id)
        WHERE schema.entity_name = 'Address'
        AND addresses.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as parent_records ON (parent_records.id = associations.parent_record_id)
            WHERE associations.child_record_id = addresses.id
            AND parent_schema.entity_name = 'Lead'
            AND associations.deleted_at IS NULL
        )
       AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as orders ON (orders.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (orders.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND parent_schema.entity_name = 'Order'
            AND pipe_stages.key NOT IN ('OrderStageCancelled')
            AND associations.deleted_at IS NULL
        )
        AND EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS parent_schema ON (parent_schema.id = associations.parent_schema_id)
            LEFT JOIN db_records as orders ON (orders.id = associations.parent_record_id)
            LEFT JOIN pipelines_stages as pipe_stages ON (orders.stage_id = pipe_stages.id)
            WHERE associations.child_record_id = addresses.id
            AND parent_schema.entity_name = 'Order'
            AND pipe_stages.key = 'OrderStageCancelled'
            AND associations.deleted_at IS NULL
        )
        GROUP BY addresses.id, addresses.title, Addr_Udprn_val.value, Addr_PostalCode_val.value
        ORDER BY addresses.id ASC;`);


    const errors = [];
    const noMatch = [];
    for(const record of [
        ...leadsWithNoInProgressOrders,
        ...preOrdersAndNoActive,
        ...activeOrders,
        ...cancelledOrdersAndNoLead,
        ...preOrdersInProgress,
    ]) {
        try {
            console.log(record);

            let dataSet = {
                id: undefined,
                address_id: record.addr_id,
                address_full: record.title,
                address_status: record.status,
                address_udprn: record.addr_udprn,
                has_os_match: true,
                active_date: null,
            };

            // get Address and orders
            if(dataSet.address_id && dataSet.address_status === 'active') {

                const getRes = await
                    httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                        `v1.0/db/Address/${dataSet.address_id}?entities=["Order"]`,
                        apiToken,
                    );

                const addressObj = getRes['data'];

                const orderActiveDate = getPropertyFromRelation(addressObj, 'Order', 'ActiveDate');

                dataSet = Object.assign(
                    {},
                    dataSet,
                    { active_date: orderActiveDate ? moment(orderActiveDate).toISOString() : null },
                )
            }

            console.log('dataSet', dataSet);
            // get the first order in the array
            // get the active date of the order


            const osCoreRecord = await myahDb.query(
                `SELECT * FROM os.ab_plus WHERE udprn = '${record.addr_udprn}';`,
            );

            console.log('osCoreRecord', osCoreRecord);

            if(!osCoreRecord[0]) {
                const likeRecord = await myahDb.query(
                    `SELECT * FROM os.ab_plus WHERE postcode = '${record.addr_postcode}' AND geom IS NOT NULL LIMIT 1;`,
                );

                console.log('likeRecord', likeRecord);

                dataSet = Object.assign({}, { geom: likeRecord[0].geom }, dataSet, { has_os_match: false });
                delete dataSet.id;

            } else {
                dataSet = Object.assign({},
                    {
                        uprn: osCoreRecord[0].uprn,
                        parent_uprn: osCoreRecord[0].parent_uprn,
                        udprn: osCoreRecord[0].udprn,
                        usrn: osCoreRecord[0].usrn,
                        geom: osCoreRecord[0].geom,
                    }, dataSet,
                );
                delete dataSet.id;
            }

            console.log('dataSet', dataSet);

            // get the address
            const odinOrderRecord = await cosmosDb.query(
                `SELECT * FROM odin.orders WHERE address_id = '${record.addr_id}';`,
            );

            if(odinOrderRecord[0]) {
                // update
                const updateRes = await cosmosDb.manager.createQueryBuilder()
                    .update('odin.orders')
                    .set(dataSet)
                    .where('address_id = :address_id', { address_id: dataSet.address_id })
                    .execute();

                console.log('updateRes', updateRes);
            } else {
                // insert
                const insertRes = await cosmosDb.manager.createQueryBuilder()
                    .insert()
                    .into('odin.orders', Object.keys(dataSet))
                    .values(dataSet)
                    .onConflict(`("address_id") DO NOTHING`)
                    .execute();
                console.log('insertRes', insertRes);
            }

        } catch (e) {
            console.error(e);
            errors.push(record);
        }
    }

    cosmosDb.close();
    youfibreDb.close();

    console.log('noMatch', noMatch);
    console.log('errors', errors);
}

sync();
