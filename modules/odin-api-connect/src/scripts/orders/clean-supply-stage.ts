import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import {
    getAllRelations,
    getFirstRelation,
    getProperty,
} from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

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

        // Count # of months since order billing start date
        // Count # of invoices for the order
        // Check that the total orders = total invoices
        const records = await pg.query(
            `SELECT r.id
            FROM db_records r
            LEFT JOIN pipelines_stages s ON (s.id = r.stage_id)
            WHERE entity = 'OrderModule:Order'
            AND s.key = 'OrderStageSupply'
            AND r.deleted_at IS NULL
            `);

        console.log('records', records.length);

        let report = [];

        for(const record of records) {

            const orderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.ORDER_MODULE),
                `v1.0/db/Order/${record.id}?entities=["WorkOrder", "Address"]`,
                apiToken,
            );

            const order = orderRes['data'];
            const workOrders = getAllRelations(order, 'WorkOrder');
            const address = getFirstRelation(order, 'Address');

            const salesStatus = getProperty(address, 'SalesStatus');

            if(salesStatus !== 'ORDER' && order.stage.key === 'OrderStageSupply') {

                // get the order stage
                const orderStageRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                    `v1.0/stages/byKey/OrderStagePreOrder`,
                    apiToken,
                );

                const orderStage = orderStageRes['data'];

                console.log('orderStage', orderStage);
                if(orderStage) {
                    const update = await pg.query(`UPDATE db_records set stage_id = '${orderStage.id}' WHERE id = '${order.id}'`);

                    console.log('update', update);
                }

                // add a note to the order
                const newNote = new DbRecordCreateUpdateDto();
                newNote.entity = 'SupportModule:Note';
                newNote.properties = {
                    Body: 'Cancelled because the build status was not correct and order should have not moved into Supply',
                }
                newNote.associations = [
                    {
                        recordId: order.id,
                    },
                ]
                console.log('newNote', newNote);
                const newNoteRes = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.SUPPORT_MODULE),
                    `v1.0/db/Note`,
                    apiToken,
                    [ newNote ],
                );

                console.log('newNoteRes', newNoteRes);

                if(!workOrders) {
                    // get diff from billingStart date to orderItem nextBillingDate
                    // get diff from billingStart to today
                    console.log(`${order.title}, '${order.stage.name}`);
                    report.push({
                        order: order.title,
                        orderNumber: order.number,
                        orderOldStage: order.stage.name,
                        orderNewStage: orderStage.name,
                        workOrder: null,
                        workOrderNumber: null,
                        workOrderOldStage: null,
                        workOrderNewStage: null,
                        addressSalesStatus: salesStatus,
                        date: moment().utc().format('DD/MM/YYYY'),
                    })
                    // If no invoices and order is active, assign order to a user and flag with an issue.
                } else {

                    for(const workOrder of workOrders) {

                        // cancel the work order
                        const workOrderStageRes = await httpClient.getRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                            `v1.0/stages/byKey/WorkOrderStageCancelled`,
                            apiToken,
                        );

                        const workOrderStage = workOrderStageRes['data'];

                        console.log('workOrderStage', workOrderStage);

                        const workOrderUpdate = new DbRecordCreateUpdateDto();
                        workOrderUpdate.entity = workOrder.entity;
                        workOrderUpdate.stageId = workOrderStage.id;

                        const workOrderUpdateRes = await httpClient.putRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.FIELD_SERVICE_MODULE),
                            `v1.0/db/WorkOrder/${workOrder.id}`,
                            apiToken,
                            workOrderUpdate,
                        );

                        console.log('workOrderUpdateRes', workOrderUpdateRes);

                        report.push({
                            order: order.title,
                            orderNumber: order.number,
                            orderOldStage: order.stage.name,
                            orderNewStage: orderStage.name,
                            workOrder: workOrder.title,
                            workOrderNumber: workOrder.recordNumber,
                            workOrderOldStage: workOrder.stage.name,
                            workOrderNewStage: workOrderStage.name,
                            addressSalesStatus: salesStatus,
                            date: moment().utc().format('DD/MM/YYYY'),
                        })
                    }
                }
            }
        }

        if(report[0]) {

            let csv = '';
            const fields = Object.keys(report[0]).map(elem => (elem));

            try {
                // csv = parse({ data: report, fields });
                const parser = new Parser({ fields });
                csv = parser.parse(report);
            } catch (err) {
                console.error(err);
            }

            try {
                // csv = parse({ data: report, fields });
                const parser = new Parser({ fields });
                csv = parser.parse(report);
            } catch (err) {
                console.error(err);
            }

            fs.writeFileSync(`clean-supply-stage-${moment().format('DD-MM-YYYY')}.csv`, csv)

        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
