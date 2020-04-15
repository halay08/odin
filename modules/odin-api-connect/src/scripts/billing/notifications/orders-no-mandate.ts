import { HelpersNotificationsApi } from '@d19n/client/dist/helpers/helpers.notifications.api';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

async function sync() {

    try {
        const connection = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const data = await connection.query(`SELECT
        records.id AS record_id,
        dbrc1.value as firstName,
        dbrc2.value as lastName,
        dbrc3.value AS email_address,
        dbrc4.value AS phone,
        orders.title as order_title,
        orders.record_number as record_number,
        pipelines_stages.name as stage_name,
        to_char(orders.created_at, 'DD/MM/YYYY') as order_created,
        'contact is missing payment method' as description
        FROM db_records AS records
        RIGHT JOIN schemas AS contact_schema ON (contact_schema.id = records.schema_id AND contact_schema.entity_name = 'Contact')
        RIGHT JOIN schemas_columns sc1 ON records.schema_id = sc1.schema_id
        RIGHT JOIN db_records_columns dbrc1 ON (dbrc1.record_id = records.id AND sc1.id = dbrc1.column_id AND sc1.name = 'FirstName')
        RIGHT JOIN schemas_columns sc2 ON records.schema_id = sc2.schema_id
        RIGHT JOIN db_records_columns dbrc2 ON (dbrc2.record_id = records.id AND sc2.id = dbrc2.column_id AND sc2.name = 'LastName')
        RIGHT JOIN schemas_columns sc3 ON records.schema_id = sc3.schema_id
        RIGHT JOIN db_records_columns dbrc3 ON (dbrc3.record_id = records.id AND sc3.id = dbrc3.column_id AND sc3.name = 'EmailAddress')
        RIGHT JOIN schemas_columns sc4 ON records.schema_id = sc4.schema_id
        RIGHT JOIN db_records_columns dbrc4 ON (dbrc4.record_id = records.id AND sc4.id = dbrc4.column_id AND sc4.name = 'Phone')
        RIGHT JOIN db_records_associations AS associations ON (associations.child_record_id = records.id)
        RIGHT JOIN schemas AS order_schema ON (order_schema.id = associations.parent_schema_id AND order_schema.entity_name = 'Order')
        RIGHT JOIN db_records as orders on (associations.parent_record_id = orders.id)
        RIGHT JOIN pipelines_stages on (pipelines_stages.id = orders.stage_id)
        WHERE pipelines_stages.key IN ('OrderStageSupply', 'OrderStageActive')
        AND associations.child_record_id = records.id
        AND records.deleted_at IS NULL
        AND NOT EXISTS (
            SELECT associations.id
            FROM db_records_associations AS associations
            RIGHT JOIN schemas AS payment_methods_schema ON (payment_methods_schema.id = associations.child_schema_id AND payment_methods_schema.entity_name = 'PaymentMethod')
            WHERE associations.parent_record_id = records.id);`,
        );

        for(const item of data) {

            console.log('item', item);

            const newEmail = new SendgridEmailEntity();
            newEmail.to = [
                { email: item.email_address },
            ];
            newEmail.from = 'hello@youfibre.com';
            newEmail.templateId = 'd-a50ef97c4b0d49b4a8eb7139605dbc09';
            newEmail.dynamicTemplateData = {
                recordId: item.record_id,
                contact: {
                    id: item.record_id,
                    properties: {
                        FirstName: item.firstName,
                    },
                },
            };

            console.log(newEmail);

            const res = await HelpersNotificationsApi.sendDynamicEmail(
                newEmail,
                { authorization: 'Bearer ' + apiToken },
            );

            console.log('res', res);
        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
