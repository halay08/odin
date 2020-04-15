import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const { MILESTONE } = SchemaModuleEntityTypeEnums;

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

// const exchangeProjectId = '4d81d0f8-47a1-4bc4-99ab-0ce3b74b94af';

const milestoneProjectId = 'c00ecd4e-e2b1-4a57-aee2-dfcb2413f4d7';

const milestoneProjectIdCol = '564d06ca-7ac9-4b11-852d-ae290f5cac5a'

const baseProjectId = 144;
const targetPolyhonMilestones = 'L1'

async function sync() {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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

    const schemaRes = await httpClient.getRequest(
      baseUrl,
      `SchemaModule/v1.0/schemas/bymodule?moduleName=ProjectModule&entityName=Milestone`,
      apiToken,
    );
    const milestoneSchema = schemaRes['data'];

    let hasMore = true;
    // COMPLETED 700
    let offset = 0;
    let limit = 50;

    let milestoneOffset = 0;

    let completed = 0;
    const projectIdsNotMatching = [];

    while (hasMore) {
      const polygons = await cosmosDb.query(
        `SELECT poly_2.* FROM ftth.polygon as poly_1 \
                    LEFT JOIN ftth.polygon as poly_2 \
                    ON poly_2.name = '${targetPolyhonMilestones}'
                    WHERE ST_Intersects( \
                        poly_1.geometry, \
                        poly_2.geometry \
                    ) \
                    AND poly_1.id = ${baseProjectId} \
                    ORDER BY poly_2.id ASC \
                    OFFSET ${offset} LIMIT ${limit};`,
      )

      if(polygons.length === 0) {
        console.log('results are 0', polygons.length);
        hasMore = false;
        break;
      }

      for(let polygon of polygons) {
        const milestone = await httpClient.getRequest(
          baseUrl,
          `ProjectModule/v1.0/db/Milestone/search?
                    schemas=${milestoneSchema.id}
                    &boolean={
                        "must": [
                           {
                                "query_string": {
                                    "fields": ["properties.PolygonId"],
                                    "query": "${polygon.id}",
                                    "lenient": true,
                                    "default_operator": "AND"
                                }
                           },
                           {
                            "query_string": {
                                "fields": ["schemaId"],
                                "query": "${milestoneSchema.id}",
                                "lenient": true,
                                "default_operator": "AND"
                            }
                       }
                        ],
                        "filter":[]
                    }
                    &sort=[]
                    &page=${milestoneOffset}
                    &size=${limit}`,
          apiToken,
        );

        let stageKey;

        if(polygon.build_status_id == 1) {
          stageKey = `MilestoneStageTodo`;
        } else if(
          polygon.build_status_id == 2 ||
          polygon.build_status_id == 3
        ) {
          stageKey = `MilestoneStageInProgress`;
        } else if(polygon.build_status_id == 4) {
          stageKey = `MilestoneStageDone`;
        } else {
          stageKey = `MilestoneStageTodo`;
        }

        const stage = await httpClient.getRequest(
          baseUrl,
          `ProjectModule/v1.0/stages/byKey/${stageKey}`,
          apiToken,
        )

        console.log('milestone[data]', milestone['data']);

        const updateStageRes = await httpClient.putRequest(
          baseUrl,
          `ProjectModule/v1.0/db/ProjectModule:Milestone/${milestone['data'][0].id}`,
          apiToken,
          {
            'entity': 'ProjectModule:Milestone',
            'stageId': stage['data'].id,
          },
        )


        if(polygon.build_status_id == 4) {
          const tasks = milestone['data'][0]['Task'].dbRecords;

          const taskStage = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/stages/byKey/TaskStageDone`,
            apiToken,
          )

          console.log('taskStage', taskStage);

          if(tasks) {
            for(let task of tasks) {
              const updateTaskStageRes = await httpClient.putRequest(
                baseUrl,
                `ProjectModule/v1.0/db/ProjectModule:Task/${task.id}`,
                apiToken,
                {
                  'entity': 'ProjectModule:Task',
                  'stageId': taskStage['data'].id,
                },
              )

              console.log('updateTaskStageRes', updateTaskStageRes)
            }
          }
        }

        console.log('updateStageRes', updateStageRes);

        console.log('STAGE', stage);
      }

      // set next batch params
      offset = offset + limit;
      console.log('offset', offset);
    }
  } catch (e) {
    console.error(e);

  }
}

sync();
