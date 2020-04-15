import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Address } from 'uk-clear-addressing';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';

dotenv.config({ path: '../../../.env' });

async function sync() {

    try {
        console.log(process.argv);

        let argSchemaId = process.argv.find(arg => arg.indexOf('schemaId') > -1);
        let schemaId = argSchemaId ? argSchemaId.split('=')[1] : null;

        let argOffset = process.argv.find(arg => arg.indexOf('offset') > -1);
        let startOffset = argOffset ? argOffset.split('=')[1] : null;

        let argLimit = process.argv.find(arg => arg.indexOf('limit') > -1);
        let offsetLimit = argLimit ? argLimit.split('=')[1] : null;

        let argPostcode = process.argv.find(arg => arg.indexOf('postcode') > -1);
        let postcode = argPostcode ? argPostcode.split('=')[1] : null;


        if(!schemaId) {
            throw Error('i.e schemaId required');
        }

        const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
        console.log('client', client);
        const es = new ElasticSearchClient(client);

        await es.create({
            'settings': {
                'index': {
                    'number_of_shards': 2,
                    'number_of_replicas': 2,
                    'sort.PostalCode': 'keyword',
                    'sort.order': 'asc',
                },
            },
            'mappings': {
                'properties': {
                    // Odin record properties
                    'title': { 'type': 'text' },
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
                        'VisitOutcome': { 'type': 'text' },
                        'VisitFollowUpDate': { 'type': 'text' },
                        'LastVisitBy': { 'type': 'text' },
                    },
                },
            },
        }, schemaId).then(res => console.log(res)).catch(e => console.error(e));

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

        let hasMore = true;
        let offset = startOffset ? Number(startOffset) : 0;
        let limit = offsetLimit ? Number(offsetLimit) : 5000;

        while (hasMore) {
            //
            // const seqRes = await pg.query('SELECT nextval(\'royal_mail.premise_indexing_offset_sequence\');');
            //
            // const nextVal = seqRes[0].nextval;
            //
            // console.log('nextVal', nextVal);

            // fetch results

            let results = [];

            if(postcode) {

                results = await pg.query(`SELECT * FROM royal_mail.paf
            WHERE royal_mail.paf.postcode ILIKE '%${postcode}%' LIMIT ${limit} OFFSET ${offset}`);

            } else {

                results = await pg.query(`SELECT * FROM royal_mail.paf
            WHERE id > ${offset}
            ORDER BY id ASC
            LIMIT ${limit}`);

            }

            console.log('results', results.length);
            // end if limit is reached
            if(results.length < 1) {
                hasMore = false;
                break;
            }

            const dataSet = [];
            const indexedUdprns = [];
            for(let i = 0; i < results.length; i++) {
                const data = results[i];

                console.log('processed: ', data.id);

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

                if(!pafRecord.delivery_point_suffix && !pafRecord.building_number) {
                    const numberNoStrings = (pafRecord.fullAddress).replace(/(^.+)(\w\d+\w)(.+$)/i, '$2');
                    // for multiple residences use delivery point suffix
                    // for single residences use building number
                    if(pafRecord.number_of_households > 1) {
                        deliveryPointSuffixNumber = Number(numberNoStrings);
                    } else {
                        buildingNumber = Number(numberNoStrings);
                    }
                }

                const body = {
                    title: fullAddress,
                    properties: {
                        id: `${data.udprn}-0`,
                        UDPRN: data.udprn,
                        UMPRN: 0,
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
                console.log('body', body);
                dataSet.push({ 'index': { '_id': body.properties.id, '_index': schemaId } });
                dataSet.push(body);
                // indexedUdprns.push({
                //     id: `${data.udprn}-0`,
                //     udprn: data.udprn,
                //     umprn: data.umprn,
                //     full_address: fullAddress,
                // })
            }

            // console.log('indexedUdprns.length', indexedUdprns.length);
            // if(indexedUdprns.length > 0) {
            //     const res = await pg.manager.createQueryBuilder()
            //         .insert()
            //         .into('royal_mail.premises_indexed_es', [
            //             'udprn',
            //             'umprn',
            //             'full_address',
            //         ])
            //         .values(indexedUdprns)
            //         .execute();
            //     console.log('res', res);
            // }

            // bulk insert into elastic search
            await es.bulk(dataSet);
            console.log('offset', offset);
            // set next batch params
            offset = offset + limit;
        }
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }

}

sync();
