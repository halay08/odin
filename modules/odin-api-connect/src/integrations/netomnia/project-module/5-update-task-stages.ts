import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

async function sync() {

  const httpClient = new BaseHttpClient();

  const polygonId = '7595';
  const taskId = null;
  const milestoneId = 'cc5b5dff-bce0-4da4-b32c-4bf3be88ff3c';

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
    let offset = 0;

    let milestoneOffset = 0;
    let limit = 50;

    while (hasMore) {

      if(milestoneId) {

        const milestoneDataRes = await httpClient.getRequest(
          baseUrl,
          `ProjectModule/v1.0/db/Milestone/${milestoneId}?entities=[Task]`,
          apiToken,
        );

        const milestoneData = milestoneDataRes['data'];
        const milestoneTasks = milestoneData['Task'].dbRecords;

        if(milestoneTasks) {
          // console.log(tasks);

          for(let task of milestoneTasks) {
            if(
              task.properties['Type'] !== 'ADMIN' &&
              (
                task.properties['Category'] !== 'AS_BUILT' &&
                task.properties['Category'] !== 'DEFAULT' &&
                task.properties['Type'] !== 'SPLICE' &&
                milestoneData.stage.key !== 'MilestoneStageDone'
              )
            ) {
              const taskDataRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Task/${task.id}?entities=[Feature]`,
                apiToken,
              );

              const taskData = taskDataRes['data'];
              const taskFeatures = taskData['Feature'].dbRecords;

              if(taskFeatures) {

                for(let feature of taskFeatures) {

                  console.log('feature.props', feature.properties);

                  const featureType = sortFeatures(feature.properties['Feature']);

                  console.log(featureType, featureType);

                  const buildStatus = await getBuildStatus(
                    featureType,
                    feature.properties['ExternalRef'],
                    cosmosProdDb,
                  )

                  if(buildStatus.length) {
                    const status = buildStatus[0].build_status_id;

                    let stageKey;

                    if(status == 1) {
                      stageKey = `TaskStageTodo`;
                    } else if(
                      status == 2 ||
                      status == 3
                    ) {
                      stageKey = `TaskStageInProgress`;
                    } else if(status == 4) {
                      stageKey = `TaskStageDone`;
                    } else {
                      stageKey = `TaskStageTodo`;
                    }

                    const stage = await httpClient.getRequest(
                      baseUrl,
                      `ProjectModule/v1.0/stages/byKey/${stageKey}`,
                      apiToken,
                    )
                    const updateStageRes = await httpClient.putRequest(
                      baseUrl,
                      `ProjectModule/v1.0/db/ProjectModule:Task/${task.id}`,
                      apiToken,
                      {
                        'entity': 'ProjectModule:Task',
                        'stageId': stage['data'].id,
                      },
                    );
                    console.log('updateStageRes', updateStageRes);
                  }
                }
              }
            }
          }
        }

      } else if(taskId) {
        const getFeatures = await httpClient.getRequest(
          baseUrl,
          `ProjectModule/v1.0/db-associations/Feature/${taskId}/relations?entities[]=Feature`,
          apiToken,
        );
        // console.log('getFeatures', getFeatures);

        if(
          getFeatures &&
          getFeatures['data'] &&
          getFeatures['data']['Feature'] &&
          getFeatures['data']['Feature'].dbRecords
        ) {
          const features = getFeatures['data']['Feature'].dbRecords

          for(let feature of features) {

            const featureType = sortFeatures(feature.properties['Feature']);

            if(featureType) {
              const buildStatus = await getBuildStatus(
                featureType,
                feature.properties['ExternalRef'],
                cosmosProdDb,
              )

              if(buildStatus.length) {
                const status = buildStatus[0].build_status_id;

                let stageKey;

                if(status == 1) {
                  stageKey = `TaskStageTodo`;
                } else if(
                  status == 2 ||
                  status == 3
                ) {
                  stageKey = `TaskStageInProgress`;
                } else if(status == 4) {
                  stageKey = `TaskStageDone`;
                } else {
                  stageKey = `TaskStageTodo`;
                }

                const stage = await httpClient.getRequest(
                  baseUrl,
                  `ProjectModule/v1.0/stages/byKey/${stageKey}`,
                  apiToken,
                )
                const updateStageRes = await httpClient.putRequest(
                  baseUrl,
                  `ProjectModule/v1.0/db/ProjectModule:Task/${taskId}`,
                  apiToken,
                  {
                    'entity': 'ProjectModule:Task',
                    'stageId': stage['data'].id,
                  },
                )
              }
            }
          }
        }
      }
    }

    process.exit(1);
  } catch (err) {
    console.error(err);
  }
}

sync();

const sortFeatures = (name) => {
  const nameLower = name.toLowerCase()
  if(nameLower.includes('closure')) {
    return 'closure';
  } else if(nameLower.includes('cable')) {
    return 'cable';
  } else if(nameLower.includes('duct')) {
    return 'duct';
  } else if(nameLower.includes('chamber')) {
    return 'chamber';
  } else if(nameLower.includes('rope')) {
    return 'rope';
  }
}

const getBuildStatus = async (type, id, conn) => {
  const buildStatus = await conn.query(`
        SELECT ftth.${type}.build_status_id
        FROM ftth.${type}
        WHERE ftth.${type}.id = ${id}
    `);

  return buildStatus;
}
