import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { constantCase } from 'change-case';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

const { CONTACT } = SchemaModuleEntityTypeEnums;

// Run this script every 1 minutes
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

        const events = await pg.query(
            `SELECT action, details_cause, links_mandate, created_at FROM gocardless.events WHERE resource_type = 'mandates' AND created_at > now() - interval '2 minutes' ORDER BY created_at ASC`);

        console.log('records', events.length);
        for(const event of events) {
            const dbRecord = await pg.query(`SELECT c.record_id FROM db_records_columns as c WHERE c.value = '${event.links_mandate}' AND c.deleted_at IS NULL `);

            if(dbRecord[0]) {

                const paymentMethodRes = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                    `v1.0/db/PaymentMethod/${dbRecord[0].record_id}?entities=["${CONTACT}"]`,
                    apiToken,
                    true,
                );

                console.log('paymentMethodRes', paymentMethodRes);

                const paymentMethod = paymentMethodRes['data'];

                if(paymentMethod) {
                    const update = new DbRecordCreateUpdateDto();
                    update.entity = `${SchemaModuleTypeEnums.BILLING_MODULE}:${SchemaModuleEntityTypeEnums.PAYMENT_METHOD}`;
                    update.properties = {
                        Status: constantCase(event.action),
                        StatusUpdatedAt: event.created_at,
                    };
                    console.log(update);
                    const updateRes = await httpClient.putRequest(
                        Utilities.getBaseUrl(SERVICE_NAME.BILLING_MODULE),
                        `v1.0/db/PaymentMethod/${paymentMethod.id}`,
                        apiToken,
                        update,
                        true,
                    );
                    console.log('updateRes', updateRes);
                }
            }
        }
        return;
    } catch (e) {
        console.error(e);
    }
}

sync();
