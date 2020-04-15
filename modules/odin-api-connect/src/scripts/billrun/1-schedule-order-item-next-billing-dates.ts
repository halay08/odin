import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// It will adjust NextInvoiceDate, NextBillingDate for anything in the past
async function sync() {
    try {
        const httpClient = new BaseHttpClient();

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const queryStart = moment().utc().startOf('day').format('YYYY-MM-DD');
        console.log('queryStart', queryStart);

        const orderItems = await pg.query(
            `SELECT c.record_id, c.value as next_invoice_date
            FROM db_records_columns as c
            LEFT JOIN db_records as r  ON (c.record_id = r.id)
            LEFT JOIN db_records_associations a on (a.child_record_id = r.id and a.parent_entity = 'OrderModule:Order')
            LEFT JOIN db_records r1 on (r1.id = a.parent_record_id)
            LEFT JOIN pipelines_stages s on (r1.stage_id = s.id)
            WHERE r.entity = 'OrderModule:OrderItem'
            AND s.key = 'OrderStageActive'
            AND r.deleted_at IS NULL
            AND c.column_name = 'NextInvoiceDate'
            AND c.value::date < '${queryStart}'
            GROUP BY c.record_id, c.value`);

        console.log('orderItems', orderItems)

        let orderItemsGrouped = {};
        for(const record of orderItems) {
            // get the order items order
            const order = await pg.query(
                `
                SELECT parent_record_id
                FROM db_records_associations a
                WHERE a.parent_entity = 'OrderModule:Order'
                AND a.deleted_at IS NULL
                AND child_record_id = '${record.record_id}'`);


            if(orderItemsGrouped[order[0].parent_record_id]) {
                const association = new DbRecordAssociationCreateUpdateDto();
                association.recordId = record.record_id;

                orderItemsGrouped[order[0].parent_record_id] = [
                    ...orderItemsGrouped[order[0].parent_record_id],
                    ...[ association ],
                ];
            } else {
                const association = new DbRecordAssociationCreateUpdateDto();
                association.recordId = record.record_id;

                orderItemsGrouped[order[0].parent_record_id] = [ ...[ association ] ];
            }
        }

        console.log('orderItemsGrouped', orderItemsGrouped)

        for(const orderIdKey of Object.keys(orderItemsGrouped)) {

            console.log('get order')
            console.log(`v1.0/db/Order/${orderIdKey}`)

            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${orderIdKey}`,
                apiToken,
            );
            const order = orderRes['data'];

            if(order && order.stage.name.toLowerCase() === 'active') {
                const processRes = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                    `v1.0/orders/${order.id}/billing`,
                    apiToken,
                    {
                        BillingStartDate: getProperty(order, 'BillingStartDate'),
                        ContractStartDate: getProperty(order, 'ContractStartDate') || getProperty(
                            order,
                            'BillingStartDate',
                        ),
                    },
                );
                console.log('processRes', processRes);
            }
        }
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
