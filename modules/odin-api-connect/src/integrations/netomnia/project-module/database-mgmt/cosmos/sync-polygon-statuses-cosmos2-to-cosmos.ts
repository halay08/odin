import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';

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

    const cosmos2Data = await cosmos2ProdDb.query(`select ftth.polygon.id, ftth.build_status.name, ftth.polygon.build_status_id
        from ftth.polygon
        left join ftth.build_status ON (ftth.polygon.build_status_id = ftth.build_status.id)
        left join ftth.closure ON (ftth.polygon.l4_closure_id = ftth.closure.id)
        where ftth.polygon.build_status_id != ftth.closure.build_status_id
        and ftth.polygon.name = 'L4'
        and ftth.build_status.name IN ('7-Build Done', '8-Done')`);

    console.log('cosmos2Data', cosmos2Data.length);

    for(const data of cosmos2Data) {

      console.log('data', data);

      const cosmosData = await cosmosProdDb.query(`update ftth.polygon set build_status_id = ${data.build_status_id} where id = ${data.id}`);
      // console.log('status is different', cosmosData.build_status_id !== data.build_status_id);
    }


  } catch (e) {
    console.error(e);

  }

}

sync();
