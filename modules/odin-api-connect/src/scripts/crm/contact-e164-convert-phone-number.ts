/*
 *  This will search across db_records, find all phone numbers and:
 *
 *  1. Check against API whether it's a valid phone number
 *  2. Check if it's a MOBILE | FIXED_LINE number type
 *  3. Convert number to E.164 format
 *  4. Store number in either Phone or Mobile property depending on the type
 *
 *  More information here:
 *  https://www.bigdatacloud.com/phone-number-apis/phone-number-validation-api
 */

import * as dotenv from 'dotenv';
import 'reflect-metadata';
import {createConnection} from 'typeorm';
import {BaseHttpClient} from '../../common/Http/BaseHttpClient';
import {getProperty} from "@d19n/models/dist/schema-manager/helpers/dbRecordHelpers";
import axios from "axios";
import {DbRecordCreateUpdateDto} from "@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto";
import {Utilities} from "@d19n/client/dist/helpers/Utilities";
import {SERVICE_NAME} from "@d19n/client/dist/helpers/Services";

const fs = require('fs');
dotenv.config({path: '../../../.env'});
const apiToken = process.env.ODIN_API_TOKEN;
const bigDataCloudApi = process.env.BIGDATACLOUD_API;


async function sync() {

    try {
        const httpClient = new BaseHttpClient();
        let conversionErrors = []

        const pg = await createConnection({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const allContacts = await pg.query(
            `SELECT db_records.id FROM db_records LEFT JOIN db_records_columns ON (db_records.id = db_records_columns.record_id AND column_name = 'Phone') WHERE entity = 'CrmModule:Contact' AND db_records.deleted_at IS NULL;`
        );

        for (const record of allContacts) {

            const contactRes = await httpClient.getRequest(
                Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                `v1.0/db/Contact/${record.id}`,
                apiToken,
            );

            const contact = contactRes['data'];
            const phoneNumber = getProperty(contact, 'Phone')

            if (phoneNumber && phoneNumber.indexOf('+44') === -1) {

                const phoneRes = await axios.get(
                    `https://api.bigdatacloud.net/data/phone-number-validate?number=${phoneNumber}&countryCode=gb&localityLanguage=en&key=${bigDataCloudApi}`
                );

                if (phoneRes.data.isValid) {

                    const update = new DbRecordCreateUpdateDto();
                    update.entity = `CrmModule:Contact`;

                    //let properties;

                    if(phoneRes.data.e164Format && phoneRes.data.lineType !== 'MOBILE') {
                        update.properties = {
                            Phone: phoneRes.data.e164Format
                        }
                    } else if (phoneRes.data.e164Format && phoneRes.data.lineType === 'MOBILE')  {
                        update.properties = {
                            Mobile: phoneRes.data.e164Format
                        }
                    }

                    if (update.properties){


                        const updateRes = await httpClient.putRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                            `v1.0/db/Contact/${contact.id}`,
                            apiToken,
                            update,
                        );

                        if (updateRes['statusCode'] !== 200) {
                            console.log('Error updating the Contact entity in CRM, contactId: ', contact.id)
                            console.log('Response:', updateRes)
                        }else{
                            console.log(`Phone: ${phoneNumber} -> E.164 = ${phoneRes.data.e164Format}. Updated contactId: `, contact.id)
                        }

                    }


                } else {
                    console.log(`Phone: ${phoneNumber} -> E.164 = Can't convert, bad number format. \u2715 contactId:`, contact.id)
                    conversionErrors.push(phoneNumber)
                }

            } else {
                console.log(`Can't convert to E.164, number is empty or null. \u2715 contactId:`, contact.id)
            }
        }

        /* Print out errors if any */
        if (conversionErrors.length > 0) {
            console.log('Bad number formats found: ', conversionErrors.length)
            console.log('Bad numbers: ', conversionErrors)
        }
        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync().then();
