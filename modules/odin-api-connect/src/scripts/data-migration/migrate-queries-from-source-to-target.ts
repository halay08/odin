import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const odinSourceUrl = process.env.K8_BASE_URL;
const odinSourceToken = process.env.ODIN_API_TOKEN;

const odinTargetUrl = process.env.K8_BASE_URL;
const odinTarketToken = process.env.ODIN_API_TOKEN;

console.log('odinTargetUrl', odinTargetUrl);

async function sync() {

    const httpClient = new BaseHttpClient();

    const pg = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOSTNAME,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const queries = await pg.query(`SELECT * from queries`);

    for (const query of queries)
    {

        console.log('query', query);

        const newQuery = {
            name: query.name,
            description: query.description,
            type: query.type,
            params: query.params,
            query: query.query,
        };

        const targetCreateRes = await httpClient.postRequest(
            odinTargetUrl,
            `connect/v1.0/queries`,
            odinTarketToken,
            newQuery,
        );

        console.log('targetCreateRes', targetCreateRes);
    }


}

sync();
