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

    const csvFilePath =
        `https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/Netomnia+-+Imports+(Templates%2C+Products)+-+Task+Template.csv`;

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

                    const associations = [];

                    if(json['Milestone Name']) {
                        const milestoneNames = json['Milestone Name'].split(',')
                        const featureNames = json['Feature Names'].split(',')
                        const productNames = json['Products'].split(',')

                        const productSchemaRes = await httpClient.getRequest(
                            baseUrl,
                            `SchemaModule/v1.0/schemas/bymodule?moduleName=ProductModule&entityName=Product`,
                            apiToken,
                        );

                        const productSchema = productSchemaRes['data'];

                        for(let productName of productNames) {
                            if(productName && productName !== '') {
                                const product = await pg.query(
                                    `SELECT title, id FROM db_records WHERE db_records.title = '${productName.trim()}' AND db_records.schema_id = '${productSchema.id}'`,
                                );

                                if(product[0]) {
                                    associations.push({
                                        recordId: product[0].id,
                                    })
                                }
                            }
                        }

                        const milestoneSchemaRes = await httpClient.getRequest(
                            baseUrl,
                            `SchemaModule/v1.0/schemas/bymodule?moduleName=ProjectModule&entityName=MilestoneTemplate`,
                            apiToken,
                        );

                        const milestoneSchema = milestoneSchemaRes['data'];

                        for(let milestoneName of milestoneNames) {
                            if(milestoneName && milestoneName !== '') {
                                const milestione = await pg.query(
                                    `SELECT title, id FROM db_records WHERE db_records.title = '${milestoneName.trim()}' AND db_records.schema_id = '${milestoneSchema.id}'`,
                                );

                                if(milestione[0]) {
                                    associations.push({
                                        recordId: milestione[0].id,
                                    })
                                }
                            }
                        }

                        const featureTemplateRes = await httpClient.getRequest(
                            baseUrl,
                            `SchemaModule/v1.0/schemas/bymodule?moduleName=ProjectModule&entityName=FeatureTemplate`,
                            apiToken,
                        );

                        const featureTemplate = featureTemplateRes['data'];

                        console.log('featureTemplate', featureTemplate);

                        for(let featureName of featureNames) {
                            if(featureName && featureName !== '') {
                                const feature = await pg.query(
                                    `SELECT title, id FROM db_records WHERE db_records.title = '${featureName.trim()}' AND db_records.schema_id = '${featureTemplate.id}'`,
                                );

                                console.log('feature', feature);

                                if(feature[0]) {
                                    associations.push({
                                        recordId: feature[0].id,
                                    })
                                }
                            }
                        }

                        const newTaskTemplate = new DbRecordCreateUpdateDto();
                        newTaskTemplate.entity = `ProjectModule:TaskTemplate`;
                        newTaskTemplate.title = json['Name'];
                        newTaskTemplate.properties = {
                            Type: json['Type'],
                            Position: json['Order'],
                            Description: json['Description'],
                            Category: json['Category'] && json['Category'] !== '' ? json['Category'] : 'DEFAULT',
                        };

                        newTaskTemplate.associations = associations;

                        console.log('newTaskTemplate', newTaskTemplate);

                        const newTaskTemplateRes = await httpClient.postRequest(
                            baseUrl,
                            `ProjectModule/v1.0/db/batch?upsert=true`,
                            apiToken,
                            [ newTaskTemplate ],
                        );

                        console.log(newTaskTemplateRes);

                        return (resolve())
                    }
                });
            });

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
