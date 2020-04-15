import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Address } from 'uk-clear-addressing';
import { ElasticSearchClient } from '../../common/ElasticsearchClient';

dotenv.config({ path: '../../../.env' });

async function sync() {

  try {
    // const esIndex = '8c9445a1-91fc-4b0c-bac9-4e5de57613ae'; // sandbox
    const esIndex = 'e8ca4a5b-6bb5-4827-a8c9-5d6cde2422f3';  // prod

    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
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
          'UDPRN': { 'type': 'text' },
          'UMPRN': { 'type': 'text' },
          'FullAddress': { 'type': 'text' },
          'AddressLine1': { 'type': 'text' },
          'AddressLine2': { 'type': 'text' },
          'AddressLine3': { 'type': 'text' },
          'Premise': { 'type': 'text' },
          'PostTown': { 'type': 'text' },
          'PostalCode': { 'type': 'keyword' },
          'PostalCodeNoSpace': { 'type': 'text' },
          'BuildingNumber': { 'type': 'integer' },
          'DeliveryPointSuffixNumber': { 'type': 'integer' },
          'DeliveryPointSuffixLetter': { 'type': 'text' },
          'SalesStatus': { 'type': 'text' },
          'BuildStatus': { 'type': 'text' },
        },
      },
    }, esIndex).then(res => console.log(res)).catch(e => console.error(e));


    const netomniaDb = await createConnection({
      type: 'postgres',
      name: 'netomniaConnection',
      host: process.env.DB_GIS_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_GIS_USERNAME,
      password: process.env.DB_GIS_PASSWORD,
      database: process.env.DB_GIS_NAME,
      synchronize: false,
      entities: [],
    });

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
      const results = await netomniaDb.query(`SELECT * FROM os.os_data AS t1 RIGHT JOIN paf.paf as t2 ON (t2.udprn = t1.udprn::text) WHERE t1.sales_status_id IS NOT NULL LIMIT ${limit} OFFSET ${offset}`);
      const opsDataSet = [];
      const dataSet = [];
      console.log('dataSet top', dataSet.length);
      console.log('opsDataSet top', opsDataSet.length);
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

        const opsPremise = {
          uprn: !!data.uprn ? Number(data.uprn) : null,
          umprn: null,
          udprn: !!data.udprn ? Number(data.udprn) : null,
          build_status_id: data.build_status_id,
          sales_status_id: data.sales_status_id,
          season_id: data.season_id,
          year: data.year,
          latitude: data.latitude,
          longitude: data.longitude,
          x_coordinate: data.x_coordinate,
          y_coordinate: data.y_coordinate,
          geom: data.geom,
        };
        opsDataSet.push(opsPremise);

        const body = {
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
          SalesStatus: data.sales_status_id,
          BuildStatus: data.build_status_id,
        };
        dataSet.push({ 'index': { '_index': esIndex } });
        dataSet.push(body);
      }

      await youfibreDb.manager.createQueryBuilder()
        .insert()
        .into('ops.premises', [
          'uprn',
          'umprn',
          'udprn',
          'build_status_id',
          'sales_status_id',
          'season_id',
          'year',
          'latitude',
          'longitude',
          'x_coordinate',
          'y_coordinate',
          'geom',
        ])
        .values(opsDataSet)
        .execute();

      console.log('opsDataSet before', opsDataSet.length);
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
