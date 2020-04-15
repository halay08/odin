import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import moment = require('moment');

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// run at 12:30 am UTC
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


        const inactiveMandatesRes = await httpClient.getRequest(
            Utilities.getBaseUrl(SERVICE_NAME.CONNECT_MODULE),
            `v1.0/reporting/orders-inactive-mandate`,
            apiToken,
        );

        const noMandatesRes = await httpClient.getRequest(
            Utilities.getBaseUrl(SERVICE_NAME.CONNECT_MODULE),
            `v1.0/reporting/orders-no-mandate`,
            apiToken,
        );

        console.log([ ...inactiveMandatesRes['data'], ...noMandatesRes['data'] ].length);

        const report = [];

        for(const record of [ ...inactiveMandatesRes['data'], ...noMandatesRes['data'] ]) {

            console.log('#record', record);

            record.service_appointment_date = null;

            const contactRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                `v1.0/db/Contact/${record.contact_id}?entities=["WorkOrder"]&filters=["Type:INSTALL"]`,
                apiToken,
            );

            console.log('contactRes', contactRes);

            const contact = contactRes['data'];
            const workOrders = contact['WorkOrder'].dbRecords;

            if(workOrders) {

                console.log('workOrders', workOrders);
                // get the work orders that are not done or cancelled
                const workOrder = workOrders.find(elem => !elem.stage.isSuccess && !elem.stage.isFail);

                // if the customer has an active work order
                if(workOrder) {
                    const workOrderRes = await httpClient.getRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.FIELD_SERVICE_MODULE),
                        `v1.0/db/WorkOrder/${workOrder.id}?entities=["ServiceAppointment"]`,
                        apiToken,
                    );

                    console.log('workOrderRes', workOrderRes);

                    const workOrderData = workOrderRes['data'];
                    const serviceAppointment = workOrderData['ServiceAppointment'].dbRecords;

                    if(serviceAppointment) {
                        console.log('serviceAppointment', getProperty(serviceAppointment[0], 'Date'));
                        record.service_appointment_date = moment(
                            getProperty(serviceAppointment[0], 'Date'),
                            'YYYY-MM-DD',
                        ).format('DD/MM/YYYY');
                    }
                }
            }

            console.log('mandate issues', record);
            report.push(record);

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

            const newEmail = new SendgridEmailEntity();
            newEmail.to = [
                'frank@youfibre.com',
                'marta@youfibre.com',
            ];
            newEmail.from = 'hello@youfibre.com';
            newEmail.templateLabel = 'SENDGRID_TEXT_EMAIL'
            newEmail.templateId = 'd-11fb70c66a344dd881d9064f5e03aebf';
            newEmail.dynamicTemplateData = {
                subject: 'Mandate issues report',
                body: 'Mandate issues report attached',
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

        return true;
    } catch (e) {
        console.error(e);
    }
}

sync();
