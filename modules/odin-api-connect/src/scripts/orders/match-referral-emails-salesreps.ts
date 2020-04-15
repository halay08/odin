import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

const { CONTACT, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

async function sync() {

    // Fetch data from sandbox
    try {

        // Command line arguments
        let argInterval = process.argv.find(arg => arg.indexOf('interval') > -1);
        let interval = argInterval ? argInterval.split('=')[1] : null;

        const httpClient = new BaseHttpClient();

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        let unMatchedEmails = [];
        let matched = 0;

        let records = [];

        if(interval) {

            records = await pg.query(
                `SELECT t1.id as record_id FROM db_records as t1 LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
             WHERE t2.entity_name = 'Order' AND t1.deleted_at IS NULL AND t1.created_at > now() - '${interval}'::interval`);

        } else {

            records = await pg.query(
                `SELECT t1.id as record_id FROM db_records as t1 LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) \
             WHERE t2.entity_name = 'Order' AND t1.deleted_at IS NULL AND t1.created_at > now() - interval '1 days'`);

        }

        console.log('records', records.length);

        for(const record of records) {

            // console.log('record', record);
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.record_id}?entities=["${CONTACT}", "${ORDER_ITEM}"]`,
                apiToken,
            );

            const order = orderRes['data'];
            console.log('order', order);

            if(!!order) {
                if(!!order[CONTACT]) {
                    let ReferralEmail = getPropertyFromRelation(order, CONTACT, 'ReferralEmail');
                    console.log('ReferralEmail', ReferralEmail);
                    if(!!ReferralEmail) {
                        matched = matched + 1;
                        // Find organization user by email
                        const orgUser = await pg.query(`SELECT * FROM organizations_users WHERE email = '${ReferralEmail.toLowerCase()}'`);
                        if(!orgUser[0]) {
                            console.log('orgUser is not matched', ReferralEmail);
                            unMatchedEmails.push(ReferralEmail);
                        } else {
                            for(const item of order[ORDER_ITEM].dbRecords) {
                                const updateOrderItem = await pg.query(`UPDATE db_records SET created_by_id = '${orgUser[0].id}', last_modified_by_id = '${orgUser[0].id}' WHERE db_records.id = '${item.id}'`);
                                const updateOrderItemAssociation = await pg.query(`UPDATE db_records_associations SET created_by_id = '${orgUser[0].id}', last_modified_by_id = '${orgUser[0].id}' WHERE  db_records_associations.parent_record_id = '${item.id}'`);
                                console.log('updateOrderItem', updateOrderItem);
                                console.log('updateOrderItemAssociation', updateOrderItemAssociation);
                            }
                            const updateOrder = await pg.query(`UPDATE db_records SET created_by_id = '${orgUser[0].id}', last_modified_by_id = '${orgUser[0].id}' WHERE db_records.id = '${order.id}'`);
                            const updateOrderAssociation = await pg.query(`UPDATE db_records_associations SET created_by_id = '${orgUser[0].id}', last_modified_by_id = '${orgUser[0].id}' WHERE  db_records_associations.parent_record_id = '${order.id}'`);
                            console.log('updateOrder', updateOrder);
                            console.log('updateOrderAssociation', updateOrderAssociation);
                        }
                    }
                } else {
                    console.log('unMatchedEmails', unMatchedEmails.push(order.id));
                }
            }
        }
        console.log('matched', matched);
        console.log('unMatchedEmails', unMatchedEmails);
        console.log('unMatchedEmails', unMatchedEmails.length);
        return;
    } catch (e) {
        console.error(e);
    }
}

sync();
