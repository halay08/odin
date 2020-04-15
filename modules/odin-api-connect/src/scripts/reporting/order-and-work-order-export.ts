import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getFirstRelation, getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

class ReportRow {
    address: string;
    orderCreated: string;
    woNumber: string;
    woStage: string;
    woType: string;
    woCreated: string;
    woScheduledDate: string;
    woScheduledTime: string;
    lineItem: string;
    notes: string;
}

async function sync() {

    let argStartDate = process.argv.find(arg => arg.indexOf('start') > -1);
    let start = argStartDate ? argStartDate.split('=')[1] : null;

    let argEndDate = process.argv.find(arg => arg.indexOf('end') > -1);
    let end = argEndDate ? argEndDate.split('=')[1] : null;

    let argSubDays = process.argv.find(arg => arg.indexOf('subdays') > -1);
    let subdays = argSubDays ? argSubDays.split('=')[1] : null;

    function standardizeDate(property: any) {
        if(!!property) {
            return moment(property, 'YYYY-MM-DD').format('DD/MM/YYYY');
        }
        return undefined;
    }

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

        let startDate = moment().utc().subtract(7, 'days').startOf('day').format('DD/MM/YYYY');
        let endDate = moment().utc().format('DD/MM/YYYY');
        let queryStart = moment().utc().subtract(7, 'days').startOf('day').format('YYYY-MM-DD');

        // if the user specifies dates use the dates from the query
        if(subdays) {

            startDate = moment().utc().subtract(subdays, 'days').startOf('day').format('DD/MM/YYYY');
            queryStart = moment().utc().subtract(subdays, 'days').startOf('day').format('YYYY-MM-DD');

        }

        if(start) {

            startDate = moment(start).utc().startOf('day').format('DD/MM/YYYY');
            queryStart = moment(start).utc().startOf('day').format('YYYY-MM-DD');

        }

        if(end) {

            endDate = moment(end).utc().format('l');

        }

        console.log('startDate', startDate);
        console.log('endDate', endDate);
        console.log('queryStart', queryStart);

        const data = await pg.query(
            `SELECT
            db_records.id,
            db_records.record_number,
            CONCAT(u.firstname, ' ', u.lastname) as full_name,
            to_char(db_records.created_at::date, 'DD-MM-YYYY') as created
            FROM db_records
            LEFT JOIN organizations_users as u ON (db_records.created_by_id = u.id)
            LEFT JOIN pipelines_stages on (db_records.stage_id = pipelines_stages.id)
            WHERE entity = 'FieldServiceModule:WorkOrder'
            AND db_records.deleted_at IS NULL
            AND db_records.created_at > '${queryStart}'`);

        const report = [];

        console.log('data', data.length);

        if(!data[0]) {
            return;
        }
        for(const record of data) {

            const workOrderRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.FIELD_SERVICE_MODULE),
                `v1.0/db/WorkOrder/${record.id}?entities=["Address", "OrderItem", "ServiceAppointment", "Order", "Note"]`,
                apiToken,
            );

            const workOrder = workOrderRes['data'];
            const address = getFirstRelation(workOrder, 'Address');
            const orderItems = workOrder['OrderItem'].dbRecords;
            const serviceAppointment = getFirstRelation(workOrder, 'ServiceAppointment');
            const order = getFirstRelation(workOrder, 'Order');
            const notes = workOrder['Note'].dbRecords;


            let itemNames = '';

            if(orderItems) {
                for(const item of orderItems) {
                    itemNames = itemNames.concat(`${item.title} / `);
                }
            }

            let woNotes = '';
            if(notes) {
                for(const item of notes) {
                    const body = getProperty(item, 'Body');
                    woNotes = woNotes.concat(`${body}; `);
                }
            }

            const reportRow = new ReportRow();
            reportRow.address = address ? address.title : undefined;
            reportRow.orderCreated = order ? standardizeDate(order.createdAt) : undefined;
            reportRow.woNumber = workOrder.recordNumber;
            reportRow.woStage = workOrder.stage.name;
            reportRow.woType = getProperty(workOrder, 'Type');
            reportRow.woCreated = standardizeDate(workOrder.createdAt);
            reportRow.woScheduledDate = serviceAppointment ? standardizeDate(getProperty(
                serviceAppointment,
                'Date',
            )) : undefined;
            reportRow.woScheduledTime = serviceAppointment ? getProperty(
                serviceAppointment,
                'TimeBlock',
            ) : undefined;
            reportRow.lineItem = itemNames;
            reportRow.notes = woNotes;

            console.log('reportRow', reportRow);
            report.push(reportRow);

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

            fs.writeFileSync(`order-and-work-order-report-${moment().format('DD-MM-YYYY')}.csv`, csv)

        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
