import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import { Parser } from 'json2csv';
import * as moment from 'moment';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { getBlockageByCableId, getBlockageById, getBlockageByRopeId } from './helpers/BlockageQueries';
import { getInCableByClosureId } from './helpers/CableQueries';
import { getChamberByClosureId } from './helpers/ChamberQueries';
import { getClosureById } from './helpers/ClosureQueries';
import { getAllDuctsByPolygonId } from './helpers/DuctQueries';
import {
  getAllFeaturesBySchemaId,
  getMilestoneBySchemaIdAndPolygonId,
  getSchemaByModuleAndEntityName,
} from './helpers/OdinQueries';
import { getRopeByCableId } from './helpers/RopeQueries';
import { getSDuctByCableId } from './helpers/SDuctQueries';

const fs = require('fs');

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

// Init http client
const httpClient = new BaseHttpClient();

const errors = [];

export async function importFeatures(l0PolygonId: number, polygonNames: string[], polygonId?: number) {

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

    const pg = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOSTNAME,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const milestoneSchema = await getSchemaByModuleAndEntityName('ProjectModule', 'Milestone');

    let polygons = [];

    // Fetch polygon data
    if(polygonId) {

      polygons = await cosmosDb.query(`SELECT * FROM ftth.polygon as poly WHERE poly.id = ${polygonId}`);

      if(polygons[0]) {
        for(const polygon of polygons) {
          await findMilestoneAndAssociateFeatureToTasks(
            milestoneSchema,
            polygon,
            cosmosDb,
            pg,
          );
        }
      }

    } else if(l0PolygonId) {
      // get all the polygonNames inside of an L0
      for(let polyName of polygonNames) {

        const polygons = await cosmosDb.query(`
                    SELECT polygon_2.* \
                    FROM ftth.polygon as polygon_1, ftth.polygon as polygon_2 \
                    WHERE ST_Intersects(polygon_1.geometry, polygon_2.geometry) \
                    AND polygon_2.name = '${polyName}' \
                    AND polygon_1.id = ${l0PolygonId}
                    ORDER BY polygon_2.id ASC
                    `);

        console.log('polygonsLength', polygons.length);

        if(polygons[0]) {
          for(const polygon of polygons) {
            await findMilestoneAndAssociateFeatureToTasks(
              milestoneSchema,
              polygon,
              cosmosDb,
              pg,
            );
          }
        }
      }
    }

  } catch (err) {
    console.error(err);
  }
}


const findMilestoneAndAssociateFeatureToTasks = async (milestoneSchema, polygon, cosmosDb, pg) => {

  const featureSchema = await getSchemaByModuleAndEntityName('ProjectModule', 'FeatureTemplate');
  console.log('featureSchema', featureSchema);
  const featureDbRecords = await getAllFeaturesBySchemaId(featureSchema.id);

  const ignoredType = [ 'ADMIN', 'TEST' ];
  const ignoredCategory = [ 'AS_BUILT' ];

  const closureId = polygon[`${polygon.name.toLowerCase()}_closure_id`];

  console.log('closureId', closureId);

  // Get the milestone by polygon Id
  const milestone = await getMilestoneBySchemaIdAndPolygonId(
    milestoneSchema.id,
    polygon.id,
    pg,
    [ 'Task' ],
  );

  if(milestone) {

    const tasks = milestone['Task'].dbRecords;

    if(tasks) {
      for(let task of tasks) {

        const taskCategory = getProperty(task, 'Category');

        if(
          ignoredType.indexOf(task.properties['Type']) === -1 &&
          ignoredCategory.indexOf(taskCategory) === -1 &&
          taskCategory
        ) {
          switch (taskCategory) {
            // case 'CLOSURE':
            //     await associateClosureToTask(
            //         task,
            //         closureId,
            //         cosmosDb,
            //         featureDbRecords,
            //         polygon,
            //         milestone,
            //     );
            //     break;
            // case 'CABLE':
            //     await associateCableToTask(
            //         task,
            //         closureId,
            //         cosmosDb,
            //         featureDbRecords,
            //         polygon,
            //         milestone,
            //     );
            //     break;
            // case 'DUCT':
            //     await associateDuctToTask(
            //         task,
            //         closureId,
            //         cosmosDb,
            //         featureDbRecords,
            //         polygon,
            //         milestone,
            //     );
            //     break;
            case 'SUB_DUCT':
              await associateSubDuctToTask(
                task,
                closureId,
                cosmosDb,
                featureDbRecords,
                polygon,
                milestone,
              );
              break;
            // case 'CHAMBER':
            //     await associateChamberToTask(
            //         task,
            //         closureId,
            //         cosmosDb,
            //         featureDbRecords,
            //         polygon,
            //         milestone,
            //     );
            //     break;
            // case 'ROPE':
            //     await associateRopeToTask(
            //         task,
            //         closureId,
            //         cosmosDb,
            //         featureDbRecords,
            //         polygon,
            //         milestone,
            //     );
            //     break;
          }
        }
      }

      if(errors && errors[0]) {
        let csv = '';
        const fields = Object.keys(errors[0]).map(elem => (elem));

        try {
          // csv = parse({ data: report, fields });
          const parser = new Parser({ fields });
          csv = parser.parse(errors);
        } catch (err) {
          console.error(err);
        }

        console.log(errors);

        fs.writeFileSync(`feature-import-errors-${moment().format('DD-MM-YYYY')}.csv`, csv);
      }
    } else {
      console.log('NO_TASKS', milestone.id);
    }
  }
}

