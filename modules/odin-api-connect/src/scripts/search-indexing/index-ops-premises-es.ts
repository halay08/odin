import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';

dotenv.config({ path: '../../../.env' });

async function sync() {

    try {
        const premiseIndex = 'bd52a770-0aa4-4379-9751-119123cfe305';  // prod

        const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
        const es = new ElasticSearchClient(client);

        await es.create({
            'settings': {
                'index': {
                    'number_of_shards': 3,
                    'number_of_replicas': 2,
                    'sort.PostalCode': 'keyword',
                    'sort.order': 'asc',
                },
            },
            'mappings': {
                'properties': {
                    'UDPRN': { 'type': 'text' },
                    'UMPRN': { 'type': 'text' },
                    'FullAddress': { 'type': 'text' },
                    'AddressLine1': { 'type': 'text' },
                    'AddressLine2': { 'type': 'text' },
                    'AddressLine3': { 'type': 'text' },
                    'Premise': { 'type': 'text' },
                    'PostTown': { 'type': 'text' },
                    'PostalCode': { 'type': 'text' },
                    'PostalCodeNoSpace': { 'type': 'text' },
                    'BuildingNumber': { 'type': 'integer' },
                    'DeliveryPointSuffixNumber': { 'type': 'integer' },
                    'DeliveryPointSuffixLetter': { 'type': 'text' },
                    'LeadId': { 'type': 'text' },
                    'OPSS': { 'type': 'text' },

                },
            },
        }, premiseIndex).then(res => console.log(res)).catch(e => console.error(e));

        const youfibreDb = await createConnection({
            type: 'postgres',
            name: 'yofibreConnection',
            host: process.env.DB_HOSTNAME,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            entities: [],
        });

        let hasMore = true;
        let offset = 0;
        let limit = 1000;
        while (hasMore) {
            // fetch results
            const results = await youfibreDb.query(`SELECT * FROM ops.premises LIMIT ${limit} OFFSET ${offset}`);
            const dataSet = [];
            console.log('dataSet top', dataSet.length);
            console.log('results', results.length);

            for(let i = 0; i < results.length; i++) {
                const data = results[i];
                let code = '';
                if(data.sales_status_id === 1) {
                    // Order
                    code = 'cce55e4309a753985bdd21919395fdc17daa11e4';
                }
                if(data.sales_status_id === 2) {
                    // Pre Order
                    code = '41a2914f9dede0656a51bc3acb17ee6fb9357850';
                }
                if(data.sales_status_id === 3) {
                    // Register Interest
                    code = 'a6446091a31115410f8a6cc171c3ec46516ab2e5';
                }
                const esBody = {
                    'script': {
                        'lang': 'painless',
                        'source': `ctx._source.OPSS = '${code}';`,
                    },
                };

                dataSet.push({ 'update': { _id: `${data.udprn}-${data.umprn}`, '_index': premiseIndex } });
                dataSet.push(esBody);
            }

            console.log('dataSet', dataSet);
            console.log('dataSet before', dataSet.length);
            // bulk insert into elastic search
            await es.bulk(dataSet);
            // clear data set
            console.log('dataSet after', dataSet.length);
            console.log('offset', offset);
            console.log('limit', limit);
            // end if limit is reached
            if(results.length === 0) {
                console.log('results are 0', results.length);
                hasMore = false;
                break;
            }
            // set next batch params
            offset = offset + limit;
        }
    } catch (e) {
        console.error(e);

    }

}

sync();
