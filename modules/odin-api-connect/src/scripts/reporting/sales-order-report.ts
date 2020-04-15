import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {
    try {

        // Command line arguments
        let argEmails = process.argv.find(arg => arg.indexOf('emails') > -1);
        let emails = argEmails ? argEmails.split('=')[1] : null;

        if(!emails) {
            throw Error('comma separated list of emails required or a single email address');
        }

        let argStartDate = process.argv.find(arg => arg.indexOf('start') > -1);
        let start = argStartDate ? argStartDate.split('=')[1] : null;

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        let startDate = moment().utc().subtract(1, 'days').format('DD/MM/YYYY');
        let queryStart = moment().utc().subtract(1, 'days').startOf('day').format('YYYY-MM-DD');

        if(start) {

            startDate = moment(start).utc().startOf('day').format('DD/MM/YYYY');
            queryStart = moment(start).utc().startOf('day').format('YYYY-MM-DD');

        }

        console.log('startDate', startDate);
        console.log('queryStart', queryStart);


        const orderProductMix = await pg.query(`SELECT \
            dbr.title as line_item_name,\
            to_char(float8 (SUM(dbrc2.value::double precision)), 'FM999999999.00') as sum_total_price,\
            COUNT(dbr.id) as line_item_count \
            FROM db_records as dbr\
            LEFT JOIN schemas s1 ON dbr.schema_id = s1.id\
            RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id\
            RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalPrice')\
            WHERE s1.entity_name = 'OrderItem'\
            AND dbr.created_at >= '${queryStart}'\
            AND dbr.deleted_at IS NULL \
            GROUP BY line_item_name;`,
        );

        const orderRevenueByUser = await pg.query(`SELECT
        CONCAT(u.firstname, ' ', u.lastname) as full_name,
        to_char(float8 (SUM(c.value::double precision)), 'FM999999999.00') as sum_total_price,
        COUNT(DISTINCT(dbr.id)) as order_count,
        to_char(float8 ((SUM(c.value::double precision)) / COUNT(DISTINCT(dbr.id)) / 1.2), 'FM999999999.00') as arpu
        FROM db_records as dbr
        RIGHT JOIN organizations_users as u ON (dbr.created_by_id = u.id)
        RIGHT JOIN db_records_columns as c ON (c.record_id = dbr.id AND c.column_name = 'TotalPrice')
        WHERE dbr.entity = 'OrderModule:Order'
        AND dbr.created_at >= '${queryStart}'
        AND dbr.deleted_at IS NULL
        GROUP BY full_name;`,
        );

        const arpu = await pg.query(`SELECT \
            to_char(float8 (SUM(dbrc2.value::double precision)), 'FM999999999.00') sum_total_price,\
            COUNT(DISTINCT(dbr.id)) as order_count,\
            to_char(float8 ((SUM(dbrc2.value::double precision)) / COUNT(DISTINCT(dbr.id)) / 1.2), 'FM999999999.00') as arpu \
            FROM db_records as dbr\
            LEFT JOIN organizations_users as orgusr ON (dbr.created_by_id = orgusr.id)\
            LEFT JOIN schemas s1 ON dbr.schema_id = s1.id\
            RIGHT JOIN schemas_columns sc2 ON dbr.schema_id = sc2.schema_id\
            RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = dbr.id AND sc2.id = dbrc2.column_id AND sc2.name = 'TotalPrice')\
            WHERE s1.entity_name = 'Order'\
            AND dbr.deleted_at IS NULL \
            AND dbr.created_at >= '${queryStart}';`,
        );


        console.log({
            period: startDate,
            orderProductMix,
            orderRevenueByUser,
            arpu,
        });

        let parsedEmails = [];
        const split = emails.split(',');

        if(split && split.length > 0) {

            parsedEmails = split.map(elem => elem.trim());

        } else {

            parsedEmails = [ emails ]

        }
        // process.exit(1);
        const newEmail = new SendgridEmailEntity();
        newEmail.to = parsedEmails;
        newEmail.from = 'hello@youfibre.com';
        newEmail.templateId = 'd-062a62a78ae54d03ba51e32dbd3d4337';
        newEmail.dynamicTemplateData = {
            subject: 'YF Order Metrics',
            period: startDate,
            orderProductMix,
            orderRevenueByUser,
            arpu: arpu[0],
        };

        console.log('newEmail', newEmail);

        const res = await HelpersNotificationsApi.sendDynamicEmail(
            newEmail,
            { authorization: 'Bearer ' + apiToken },
        );
        console.log('res', res);
        return;
    } catch (e) {
        console.error(e);
    }
}

sync();


