import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Utilities } from '@d19n/client/dist/helpers/Utilities';
import { LogsUserActivityEntity } from '@d19n/models/dist/logs/user-activity/logs.user.activity.entity';
import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {

    const httpClient = new BaseHttpClient();

    const esClient: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    const elasticSearchClient = new ElasticSearchClient(esClient);

    const pg = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOSTNAME,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    let hasMore = true;
    let offset = 0;
    let limit = 10000;
    while (hasMore) {


        const records = await pg.query(`SELECT * FROM logs.user_activity as t1 LIMIT ${limit} OFFSET ${offset}`);

        console.log('records[0]', records[0]);
        const recordsToIndex = [];
        for(const record of records) {

            const transformed = new LogsUserActivityEntity();
            transformed.recordId = record.record_id;
            transformed.userId = record.user_id;
            transformed.organizationId = record.organization_id;
            transformed.type = record.type;
            transformed.revision = record.revision;
            transformed.userName = record.user_name;
            transformed.ipAddress = record.ip_address;
            transformed.userAgent = record.user_agent;
            transformed.createdAt = record.created_at;
            transformed.updatedAt = record.updated_at;

            console.log('transformed', transformed);

            const idFields = [
                'stageId',
                'childRecordId', 'parentRecordId',
            ]
            const associations = []
            for(let i = 0; i < idFields.length; i++) {
                const field = idFields[i]
                if(transformed.revision[field]) {
                    let record
                    if(field === 'stageId') {

                        // fetch the stage
                        const stageRes = await httpClient.getRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                            `v1.0/stages/${transformed.revision[field]}`,
                            apiToken,
                        );

                        record = stageRes['data'];

                    } else {

                        // get the record by id
                        const recordRes = await httpClient.getRequest(
                            Utilities.getBaseUrl(SERVICE_NAME.SCHEMA_MODULE),
                            `v1.0/db/Any/${transformed.revision[field]}`,
                            apiToken,
                        );

                        record = recordRes['data'];
                    }

                    associations.push(record)
                }
            }

            const evenWithAssociations = {
                ...transformed,
                associations,
            }

            console.log('evenWithAssociations', evenWithAssociations);

            recordsToIndex.push({ 'index': { '_index': 'logs_user_activity', _id: record.id } });
            recordsToIndex.push(evenWithAssociations);
        }

        console.log('recordsToIndex', recordsToIndex.length);
        // bulk insert into elastic search
        await elasticSearchClient.bulk(recordsToIndex);
        if(records.length < 1) {
            hasMore = false;
            break;
        }
        // set next batch params
        offset = offset + limit;
        console.log('offset', offset);
    }
}

sync();
