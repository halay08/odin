import { getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const { ORDER_MODULE } = SchemaModuleTypeEnums;
const { ORDER, ADDRESS } = SchemaModuleEntityTypeEnums;

async function sync() {

  const httpClient = new BaseHttpClient();

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

  // Get the organization apps for the integration
  const netomniaOdinRes = await httpClient.getRequest(
    baseUrl,
    `IdentityModule/v1.0/organizations/apps/getByName/ODIN_NETOMNIA`,
    apiToken,
  );
  const netomniaOdinApp = netomniaOdinRes['data'];

  const youFibreOdinRes = await httpClient.getRequest(
    baseUrl,
    `IdentityModule/v1.0/organizations/apps/getByName/ODIN_YOUFIBRE`,
    apiToken,
  );

  const youfibreOdinApp = youFibreOdinRes['data'];

  console.log('netomniaOdinRes', netomniaOdinRes);
  console.log('youFibreOdinRes', youFibreOdinRes);

  // Get the work order schema
  const schemaRes = await httpClient.getRequest(
    youfibreOdinApp.baseUrl,
    `SchemaModule/v1.0/schemas/bymodule?moduleName=${ORDER_MODULE}&entityName=${ORDER}`,
    youfibreOdinApp.apiKey,
  );
  const orderSchema = schemaRes['data'];

  console.log('orderSchema', orderSchema);

  const noMatches = [];
  // Get work orders with a service appointment date in 2 weeks or less from You Fibre
  let hasMore = true;
  let offset = 0;
  let limit = 50;
  while (hasMore) {

    const orderSearchRes = await httpClient.getRequest(
      youfibreOdinApp.baseUrl,
      `${ORDER_MODULE}/v1.0/db/${ORDER}/search/? \
                schemas=${orderSchema.id} \
                &boolean={ \
                    "must": [{"query_string": {"fields": ["stage.key"],"query": "OrderStageActive","lenient": true,"default_operator": "AND"}}], \
                    "filter":[] \
                } \
                &sort=[] \
                &page=${offset} \
                &size=${limit}`,
      youfibreOdinApp.apiKey,
    );

    console.log('orderSearchRes', orderSearchRes);
    const orders = orderSearchRes['data'];

    for(const order of orders) {

      const orderAddressUdprn = getPropertyFromRelation(order, ADDRESS, 'UDPRN');
      const orderAddressFullAddress = getPropertyFromRelation(order, ADDRESS, 'FullAddress');

      // find premise intersection with polygon
      const intersect = await cosmosProdDb.query(`SELECT os.core.udprn, ftth.polygon.id, ftth.polygon.l4_closure_id FROM
                ftth.polygon, os.core WHERE ST_Intersects(ftth.polygon.geometry, os.core.geom) AND
                os.core.udprn = ${Number(orderAddressUdprn)} AND ftth.polygon.name = 'L4';`);

      console.log('intersect', intersect);
      if(intersect && intersect.length === 1) {
        const polygon = intersect[0];
        const update = await cosmosProdDb.query(`UPDATE ftth.polygon SET has_live_customer = true WHERE ftth.polygon.id = ${polygon.id};`);
        console.log('update', update);

      } else {
        noMatches.push({
          udprn: orderAddressUdprn,
          address: orderAddressFullAddress,
        });
      }
      // Update polygon table with has active customer
    }


    if(orders.length < 1) {
      hasMore = false;
      break;
    }


    offset++;

  }

  console.log('noMatches', noMatches);
  // Create the work orders in Netomnia

}

sync();
