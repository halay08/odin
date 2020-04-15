import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
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
                `BillingModule/v1.0/db/Invoice/${record.id}?entities=["Transaction"]`,
                apiToken,
            );
            const invoice = invoiceRes['data'];
            const transactions = invoice['Transaction'].dbRecords;

            if(transactions) {

                for(const item of transactions) {

                    let status = getProperty(item, 'Status');
                    console.log('status', status);

                    let balance = getProperty(invoice, 'Balance');
                    // Update the billing period type
                    if(status) {

                        switch (status) {
                            case 'created':
                            case 'submitted':
                            case 'confirmed':
                            case 'paid_out':
                                balance = 0;
                                break;
                        }
                    }

                    if(balance !== getProperty(invoice, 'Balance') && getProperty(invoice, 'Status') === 'PAID') {
                        console.log('inv', invoice.recordNumber);
                        console.log('inv', getProperty(invoice, 'Balance'));
                        console.log('inv', getProperty(invoice, 'Status'));
                        // Update the invoice item
                        const updateDto = new DbRecordCreateUpdateDto();
                        updateDto.entity = `BillingModule:Invoice`;
                        updateDto.properties = {
                            Balance: balance,
                        };

                        console.log('updateDto', updateDto);

                        const updateRes = await httpClient.putRequest(
                            baseUrl,
                            `BillingModule/v1.0/db/Invoice/${invoice.id}`,
                            apiToken,
                            updateDto,
                        );
                        const update = updateRes['data'];
                        console.log('update', update);
                    }
                    if(getProperty(item, 'Status') === 'FAILED_PROCESSING') {

                        // Set invoice status to Error
                        const updateDto = new DbRecordCreateUpdateDto();
                        updateDto.entity = `BillingModule:Invoice`;
                        updateDto.properties = {
                            Status: 'ERROR',
                        };

                        console.log('updateDto', updateDto);

                        const updateRes = await httpClient.putRequest(
                            baseUrl,
                            `BillingModule/v1.0/db/Invoice/${invoice.id}`,
                            apiToken,
                            updateDto,
                        );
                        const update = updateRes['data'];
                        console.log('update', update);

                    }
                }
            } else if(getProperty(invoice, 'Status') === 'PAID' && Number(getProperty(invoice, 'TotalDue')) > 0) {

                console.log('inv', invoice.recordNumber);
                console.log('td', getProperty(invoice, 'TotalDue'));
                // Update the invoice item
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `BillingModule:Invoice`;
                updateDto.properties = {
                    Status: 'SCHEDULED',
                };

                console.log('updateDto', updateDto);

                const updateRes = await httpClient.putRequest(
                    baseUrl,
                    `BillingModule/v1.0/db/Invoice/${invoice.id}`,
                    apiToken,
                    updateDto,
                );
                const update = updateRes['data'];
                console.log('update', update);
            }
        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
