import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getPropertyFromRelation } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import * as dotenv from 'dotenv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const { FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { WORK_ORDER, ADDRESS, CONTACT } = SchemaModuleEntityTypeEnums;

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
    `SchemaModule/v1.0/schemas/bymodule?moduleName=${FIELD_SERVICE_MODULE}&entityName=${WORK_ORDER}`,
    youfibreOdinApp.apiKey,
  );
  const workOrderSchema = schemaRes['data'];

  console.log('workOrderSchema', workOrderSchema);

  // query date
  const endDate = moment().utc().add(14, 'days').startOf('day').format('YYYY-MM-DD');
  const startDate = moment().utc().startOf('day').format('YYYY-MM-DD');

  // Get work orders with a service appointment date in 2 weeks or less from You Fibre
  let hasMore = true;
  let offset = 0;
  let limit = 50;
  while (hasMore) {

    const workOrderSearchRes = await httpClient.getRequest(
      youfibreOdinApp.baseUrl,
      `${FIELD_SERVICE_MODULE}/v1.0/db/${WORK_ORDER}/search/? \
                schemas=${workOrderSchema.id} \
                &boolean={ \
                    "must": [], \
                    "filter":[ { \
                        "range": { \
                            "ServiceAppointment.dbRecords.properties.Date": { \
                                    "lte": "${endDate}", \
                                    "gte": "${startDate}", \
                                    "boost": "2.0"
                                } \
                            } \
                          }  \
                        ] \
                      } \
                &sort=[] \
                &page=${offset} \
                &size=${limit}`,
      youfibreOdinApp.apiKey,
    );

    console.log('workOrderSearchRes', workOrderSearchRes);
    const workOrders = workOrderSearchRes['data'];

    for(const workOrder of workOrders) {

      const orderAddressUdprn = getPropertyFromRelation(workOrder, ADDRESS, 'UDPRN');
      const orderAddressFullAddress = getPropertyFromRelation(workOrder, ADDRESS, 'FullAddress');

      // find premise intersection with polygon
      const intersect = await cosmosProdDb.query(`SELECT os.core.udprn, ftth.polygon.id, ftth.polygon.l4_closure_id FROM
                ftth.polygon, os.core WHERE ST_Intersects(ftth.polygon.geometry, os.core.geom) AND
                os.core.udprn = ${Number(orderAddressUdprn)} AND ftth.polygon.name = 'L4';`);

      console.log('workOrder', workOrder);
      const newWorkOrder = new DbRecordCreateUpdateDto();
      newWorkOrder.entity = `${FIELD_SERVICE_MODULE}:${WORK_ORDER}`;
      newWorkOrder.title = workOrder.title;
      newWorkOrder.externalAppName = 'ODIN_YOUFIBRE';
      newWorkOrder.externalId = workOrder.id;
      newWorkOrder.properties = {
        ...workOrder.properties,
        Cost: 250,
        CustomerName: '',
        CustomerPhone: '',
        CustomerEmail: '',
        PolygonId: '',
        UDPRN: '',
      };

      const createWorkOrderRes = await httpClient.postRequest(
        baseUrl,
        `${FIELD_SERVICE_MODULE}/v1.0/db/batch?upsert=true`,
        apiToken,
        [ newWorkOrder ],
      );
      const createWorkOrder = createWorkOrderRes['data'];
      console.log('createWorkOrder', createWorkOrder);
    }

    if(workOrders.length < 1) {
      hasMore = false;
      break;
    }

    offset++;

  }
  // Create the work orders in Netomnia

}

sync();
