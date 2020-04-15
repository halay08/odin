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
                `BillingModule/v1.0/db/Invoice/${record.id}?entities=["Contact", "Transaction", "Address", "Order", "InvoiceItem"]`,
                apiToken,
            );
            console.log('invoiceRes', invoiceRes);
            const invoice = invoiceRes['data'];
            const invoiceItems = invoice['InvoiceItem'].dbRecords;
            const invoiceOrder = invoice['Order'].dbRecords;

            const orderRes = await httpClient.getRequest(
                baseUrl,
                `OrderModule/v1.0/db/Order/${invoiceOrder[0].id}?entities=["Account"]`,
                apiToken,
            );
            const order = orderRes['data'];
            const orderAccount = order['Account'].dbRecords;

            if(invoiceItems) {
                for(const item of invoiceItems) {

                    let billingPeriodType = getProperty(item, 'BillingPeriodType');
                    const productRef = getProperty(item, 'ProductRef');

                    // Update the item title with the product display name
                    console.log('productRef', productRef);
                    // Get the order item w/ product
                    const productRes = await httpClient.getRequest(
                        baseUrl,
                        `ProductModule/v1.0/db/Product/${productRef}`,
                        apiToken,
                    );
                    const product = productRes['data'];
                    const displayName = getProperty(product, 'DisplayName');

                    console.log('displayName', displayName);

                    // Update the billing period type
                    if(billingPeriodType) {
                        const discountValue = getProperty(item, 'DiscountValue');
                        console.log('DiscountValue', discountValue);

                        if(Number(discountValue) > 0 && Number(discountValue) < 100) {
                            console.log('DISCOUNT');
                            billingPeriodType = 'DISCOUNT';
                        }
                        if(Number(discountValue) < 1) {
                            console.log('STANDARD');
                            billingPeriodType = 'STANDARD';
                        }
                        if(Number(discountValue) === 100) {
                            console.log('FREE');
                            billingPeriodType = 'FREE';
                        }
                    }

                    // Update the invoice item
                    const updateDto = new DbRecordCreateUpdateDto();
                    updateDto.entity = `BillingModule:InvoiceItem`;
                    updateDto.title = displayName || item.title;
                    updateDto.properties = {
                        BillingPeriodType: billingPeriodType,
                    };

                    console.log('updateDto', updateDto);

                    const updateRes = await httpClient.putRequest(
                        baseUrl,
                        `BillingModule/v1.0/db/InvoiceItem/${item.id}`,
                        apiToken,
                        updateDto,
                    );
                    const update = updateRes['data'];
                    console.log('update', update);
                }
            }
        }

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
