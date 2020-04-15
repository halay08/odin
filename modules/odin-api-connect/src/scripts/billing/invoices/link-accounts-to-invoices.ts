import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

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

        const allInvoices = await pg.query(
            `SELECT db_records.id
            FROM db_records
            RIGHT JOIN schemas as schema ON (db_records.schema_id = schema.id)
            WHERE schema.entity_name = 'Invoice' AND db_records.deleted_at IS NULL;`);


        for(const record of allInvoices) {
            const invoiceRes = await httpClient.getRequest(
                baseUrl,
                `BillingModule/v1.0/db/Invoice/${record.id}?entities=["Order"]`,
                apiToken,
            );
            const invoice = invoiceRes['data'];
            const invoiceOrder = invoice['Order'].dbRecords;

            const orderRes = await httpClient.getRequest(
                baseUrl,
                `OrderModule/v1.0/db/Order/${invoiceOrder[0].id}?entities=["Account"]`,
                apiToken,
            );
            const order = orderRes['data'];
            const orderAccount = order['Account'].dbRecords;

            const newFeatureAssociation = new DbRecordAssociationCreateUpdateDto();

            newFeatureAssociation.recordId = orderAccount[0].id;

            const newAssociation = await httpClient.postRequest(
                baseUrl,
                `BillingModule/v1.0/db-associations/Invoice/${invoice.id}`,
                apiToken,
                [ newFeatureAssociation ],
            );

            console.log('newAssociation', newAssociation);
        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
