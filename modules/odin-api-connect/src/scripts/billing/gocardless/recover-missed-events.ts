import axios from 'axios';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const productionToken = process.env.ODIN_API_TOKEN;
const baseUrl = process.env.K8_BASE_URL;

// Run this every minute
async function sync() {
    try {
        const httpClient = new BaseHttpClient();

        const options = {
            headers: {
                'GoCardless-Version': '2015-07-06',
                Authorization: 'Bearer ' + process.env.GOCARDLESS_API_KEY,
            },
        }

        const res = await axios.get(
            'https://api.gocardless.com/events?limit=250&created_at[gte]=2021-01-10T00:00:00.000Z',
            options,
        );

        console.log(' res.data.events', res.data.events);
        for(const evt of res.data.events) {
            console.log('evt', evt);
        }

        const postRes = await httpClient.postRequest(
            baseUrl,
            `BillingModule/v1.0/gocardless/webhook`,
            productionToken,
            res.data,
        );

        console.log('postRes', postRes);

        return;
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

sync();