/**
 *
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 * @param polygon
 */
const associateClosureToTask = async (task, closureId, connection, allFeatures, polygon, milestone) => {

  const closureData = await getClosureById(closureId, connection);
  const closureFeature = allFeatures.find(e => e.properties['Feature'] == `CLOSURE_${polygon.name}`);

  // Add the cable feature to the task
  if(closureFeature && closureData) {

    const taskType = getProperty(task, 'Type');
    if(taskType !== 'SPLICE' && taskType !== 'TEST') {
      // First create the association to the feature
      const feature = await createTaskFeature(
        task,
        closureData,
        closureFeature,
        polygon,
      );

      console.log('feature', feature);
    }
  }
}

/**
 * There is no Duct Task in Odin
 * So we add the SDuct to the Cable task
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 * @param milestone
 */
const associateCableToTask = async (task, closureId, connection, allFeatures, polygon, milestone) => {

  const cableData = await getInCableByClosureId(closureId, connection);

  // Handle different logic for cables
  // CABLE_SPINE
  // CABLE_DISTRIBUTION
  // CABLE_ACCESS
  // CABLE_FEED
  // Add the cable feature to the task
  if(cableData) {

    console.log('cableData', cableData);
    const cableFeature = allFeatures.find(e => e.properties['Feature'].includes(`CABLE_${cableData['name'].toUpperCase()}`));
    console.log('cableFeature', cableFeature);

    if(cableFeature) {
      const ropeData = await getRopeByCableId(cableData.id, connection);
      const cableBlockage = await getBlockageByCableId(cableData.id, connection);
      let ropeBlockage = [];
      if(ropeData) {
        ropeBlockage = await getBlockageByRopeId(ropeData.id, connection);
      }

      // associate blockage for cables if no rope blockage exists
      if(cableBlockage.length > 0 && ropeBlockage.length < 1) {
        for(const blockage of cableBlockage) {
          await associateBlockageToTask(
            task,
            blockage.blockage_id,
            connection,
            allFeatures,
            polygon,
            milestone,
          );
        }
      }
      console.log('cableBlockage', cableBlockage);
      // First create the association to the feature
      const feature = await createTaskFeature(
        task,
        cableData,
        cableFeature,
        polygon,
      );

      console.log('feature', feature);
    }
  }

  console.log(cableData);
}

/**
 * There is no Duct Task in Odin
 * So we add the SDuct to the Cable task
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 * @param milestone
 */
const associateDuctToTask = async (task, closureId, connection, allFeatures, polygon, milestone) => {

  console.log('associateDuctToTask', allFeatures);

  const ductFeature = allFeatures.find(e => e.properties['Feature'] === 'DUCT');

  // Add the duct feature to the task
  if(polygon && polygon.name === 'L2') {

    const polygonDucts = await getAllDuctsByPolygonId(polygon.id, connection);

    if(polygonDucts) {

      for(const duct of polygonDucts) {

        // First create the association to the feature
        const feature = await createTaskFeature(
          task,
          duct,
          ductFeature,
          polygon,
        );

        console.log('feature', feature);
      }
    }
  }
}


/**
 * There is no Duct Task in Odin
 * So we add the SDuct to the Cable task
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 * @param milestone
 */
