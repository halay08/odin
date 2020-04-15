import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as csv from 'csvtojson';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import * as request from 'request';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {

    const csvFilePath = `https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/Netomnia+-+Imports+(Templates%2C+Products)+-+Feature+Template.csv`;

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

        csv()
            // @ts-ignore
            .fromStream(request.get(csvFilePath))
            .subscribe((json) => {
                return new Promise(async (resolve, reject) => {
                    console.log('json', json);

                    const productNames = json['Products'].split(',');

                    console.log('productNames', productNames);

                    const schemaRes = await httpClient.getRequest(
                        baseUrl,
                        `SchemaModule/v1.0/schemas/bymodule?moduleName=ProductModule&entityName=Product`,
                        apiToken,
                    );

                    const productSchema = schemaRes['data'];

                    const associations = [];
                    for(let productName of productNames) {
                        if(productName !== 'N/A (Material is included in Labour Map rate card)') {
                            const product = await pg.query(
                                `SELECT title, id FROM db_records WHERE db_records.title = '${productName.trim()}' AND db_records.schema_id = '${productSchema.id}'`,
                            );

                            console.log('product', product[0].id, product[0].title);

                            associations.push({
                                recordId: product[0].id,
                            })
                        }
                    }

                    const newFeatureRecord = new DbRecordCreateUpdateDto();
                    newFeatureRecord.entity = `ProjectModule:FeatureTemplate`;
                    newFeatureRecord.title = json['Name'];
                    newFeatureRecord.properties = {
                        Feature: json['Feature'],
                        Type: json['Type'] && json['Type'] !== '' ? json['Type'] : 'DEFAULT',
                        Description: json['Description'],
                    };

                    newFeatureRecord.associations = associations;

                    console.log('newFeatureRecord', newFeatureRecord);

                    const newFeatureRecordRes = await httpClient.postRequest(
                        baseUrl,
                        `ProjectModule/v1.0/db/batch?upsert=true`,
                        apiToken,
                        [ newFeatureRecord ],
                    );

                    console.log('newFeatureRecordRes', newFeatureRecordRes);

                    return (resolve());
                });
            });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
