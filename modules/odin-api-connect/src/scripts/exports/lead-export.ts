import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

class DataRow {
    leadId: string;
    title: string;
    stageName: string;
    salesStatus: string;
    buildStatus: string;
    l2PolygonId: string;
    targetReleaseDate: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
    postCode: string;
    udprn: string;
    type: string;
    product: string;
    createdAt: string;
}

async function sync() {


    function standardizeDate(property: any) {
        if(!!property) {
            return moment(property, 'YYYY-MM-DD').format('DD/MM/YYYY');
        }
        return undefined;
    }

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
            `SELECT r.id
            FROM db_records AS r
            left join db_records_associations a ON (a.parent_record_id = r.id)
            left join db_records_columns c1 on (a.child_record_id = c1.record_id and c1.column_name = 'SalesStatus')
            WHERE r.entity = 'CrmModule:Lead'
            AND a.child_entity = 'CrmModule:Address'
            AND r.deleted_at IS NULL;`);

        const report = [];
        const missingAddress = [];

        console.log(records);

        let count = 0;
        for(const record of records) {

            console.log(count);

            try {
                console.log('record', record)
                const response = await httpClient.getRequest(
                    Utilities.getBaseUrl(SERVICE_NAME.CRM_MODULE),
                    `v1.0/db/Lead/${record.id}?entities=["Contact", "Address"]`,
                    apiToken,
                );

                const lead = response['data'];
                const contact = lead['Contact'].dbRecords;
                const address = lead['Address'].dbRecords;

                const dataRow = new DataRow();
                dataRow.leadId = lead.id;
                dataRow.title = lead.title;
                dataRow.salesStatus = address ? getProperty(address[0], 'SalesStatus') : undefined;
                dataRow.buildStatus = address ? getProperty(address[0], 'BuildStatus') : undefined;
                dataRow.targetReleaseDate = address ? getProperty(address[0], 'TargetReleaseDate') : undefined;
                dataRow.l2PolygonId = address ? getProperty(address[0], 'L2PolygonId') : undefined;
                dataRow.postCode = address ? getProperty(address[0], 'PostalCode') : undefined;
                dataRow.udprn = address ? getProperty(address[0], 'UDPRN') : undefined;
                dataRow.type = getProperty(lead, 'Type');
                dataRow.firstName = contact ? getProperty(contact[0], 'FirstName') : undefined;
                dataRow.lastName = contact ? getProperty(contact[0], 'LastName') : undefined;
                dataRow.emailAddress = contact ? getProperty(contact[0], 'EmailAddress') : undefined;
                dataRow.createdAt = standardizeDate(lead.createdAt);

                console.log(dataRow);
                report.push(dataRow);

                count++

            } catch (e) {
                console.error(e)
            }
        }

        let csv = '';
        const fields = Object.keys(report[0]).map(elem => (elem));

        try {
            // csv = parse({ data: report, fields });
            const parser = new Parser({ fields });
            csv = parser.parse(report);
        } catch (err) {
            console.error(err);
        }

        fs.writeFileSync(`lead-export-${moment().format('DD-MM-YYYY')}.csv`, csv);

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
