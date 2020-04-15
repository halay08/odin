import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { createMilestoneAndTasksByPolygonId, getSchemaByModuleAndEntityName } from './helpers/OdinQueries';

dotenv.config({ path: '../../../../.env' });

/**
 * Script main function
 *
 * @returns void
 */
export async function importTasks(l0PolygonId: number, polygonNames: string[], polygonId?: number) {

  // Try establishing connection with cosmos database
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

    // Youfibre DB connection
    const odinDbConnection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });


    const milestoneSchema = await getSchemaByModuleAndEntityName('ProjectModule', 'Milestone');
    const milestoneTemplateSchema = await getSchemaByModuleAndEntityName('ProjectModule', 'MilestoneTemplate');

    if(polygonId) {

      // Create milestone and tasks from a single polygonId
      await createMilestoneAndTasksByPolygonId(
        polygonId,
        milestoneSchema,
        milestoneTemplateSchema,
        odinDbConnection,
      );

    } else if(l0PolygonId) {

      // get all the polygonNames inside of an L0

      for(let polyName of polygonNames) {
        console.log('polyName', polyName);

        const polygons = await cosmosDb.query(`
                    SELECT polygon_2.id \
                    FROM ftth.polygon as polygon_1, ftth.polygon as polygon_2 \
                    WHERE ST_Intersects(polygon_1.geometry, polygon_2.geometry) \
                    AND polygon_2.name = '${polyName}' \
                    AND polygon_1.id = ${l0PolygonId}
                `);

        console.log('polygonsLength', polygons.length);

        if(polygons[0]) {
          for(const polygon of polygons) {

            await createMilestoneAndTasksByPolygonId(
              polygon.id,
              milestoneSchema,
              milestoneTemplateSchema,
              odinDbConnection,
            );
          }
        }
      }
    }

    return 'tasks imported';

  } catch (err) {
    console.error(err);
  }
}

