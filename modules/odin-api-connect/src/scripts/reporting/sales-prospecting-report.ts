import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

// run at midnight
async function sync() {

    try {

        // Command line arguments
        let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
        let emails = argEmails ? argEmails.split('=')[1] : null;

        if(!emails) {
            throw Error('comma separated list of emails required or a single email address');
        }


        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const today = moment().utc().subtract(1, 'days').format('l');
        const queryStart = moment().utc().subtract(1, 'days').startOf('day').format('YYYY-MM-DD');

        console.log('today', today);
        console.log('queryStart', queryStart);

        const visitsByAgent = await pg.query(
            `SELECT CONCAT(t2.firstname, ' ', t2.lastname) AS full_name, COUNT(t3.entity_name) as total_visits \
                FROM db_records as t1 \
                LEFT JOIN organizations_users as t2 ON (t1.created_by_id = t2.id)\
                LEFT JOIN schemas as t3 ON (t1.schema_id = t3.id)\
                WHERE t3.entity_name = 'Visit'\
                AND t1.deleted_at IS NULL \
                AND t1.created_at >= '${queryStart}'\
                GROUP BY full_name;`,
        );

        const leadsByAgent = await pg.query(
            `SELECT CONCAT(t2.firstname, ' ', t2.lastname) AS full_name, COUNT(t3.entity_name) \
                FROM db_records as t1 \
                LEFT JOIN organizations_users as t2 ON (t1.created_by_id = t2.id)\
                LEFT JOIN schemas as t3 ON (t1.schema_id = t3.id)\
                WHERE t3.entity_name = 'Lead'\
                AND t1.deleted_at IS NULL \
                AND t1.created_at >= '${queryStart}'\
                GROUP BY full_name;`,
        );


        const ordersByAgent = await pg.query(`SELECT \
             CONCAT(orgusr.firstname, ' ', orgusr.lastname) as full_name, \
             to_char(float8 (SUM(dbrc2.value::double precision)), 'FM999999999.00') as sum_total_price,\
             COUNT(DISTINCT(dbr.id)) as order_count, \
             to_char(float8 ((SUM(dbrc2.value::double precision)) / COUNT(DISTINCT(dbr.id)) / 1.2), 'FM999999999.00') as arpu \
             FROM db_records as dbr \
             LEFT JOIN organizations_users as orgusr ON (dbr.created_by_id = orgusr.id) \
             LEFT JOIN schemas s1 ON dbr.schema_id = s1.id \
             RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id \
             RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalPrice') \
             WHERE s1.entity_name = 'Order' \
             AND dbr.deleted_at IS NULL \
             AND dbr.created_at >= '${queryStart}' \
             GROUP BY full_name;`,
        );

        const visitOutcomes = await pg.query(`SELECT t1.value AS visit_outcome, COUNT(t1.value)\
                FROM db_records_columns as t1 \
                LEFT JOIN organizations_users as t2 ON (t1.last_modified_by_id = t2.id)\
                LEFT JOIN schemas as t3 ON (t1.schema_id = t3.id)\
                LEFT JOIN schemas_columns as t4 ON (t1.column_id = t4.id)\
                WHERE t3.entity_name = 'Visit' AND t4.name = 'Outcome'\
                AND t1.created_at >= '${queryStart}' \
                GROUP BY visit_outcome;`,
        );

        const dailyArpu = await pg.query(`SELECT \
            to_char(float8 (SUM(dbrc2.value::double precision)), 'FM999999999.00') sum_total_price,\
            COUNT(DISTINCT(dbr.id)) as order_count,\
            to_char(float8 ((SUM(dbrc2.value::double precision)) / COUNT(DISTINCT(dbr.id)) / 1.2), 'FM999999999.00') as arpu \
            FROM db_records as dbr\
            LEFT JOIN organizations_users as orgusr ON (dbr.created_by_id = orgusr.id)\
            LEFT JOIN schemas s1 ON dbr.schema_id = s1.id\
            RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id\
            RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalPrice')\
            WHERE s1.entity_name = 'Order'\
            AND dbr.created_at >= '${queryStart}';`,
        );

        console.log({
            date: today,
            visitsByAgent,
            visitOutcomes,
            leadsByAgent,
            ordersByAgent,
            dailyArpu: dailyArpu[0],
        });

        let parsedEmails = [];
        const split = emails.split(',');

        if(split && split.length > 0) {

            parsedEmails = split.map(elem => elem.trim());

        } else {

            parsedEmails = [ emails ]

        }

        const newEmail = new SendgridEmailEntity();
        newEmail.to = parsedEmails;
        newEmail.from = 'hello@youfibre.com';
        newEmail.templateId = 'd-6d39d258b8e2467187b7ae9f3b1cfe7a';
        newEmail.dynamicTemplateData = {
            date: today,
            visitsByAgent,
            visitOutcomes,
            leadsByAgent,
            ordersByAgent,
            dailyArpu: dailyArpu[0],
        };

        console.log({
            date: today,
            visitsByAgent,
            visitOutcomes,
            leadsByAgent,
            ordersByAgent,
            dailyArpu: dailyArpu[0],
        });

        console.log('newEmail', newEmail);

        const res = await HelpersNotificationsApi.sendDynamicEmail(
            newEmail,
            { authorization: 'Bearer ' + apiToken },
        );

        console.log('res', res)

        return;
    } catch (e) {
        console.error(e);
    }
}

sync();
