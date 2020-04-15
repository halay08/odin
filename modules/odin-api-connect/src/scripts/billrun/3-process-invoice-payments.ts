import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const productionToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

const { TRANSACTION } = SchemaModuleEntityTypeEnums;

// Run this at 1:00am daily
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

        const recurringInvoices = await pg.query(
            `select r.id, r.title, c.value, c2.value, c3.value
                    from db_records r
                    left join db_records_columns c on (r.id = c.record_id and c.column_name = 'Status')
                    left join db_records_columns c2 on (r.id = c2.record_id and c2.column_name = 'Balance')
                    left join db_records_columns c3 on (r.id = c3.record_id and c3.column_name = 'DueDate')
                    where entity = 'BillingModule:Invoice'
                    and c.value = 'SCHEDULED'
                    and TO_TIMESTAMP(c3.value, 'YYYY-MM-DD') < now() + INTERVAL '3 DAYS'`);

        console.log('invoices', [ ...recurringInvoices ]);

        for(const record of [ ...recurringInvoices ]) {
            const invoiceRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                `v1.0/db/Invoice/${record.id}?entities=["Transaction"]`,
                productionToken,
            );
            const invoice = invoiceRes['data'];

            const invoiceStatus = getProperty(invoice, 'Status');
            console.log('------', invoiceStatus);

            if(invoice && invoiceStatus !== 'VOID' && invoiceStatus !== 'ERROR') {
                // process recurring invoice with due date in 3 days

                console.log('------PROCESS_TRANSACTION', invoice.title);
                const transactionRes = await httpClient.postRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                    `v1.0/transactions/invoices/${invoice.id}`,
                    productionToken,
                    {},
                );
                const transaction = transactionRes['data'];
                console.log('transaction', transaction);
            }
        }
        return;
    } catch (e) {
        console.error(e);
    }
}

sync();
