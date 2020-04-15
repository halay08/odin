import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const { MILESTONE } = SchemaModuleEntityTypeEnums;

const cosmosControl = [
  {
    poly_name: 'L1',
  },
  {
    poly_name: 'L2',
  },
  {
    poly_name: 'L3',
  },
  {
    poly_name: 'L4',
  },
]

const resultsCosmos = []
const resultsOdin = []

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {
  const httpClient = new BaseHttpClient();
  try {
    const cosmosDb = await createConnection({
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
      host: process.env.DB_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log(baseUrl);

    const projectRes: any = await httpClient.getRequest(
      baseUrl,
      `ProjectModule/v1.0/db-associations/Milestone/c00ecd4e-e2b1-4a57-aee2-dfcb2413f4d7/relations?entities[]=Milestone`,
      apiToken,
    );

    const milestones = projectRes.data['Milestone'].dbRecords;

    for(let control of cosmosControl) {
      const polygonsCount = await cosmosDb.query(
        `SELECT COUNT(poly_2.*) \
                FROM ftth.polygon as poly_1 \
                LEFT JOIN ftth.polygon as poly_2 \
                ON poly_2.name = '${control.poly_name}' WHERE ST_Intersects( \
                    poly_1.geometry, \
                    poly_2.geometry \
                ) \
                AND poly_1.id = 144`,
      )

      const odinCount = milestones.filter(e => e.properties['Type'] === control.poly_name).length;

      resultsOdin.push({
        poly_name: control.poly_name,
        poly_count: odinCount,
      })

      resultsCosmos.push({
        poly_name: control.poly_name,
        poly_count: polygonsCount[0].count,
      })
    }

    console.log('resultsOdin', resultsOdin)
    console.log('resultsCosmos', resultsCosmos)
  } catch (e) {

  }
}

sync();
