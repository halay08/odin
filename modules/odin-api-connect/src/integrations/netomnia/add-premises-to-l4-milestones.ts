import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';
import { formatRawPaf } from '../../helpers/format-raw-paf-premise';

dotenv.config({ path: '../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { MILESTONE } = SchemaModuleEntityTypeEnums;

async function sync() {

  const httpClient = new BaseHttpClient();

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

    const netomniaProdDb = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
      entities: [],
    });


    const schemaRes = await httpClient.getRequest(
      baseUrl,
      `SchemaModule/v1.0/schemas/bymodule?moduleName=ProjectModule&entityName=Milestone`,
      apiToken,
    );
    const milestoneSchema = schemaRes['data'];

    let hasMore = true;
    let offset = 0;
    let limit = 50;
    while (hasMore) {

      console.log('milestoneSchema', milestoneSchema.id);

      const milestoneSearchRes = await httpClient.getRequest(
        baseUrl,
        `ProjectModule/v1.0/db/Milestone/search? \
                schemas=${milestoneSchema.id} \
                &boolean={ \
                    "must": [ \
                       { \
                       "query_string": { \
                            "fields": ["properties.Type"], \
                            "query": "L4", \
                            "lenient": true, \
                            "default_operator": "AND" \
                            } \
                       } \
                    ], \
                    "filter":[] \
                } \
                &sort=[] \
                &page=${offset} \
                &size=${limit}`,
        apiToken,
      );

      const milestones = milestoneSearchRes['data'];

      for(const milestone of milestones) {

        const polygonId = getProperty(milestone, 'PolygonId');

        console.log('polygonId', polygonId);
        // fetch l4 milestones
        // check the stage of the milestone
        // fetch premise intersects
        const intersects = await cosmosProdDb.query(`SELECT os.core.udprn, ftth.polygon.id, ftth.polygon.l4_closure_id FROM
                ftth.polygon, os.core WHERE ST_Intersects(ftth.polygon.geometry, os.core.geom) AND
                ftth.polygon.id = ${polygonId};`);

        console.log('intersects', intersects);
        const udprns = intersects.filter(elem => elem.udprn).map(elem => elem.udprn);
        console.log('udprns', udprns);
        if(udprns && udprns.length > 0) {
          const pafPremises = await netomniaProdDb.query(`SELECT * FROM royal_mail.paf WHERE royal_mail.paf.udprn IN (${udprns}) `);
          // format the raw paf premise
          console.log('pafPremises', pafPremises);
          const addresses = [];
          for(const premise of pafPremises) {
            const fmt = formatRawPaf(premise);
            addresses.push(fmt.title);
          }
          console.log('addresses', addresses);
          // update the milestone

          // Create Milestone
          const update = new DbRecordCreateUpdateDto();
          update.entity = `${PROJECT_MODULE}:${MILESTONE}`;
          update.properties = {
            Premises: addresses,
          };

          console.log('update', update);

          const updateRes = await httpClient.putRequest(
            baseUrl,
            `ProjectModule/v1.0/db/Milestone/${milestone.id}`,
            apiToken,
            update,
          );

          console.log('updateRes', updateRes);
        }
      }

      if(milestones.length < 1) {
        hasMore = false;
        break;
      }


      offset++;
    }

  } catch (e) {
    console.error(e);

  }

}

sync();