const associateSubDuctToTask = async (task, closureId, connection, allFeatures, polygon, milestone) => {

  const cableData = await getInCableByClosureId(closureId, connection);
  const subDuctFeature = allFeatures.find(e => e.properties['Feature'].includes('DUCT_SUB_DUCT'));

  // Add the duct feature to the task
  if(cableData) {


    console.log('cableData', cableData);
    const cableSubDuct = await getSDuctByCableId(cableData.id, connection);
    console.log('cableSubDuct', cableSubDuct);

    if(cableSubDuct) {

      // First create the association to the feature
      const feature = await createTaskFeature(
        task,
        cableSubDuct,
        subDuctFeature,
        polygon,
      );

      console.log('feature', feature);
    }
  }

  console.log(cableData);
}


/**
 *
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 */
const associateChamberToTask = async (task, closureId, connection, allFeatures, polygon, milestone) => {

  const chamberData = await getChamberByClosureId(closureId, connection);

  console.log('chamberData', chamberData);

  if(chamberData) {

    const chamberFeature = allFeatures.find(e => e.properties['Feature'].includes(`CHAMBER_${chamberData.name.toUpperCase()}`));

    if(chamberFeature) {

      // First create the association to the feature
      const feature = await createTaskFeature(
        task,
        chamberData,
        chamberFeature,
        polygon,
      );

      console.log('feature', feature);
    }
  }
}

/**
 *
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 */
const associateRopeToTask = async (task, closureId, connection, allFeatures, polygon, milestone) => {

  const cableData = await getInCableByClosureId(closureId, connection);

  if(cableData) {

    // Check for blockage
    const ropeData = await getRopeByCableId(cableData.id, connection);

    const ropeFeature = allFeatures.find(e => e.properties['Feature'].includes(`ROPE`));

    console.log('ropeData', ropeData);
    if(ropeFeature && ropeData) {

      // const cableBlockage = await getBlockageByCableId(cableData.id, connection);
      const ropeBlockage = await getBlockageByRopeId(ropeData.id, connection);

      if(ropeBlockage.length > 0) {
        for(const blockage of ropeBlockage) {
          await associateBlockageToTask(
            task,
            blockage.blockage_id,
            connection,
            allFeatures,
            polygon,
            milestone,
          );
        }
      }
      console.log('ropeData', ropeData);

      // First create the association to the feature
      const feature = await createTaskFeature(
        task,
        ropeData,
        ropeFeature,
        polygon,
      );

      console.log('feature', feature);

    } else {
      errors.push({
        task: task.title,
        closureId,
        cableId: cableData ? cableData.id : null,
        reason: 'no rope for cable',
      });
    }
  }
}

/**
 *
 * @param task
 * @param closureId
 * @param connection
 * @param allFeatures
 */
const associateBlockageToTask = async (task, blockageId, connection, allFeatures, polygon, milestone) => {

  // TODO: Blockage standard first and standard next needs to be handled

  let blockageData = await getBlockageById(blockageId, connection);

  if(blockageData) {

    console.log('blockageData', blockageData);
    console.log('blockageData.model_name', blockageData.model_name);

    const blockageFeature = allFeatures.find(e => e.properties['Feature'].includes(blockageData.model_name.toUpperCase()));

    console.log('blockageFeature', blockageFeature);
    // returns FIST, NEXT, DESILT

    if(blockageFeature) {
      // First create the association to the feature
      const feature = await createTaskFeature(
        task,
        blockageData,
        blockageFeature,
        polygon,
      );

      console.log('feature', feature);
    }

  }
}

/**
 *
 * @param task
 * @param odinFeature
 */
const createTaskFeature = async (task, gisFeature, odinFeature, polygon) => {

  console.log({ task, gisFeature, odinFeature });

  const newRecord = new DbRecordCreateUpdateDto();
  newRecord.entity = 'ProjectModule:Feature';
  newRecord.title = `${odinFeature.title}`;
  newRecord.properties = {
    ...odinFeature.properties,
    ExternalRef: gisFeature.id,
  };
  newRecord.associations = [
    {
      recordId: task.id,
    },
    {
      recordId: odinFeature.id,
    },
  ];

  console.log('newRecord', newRecord);

  const newRecordRes = await httpClient.postRequest(
    baseUrl,
    `ProjectModule/v1.0/db/batch?upsert=true`,
    apiToken,
    [ newRecord ],
  );

  console.log('newRecordRes', newRecordRes);

  return newRecordRes['data'][0];
}

