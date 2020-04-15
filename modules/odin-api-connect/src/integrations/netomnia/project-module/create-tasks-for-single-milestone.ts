import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;

const milestoneId = null;

// Init http client
const httpClient = new BaseHttpClient();

/**
 * Script main function
 *
 * @returns void
 */
async function sync() {

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

    let hasMore = true;
    let offset = 0;
    let limit = 50;

    // Get Milestone schema
    const schemaRes = await httpClient.getRequest(
      baseUrl,
      `SchemaModule/v1.0/schemas/bymodule?moduleName=ProjectModule&entityName=Milestone`,
      apiToken,
    );
    const milestoneSchema = schemaRes['data'];

    // Get Milestone Template schema
    const templateSchemaRes = await httpClient.getRequest(
      baseUrl,
      `SchemaModule/v1.0/schemas/bymodule?moduleName=ProjectModule&entityName=MilestoneTemplate`,
      apiToken,
    );

    const milestoneTemplateSchema = templateSchemaRes['data'];

    if(milestoneId) {

      // Create milestones and tasks
      const milestoneRes = await httpClient.getRequest(
        baseUrl,
        `ProjectModule/v1.0/db/Milestone/search?
                schemas=${milestoneSchema.id}
                &boolean={
                    "must": [
                        {
                            "query_string": {
                                "fields": ["id"],
                                "query": "${milestoneId}",
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
                &page=0
                &size=1`,
        apiToken,
      );

      const milestone = milestoneRes['data'].length ? milestoneRes['data'][0] : null;

      if(milestone) {

        const milestoneTemplateRes = await httpClient.getRequest(
          baseUrl,
          `ProjectModule/v1.0/db/MilestoneTemplate/search?
                    schemas=${milestoneTemplateSchema.id}
                    &boolean={
                        "must": [
                            {
                                "query_string": {
                                    "fields": ["properties.Type"],
                                    "query": "${milestone.properties['Type']}",
                                    "lenient": true,
                                    "default_operator": "AND"
                                }
                           },
                           {
                                "query_string": {
                                    "fields": ["schemaId"],
                                    "query": "${milestoneTemplateSchema.id}",
                                    "lenient": true,
                                    "default_operator": "AND"
                                }
                           }
                        ],
                        "filter":[]
                    }
                    &sort=[]
                    &page=0
                    &size=1`,
          apiToken,
        );

        const milestoneTemplate = milestoneTemplateRes['data'][0];

        const tasks = milestoneTemplate['TaskTemplate'].dbRecords;

        for(let task of tasks) {
          await createTaskAndAssociateMilestone(task, milestone)
        }
      } else {
        console.error(`Milestone by id ${milestoneId} not found.`)
      }
    }

  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param task
 * @param milestone
 *
 * @returns void
 */
const createTaskAndAssociateMilestone = async (task, milestone) => {
  const newTask = new DbRecordCreateUpdateDto();
  newTask.entity = `ProjectModule:Task`;
  newTask.title = task.title;
  newTask.properties = {
    ...task.properties,
    PolygonId: milestone.properties['PolygonId'],
  }

  newTask.associations = [
    {
      recordId: milestone.id,
    },
  ];
  /*
   const newTaskRes = await httpClient.postRequest(
   baseUrl,
   `ProjectModule/v1.0/db/batch?upsert=true`,
   apiToken,
   [ newTask ],
   );
   */

  console.log('Task added');
}

sync();
