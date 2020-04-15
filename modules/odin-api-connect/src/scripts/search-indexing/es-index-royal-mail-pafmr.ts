import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Address } from 'uk-clear-addressing';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';

dotenv.config({ path: '../../../.env' });

async function sync() {

    let argSchemaId = process.argv.find(arg => arg.indexOf('schemaId') > -1);
    let schemaId = argSchemaId ? argSchemaId.split('=')[1] : null;

    if(!schemaId) {
        throw Error('i.e schemaId required');
    }


    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    const es = new ElasticSearchClient(client);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const pg = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOSTNAME,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        entities: [],
    });

    const count = await pg.query('SELECT COUNT(*) from royal_mail.pafmr');
    console.log('count', count);
    let hasMore = true;
    let offset = 0;
    let limit = 2500;

    while (hasMore) {
        // fetch results
        const results = await pg.query(`SELECT * FROM royal_mail.pafmr AS pafmr ORDER BY pafmr.udprn ASC, pafmr.umprn ASC LIMIT ${limit} OFFSET ${offset}`);
        const dataSet = [];
        console.log('dataSet top', dataSet.length);
        console.log('results', results.length);
        for(let i = 0; i < results.length; i++) {
            const data = results[i];
            const pafRecord = {
                postcode: data.postcode,
                post_town: data.posttown,
                thoroughfare: data.thoroughfare_and_descriptor,
                building_name: data.building_name,
                organisation_name: data.organisation_name,
                ...data,
            };
            // console.log('data', data);
            let {
                line_1,
                line_2,
                line_3,
                premise,
                post_town,
                postcode,
            } = new Address(pafRecord);

            let fullAddress = '';
            let buildingNumber = 0;
            let deliveryPointSuffixNumber = 0;
            let deliveryPointSuffixLetter = 'A';

            if(!!line_1) {
                fullAddress = fullAddress.concat(line_1 + ', ');
            }
            if(!!line_2) {
                fullAddress = fullAddress.concat(line_2 + ', ');
            }

            if(!!line_3) {
                fullAddress = fullAddress.concat(line_3 + ', ');
            }
            if(!!post_town) {
                fullAddress = fullAddress.concat(post_town + ', ');
            }
            if(!!post_town) {
                fullAddress = fullAddress.concat(postcode);
            }

            // Extract building number and delivery point suffix for sorting
            if(!!pafRecord.building_number) {
                buildingNumber = Number(pafRecord.building_number);
            }

            if(!!pafRecord.delivery_point_suffix) {
                const numberNoStrings = (pafRecord.delivery_point_suffix).replace(/(^\d+)(.+$)/i, '$1');
                deliveryPointSuffixNumber = Number(numberNoStrings);
                deliveryPointSuffixLetter = (pafRecord.delivery_point_suffix).replace(numberNoStrings, '');
            }

            if(!pafRecord.delivery_point_suffix) {
                const numberNoStrings = (pafRecord.fullAddress).replace(/(^.+)(\w\d+\w)(.+$)/i, '$2');
                deliveryPointSuffixNumber = Number(numberNoStrings);
            }

            const body = {
                title: fullAddress,
                properties: {
                    id: `${data.udprn}-${data.umprn}`,
                    UDPRN: data.udprn,
                    UMPRN: data.umprn,
                    FullAddress: fullAddress,
                    AddressLine1: line_1,
                    AddressLine2: line_2,
                    AddressLine3: line_3,
                    Premise: premise,
                    PostTown: post_town,
                    PostalCode: postcode,
                    PostalCodeNoSpace: postcode.replace(' ', ''),
                    BuildingNumber: buildingNumber,
                    DeliveryPointSuffixNumber: deliveryPointSuffixNumber,
                    DeliveryPointSuffixLetter: deliveryPointSuffixLetter,
                },
            };
            dataSet.push({ 'index': { '_index': schemaId } });
            dataSet.push(body);
        }
        // bulk insert into elastic search
        await es.bulk(dataSet);
        // clear data set
        console.log('dataSet after', dataSet.length);
        console.log('offset', offset);
        console.log('limit', limit);
        if(offset === Number(count[0].count)) {
            hasMore = false;
            break;
        }
        // end if limit is reached
        if(results.length === 0) {
            hasMore = false;
            break;
        }
        // set next batch params
        offset = offset + limit;
    }

}

sync();
