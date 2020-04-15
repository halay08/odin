import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

const fs = require('fs');

dotenv.config({ path: '../../../.env' });

async function sync() {

  try {
    const cosmosProdDb = await createConnection({
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

    const cosmos2ProdDb = await createConnection({
      type: 'postgres',
      name: 'netomniaConnection2',
      host: 'cosmos2.chbucothrs1f.eu-west-2.rds.amazonaws.com',
      port: Number(process.env.DB_PORT),
      username: process.env.DB_GIS_USERNAME,
      password: process.env.DB_GIS_PASSWORD,
      database: process.env.DB_GIS_NAME,
      synchronize: false,
      entities: [],
    });

    const cosmos2Data = await cosmos2ProdDb.query(`SELECT ftth.polygon.id, ftth.polygon.build_status_id FROM ftth.polygon LEFT JOIN ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id) WHERE ftth.polygon.name = 'L4' AND ftth.build_status.name IN ('7-Build Done', '8-Done')
`);

    console.log('cosmos2Data', cosmos2Data.length);

    const polygonIdsDiff = [];
    for(const data of cosmos2Data) {

      console.log('data', data);

      const cosmosData = await cosmosProdDb.query(`select id, build_status_id from ftth.polygon where build_status_id != ${data.build_status_id} and id = ${data.id}`);
      console.log(cosmosData);
      if(cosmosData[0]) {
        polygonIdsDiff.push({
          poly_id: cosmosData[0].id,
          statusCosmos: cosmosData[0].build_status_id,
          statusCosmos2: data.build_status_id,
        })
      }

    }

    console.log('polygonIdsDiff', polygonIdsDiff);

    let csv = '';
    const fields = Object.keys(polygonIdsDiff[0]).map(elem => (elem));

    try {
      // csv = parse({ data: report, fields });
      const parser = new Parser({ fields });
      csv = parser.parse(polygonIdsDiff);
    } catch (err) {
      console.error(err);
    }

    fs.writeFileSync(`polygon-diff-report-${moment().format('DD-MM-YYYY')}.csv`, csv);

  } catch (e) {
    console.error(e);

  }

}

sync();
