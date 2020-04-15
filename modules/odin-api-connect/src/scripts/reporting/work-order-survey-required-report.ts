import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {

    // Command line arguments
    let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
    let emails = argEmails ? argEmails.split('=')[1] : null;

    if(!emails) {
        throw Error('comma separated list of emails required or a single email address');
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

        const data = await pg.query(`
            SELECT
            r.id,
            r.title,
            r.record_number,
            c.value as type,
            s.name,
            CONCAT(u.firstname, ' ', u.lastname) as created_by,
            to_char(c1.value::date, 'DD/MM/YYYY') as appointment_date,
            DATE_PART('day', AGE(c1.value::date, now())) AS time_to_appointment
            FROM db_records r
            LEFT JOIN organizations_users as u ON (r.created_by_id = u.id)
            LEFT JOIN pipelines_stages as s on (r.stage_id = s.id)
            LEFT JOIN db_records_columns c on (r.id = c.record_id and c.column_name = 'Type')
            LEFT JOIN db_records_associations a on (a.parent_record_id = r.id and a.child_entity = 'FieldServiceModule:ServiceAppointment')
            LEFT JOIN db_records as r2 on (r2.id = a.child_record_id)
            LEFT JOIN db_records_columns c1 on (r2.id = c1.record_id and c1.column_name = 'Date')
            WHERE r.entity = 'FieldServiceModule:WorkOrder'
            AND s.key = 'WorkOrderStageScheduled'
            AND r.deleted_at IS NULL
            AND r2.deleted_at IS NULL
            AND to_timestamp(c1.value, 'YYYY-MM-DD') < now() + interval '11 days'
            AND c.value = 'INSTALL'
            ORDER BY c1.value ASC
        `);

        const report = [];

        console.log('data', data.length);

        if(!data[0]) {
            return;
        }

        let csv = '';
        const fields = Object.keys(data[0]).map(elem => (elem));

        try {
            // csv = parse({ data: report, fields });
            const parser = new Parser({ fields });
            csv = parser.parse(data);
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
            subject: 'Work orders need to be surveyed',
            body: `Survey required for the (${data.length}) work orders attached.`,
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

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
