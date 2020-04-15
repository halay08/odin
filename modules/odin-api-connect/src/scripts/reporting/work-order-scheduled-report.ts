import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
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
    number: string;
    type: string;
    address: string;
    lineItem: string;
    date: string;
    time: string;
}

async function sync() {

    // Command line arguments
    let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
    let emails = argEmails ? argEmails.split('=')[1] : null;

    if(!emails) {
        throw Error('comma separated list of emails required or a single email address');
    }

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
            AND pipelines_stages.key = 'WorkOrderStageScheduled'
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
                `v1.0/db/WorkOrder/${record.id}?entities=["Address", "OrderItem", "ServiceAppointment"]`,
                apiToken,
            );

            const workOrder = workOrderRes['data'];
            const address = workOrder['Address'].dbRecords;
            const orderItems = workOrder['OrderItem'].dbRecords;
            const serviceAppointments = workOrder['ServiceAppointment'].dbRecords;

            if(orderItems && workOrder) {

                let itemNames = '';

                for(const item of orderItems) {
                    itemNames = itemNames.concat(`${item.title} / `);
                }

                const reportRow = new ReportRow();
                reportRow.number = workOrder.recordNumber;
                reportRow.type = getProperty(workOrder, 'Type');
                reportRow.lineItem = itemNames;
                reportRow.address = address ? address[0].title : undefined;
                reportRow.date = serviceAppointments ? standardizeDate(getProperty(
                    serviceAppointments[0],
                    'Date',
                )) : undefined;
                reportRow.time = serviceAppointments ? getProperty(
                    serviceAppointments[0],
                    'TimeBlock',
                ) : undefined;

                console.log('reportRow', reportRow);
                report.push(reportRow);

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

            const buf = Buffer.from(csv, 'utf8');

            let parsedEmails = [];
            const split = emails.split(',');

            if(split && split.length > 0) {

                parsedEmails = split.map(elem => elem.trim());

            } else {

                parsedEmails = [ emails ]

            }

            const newEmail = new SendgridEmailEntity();
            newEmail.to = parsedEmails;
            newEmail.from = 'cs@youfibre.com';
            newEmail.templateId = 'd-11fb70c66a344dd881d9064f5e03aebf';
            newEmail.dynamicTemplateData = {
                subject: 'Work orders ( Scheduled )',
                body: `date range: ${startDate} - ${endDate}, total: ${data.length}`,
            };
            newEmail.attachments = [
                {
                    content: buf.toString('base64'),
                    filename: 'report.csv',
                    type: 'csv',
                    disposition: 'attachment',
                },
            ];

            await HelpersNotificationsApi.sendDynamicEmail(
                newEmail,
                { authorization: 'Bearer ' + apiToken },
            );

        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
