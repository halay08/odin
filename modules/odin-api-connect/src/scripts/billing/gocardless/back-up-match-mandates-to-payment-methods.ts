import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const productionToken = process.env.ODIN_API_TOKEN;
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

        const records = await pg.query(
            'SELECT t1.id as record_id FROM db_records as t1 LEFT JOIN schemas as t2 ON (t1.schema_id = t2.id) WHERE t2.entity_name = \'PaymentMethod\'');

        console.log('records', records.length);
        for(const record of records) {
            console.log('record', record.record_id);

            const paymentMethodRes = await httpClient.getRequest(
                baseUrl,
                `BillingModule/v1.0/db/PaymentMethod/${record.record_id}?format=transformLevel2`,
                productionToken,
            );
            const data = paymentMethodRes['data'];
            console.log('data', data);

            if(data) {
                const mandatesRes = await httpClient.getRequest(
                    baseUrl,
                    `BillingModule/v1.0/gocardless/mandates/${data.properties['ExternalRef']}`,
                    productionToken,
                );
                const mandate = mandatesRes['data'];
                const update = new DbRecordCreateUpdateDto();
                update.entity = `${SchemaModuleTypeEnums.BILLING_MODULE}:${SchemaModuleEntityTypeEnums.PAYMENT_METHOD}`;
                update.properties = {
                    Status: mandate.status,

                };

                console.log('update', update);
                // Only update if the status has changed
                if(data.properties['Status'] !== mandate.status) {
                    const updateRes = await httpClient.putRequest(
                        baseUrl,
                        `BillingModule/v1.0/db/PaymentMethod/${record.record_id}`,
                        productionToken,
                        update,
                    );
                    console.log('updateRes', updateRes);
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
