import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as csv from 'csvtojson';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import * as request from 'request';
import { BaseHttpClient } from '../../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const { PROJECT_MODULE } = SchemaModuleTypeEnums;

async function sync() {

    const csvFilePath = `https://odin-imports.s3.us-east-2.amazonaws.com/Netomnia/Netomnia+-+Imports+(Templates%2C+Products)+-+Milestone+Template.csv`;

    try {
        const httpClient = new BaseHttpClient();

        csv()
            // @ts-ignore
            .fromStream(request.get(csvFilePath))
            .subscribe((json) => {
                console.log({ json });
                return new Promise(async (resolve, reject) => {
                    console.log('json', json);

                    const newMilestoneRecord = new DbRecordCreateUpdateDto();
                    newMilestoneRecord.entity = `${PROJECT_MODULE}:MilestoneTemplate`;
                    newMilestoneRecord.title = json['Name'];
                    newMilestoneRecord.properties = {
                        Type: json['Type'] && json['Type'] !== '' ? json['Type'] : 'DEFAULT',
                        Description: json['Description'],
                    };

                    console.log('newMilestoneRecord', newMilestoneRecord);

                    const newMilestoneRecordRes = await httpClient.postRequest(
                        baseUrl,
                        `${PROJECT_MODULE}/v1.0/db/batch?upsert=true`,
                        apiToken,
                        [ newMilestoneRecord ],
                    );

                    console.log('newMilestoneRecordRes', newMilestoneRecordRes);

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
