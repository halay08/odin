import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import moment = require('moment');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// Run this script every every day at midnight
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

        const records = await pg.query(
            `SELECT orders.id, orders.title
            FROM db_records as orders
            LEFT JOIN schemas on (orders.schema_id = schemas.id)
            LEFT JOIN pipelines_stages ON (pipelines_stages.id = orders.stage_id)
            LEFT JOIN db_records_columns as c on (c.record_id = orders.id AND c.column_name = 'RequestedDeliveryDate')
            WHERE schemas.entity_name = 'Order'
            AND NOT EXISTS (
                SELECT id from db_records_associations as a
                WHERE a.parent_record_id = orders.id
                AND a.child_entity = 'OrderModule:BillingAdjustment'
            )
            AND orders.deleted_at IS NULL
            AND c.value IS NOT NULl
            AND orders.stage_updated_at > '2020-08-30'
            AND orders.stage_updated_at < now() + '1 days'::interval
            AND pipelines_stages.key = 'OrderStageActive'`);

        console.log('records', records.length);

        const modified = [];
        let hasFreePeriods = 0;
        let voidInvoices = 0;
        let totalActiveOrders = records.length;

        const activeOrderInvoicesToVoid = [];
        const activeOrdersWithVoice = [];

        for(const record of records) {
            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.id}?entities=["OrderItem", "BillingAdjustment"]`,
                apiToken,
            );
            const order = orderRes['data'];

            const billingAdjustments = order['BillingAdjustment'].dbRecords;

            if(order && order.stage.key === 'OrderStageActive') {

                // Check for any order item discrepancies
                const requestedDeliveryDate = getProperty(order, 'RequestedDeliveryDate');
                const billingStartDate = getProperty(order, 'BillingStartDate');


                const diffFromBillingStart = moment(billingStartDate).diff(requestedDeliveryDate, 'months');
                // if the requested delivery date is > 0 then add a billing adjustment free period for that amount
                if(diffFromBillingStart > 0 && moment(requestedDeliveryDate).isBefore('2020-09-01')) {
                    console.log('DIFF ADD FREE PERIOD', diffFromBillingStart);
                    // If there is no BillingAdjustment on the order add one
                    if(!billingAdjustments) {
                        console.log('order', order.title);
                        console.log('requestedDeliveryDate', requestedDeliveryDate);
                        console.log('billingStartDate', billingStartDate);
                        console.log('NO BILLING ADJUSTMENT', diffFromBillingStart);
                        const newBillingAdjustment = new DbRecordCreateUpdateDto();
                        newBillingAdjustment.entity = `OrderModule:BillingAdjustment`;
                        newBillingAdjustment.title = 'Adding free periods for delay in delivering the service.'
                        newBillingAdjustment.properties = {
                            FreePeriodLength: diffFromBillingStart,
                        };
                        newBillingAdjustment.associations = [
                            {
                                recordId: order.id,
                            },
                        ];

                        console.log({ newBillingAdjustment });
                        const createRes = await
                            httpClient.postRequest(
                                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                                `v1.0/db/batch?upsert=true`,
                                apiToken,
                                [ newBillingAdjustment ],
                            );

                        console.log('createRes', createRes);

                    }
                    hasFreePeriods += 1;
                }
            }
        }

        console.log({
            modified,
            totalActiveOrders,
            hasFreePeriods,
            voidInvoices,
            activeOrdersWithVoice,
            activeOrderInvoicesToVoid,
        });
        return {
            modified,
            totalActiveOrders,
            hasFreePeriods,
            voidInvoices,
            activeOrdersWithVoice,
            activeOrderInvoicesToVoid,
        };
    } catch (e) {
        console.error(e);
    }
}

sync();
