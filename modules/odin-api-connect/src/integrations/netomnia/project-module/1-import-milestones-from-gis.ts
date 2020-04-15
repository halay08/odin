import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { getMilestoneTemplateByRecordId, getMilestoneTemplateId, getProjectById } from './helpers/OdinQueries';
import { getAllL4ClosuresInL0Polygon } from './helpers/PolygonQueries';

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

/**
 * This scrip will create all milestones from L4 -> L0 starting from an L4 closure id.
 * All polygons that intersect with that l4 closure will be created as milestones.
 * And the parent milestone will be related to the child milestone
 *
 * TODO: verify that the relationships between milestones is correct
 * L1 > shows only L2s and the L1 is a parent to the L2
 * L2 > shows only L3s and the L2 is a parent to the L3
 * ...
 *
 * @returns void
 */
export async function importMilestones(projectId: string, polygonId: string) {

  let milestonesProcessed = 0;
  const milestoneNotCreated = [];

  // Init http client
  const httpClient = new BaseHttpClient();

  // Try establishing connection with cosmos and youfibre databases
  try {

    // Cosmos DB connection
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

    // Youfibre DB connection
    const odinDbConnection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Find Project
    const project = await getProjectById(projectId);

    // Get the l4 closure ids inside of an L0
    const l4ClosureIds = await getAllL4ClosuresInL0Polygon(polygonId, cosmosDb);

    console.log('l4ClosureIds', l4ClosureIds.length);

    for(const l4ClosureId of l4ClosureIds) {

      console.log('l4ClosureId', l4ClosureId);

      const l4Polygons = await cosmosDb.query(
        `SELECT ftth.polygon.id \
                FROM ftth.polygon, ftth.closure as closure \
                WHERE ST_Intersects(ftth.polygon.geometry, closure.geometry) \
                AND ftth.polygon.name = 'L4' \
                AND closure.id = ${l4ClosureId.id};`,
      );

      const milestoneTemplateId = getMilestoneTemplateId('L4');

      const milestoneTemplate = await getMilestoneTemplateByRecordId(
        milestoneTemplateId,
        odinDbConnection,
        [],
      );

      console.log('l4Polygons', l4Polygons.length);

      if(l4Polygons[0]) {

        for(const startingPolygon of l4Polygons) {

          const newMilestone = new DbRecordCreateUpdateDto();
          newMilestone.entity = `ProjectModule:Milestone`;
          newMilestone.title = `${project.title} ${milestoneTemplate.title} ${startingPolygon.id}`;
          newMilestone.properties = Object.assign(
            {},
            milestoneTemplate.properties,
            { PolygonId: startingPolygon.id },
          );
          newMilestone.associations = [
            {
              recordId: projectId,
            },
          ];

          milestonesProcessed += 1;


          const newMilestoneRes = await httpClient.postRequest(
            baseUrl,
            `ProjectModule/v1.0/db/batch?upsert=true&queueAndRelate=true`,
            apiToken,
            [ newMilestone ],
          );

          let childMilestoneId = newMilestoneRes['data'][0].id

          let reversedPolyNames = [];

          for(let i = 4; i > 0; i--) {
            if(i !== 4 && i !== 0) {
              reversedPolyNames.push(`L${i}`);
            }
          }

          // L3, L2, L1, L0
          for(let polyName of reversedPolyNames) {

            const parentPolygons = await cosmosDb.query(`
                    SELECT ftth.polygon.id \
                    FROM ftth.polygon, ftth.closure as closure \
                    WHERE ST_Intersects(ftth.polygon.geometry, closure.geometry) \
                    AND ftth.polygon.name = '${polyName}' \
                    AND closure.id = ${l4ClosureId.id}
                    `);

            console.log('parentPolygons', parentPolygons.length);

            for(const polygon of parentPolygons) {

              const milestoneTemplateId = getMilestoneTemplateId(polyName);

              const milestoneTemplate = await getMilestoneTemplateByRecordId(
                milestoneTemplateId,
                odinDbConnection,
                [],
              );

              const newMilestone = new DbRecordCreateUpdateDto();
              newMilestone.entity = `ProjectModule:Milestone`;
              newMilestone.title = `${project.title} ${milestoneTemplate.title} ${polygon.id}`;
              newMilestone.properties = Object.assign(
                {},
                milestoneTemplate.properties,
                { PolygonId: polygon.id },
              );
              newMilestone.associations = [
                {
                  recordId: projectId,
                },
                {
                  recordId: childMilestoneId,
                },
              ];

              // Create new milestone
              const newMilestoneRes = await httpClient.postRequest(
                baseUrl,
                `ProjectModule/v1.0/db/batch?upsert=true&queueAndRelate=true`,
                apiToken,
                [ newMilestone ],
              );

              if(![ 200, 201 ].includes(newMilestoneRes['statusCode'])) {
                console.log('newMilestoneRes', newMilestoneRes);
                console.log({ PolygonId: polygon.id });
                milestoneNotCreated.push(polygon.id);
              }
              milestonesProcessed += 1;

              // sets the next loop  childMilestoneId
              childMilestoneId = newMilestoneRes['data'][0].id;

            }
          }
        }
      }
    }


    return { milestonesProcessed, milestoneNotCreated };

  } catch (err) {
    console.error(err);
  }
}

