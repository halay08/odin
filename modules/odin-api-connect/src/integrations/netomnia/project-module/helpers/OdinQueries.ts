// Init http client
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import * as dotenv from 'dotenv';
import { BaseHttpClient } from '../../../../common/Http/BaseHttpClient';

dotenv.config({ path: '../../../../.env' });

const httpClient = new BaseHttpClient();

const baseUrl = process.env.HTTP_API_URL;
const apiToken = process.env.ODIN_API_TOKEN;

/**
 *
 * Find the parent milestone
 *
 * @param polygon
 * @param cosmosDb
 * @param odinDbConnection
 *
 * @returns Milestone Id | *UUID*
 */
export const getParentMilestone = async (polygon, cosmosDb, odinDbConnection) => {

    let closureIdToFind;

    let level = polygon.name.replace('L', '');
    let levelToFind = level - 1;
    let closureIdToFindProp = `l${levelToFind}_closure_id`;
    closureIdToFind = polygon[closureIdToFindProp];

    let currentClosureProp = `l${level}_closure_id`;

    // Get the parent polygon
    const parentPolygon = await cosmosDb.query(`SELECT * FROM ftth.polygon
    WHERE ftth.polygon.${closureIdToFindProp} = ${closureIdToFind}
    AND ftth.polygon.${currentClosureProp} IS NULL
    AND ftth.polygon.name = 'L${levelToFind}'`);

    // Get the milestone in Odin
    let milestoneId;
    if(parentPolygon && parentPolygon[0].id) {

        const milestone = await odinDbConnection.query(`SELECT record_id FROM db_records_columns
        LEFT JOIN schemas_columns ON (db_records_columns.column_id = schemas_columns.id)
        WHERE value = '${parentPolygon[0].id}'
        AND schemas_columns.name = 'PolygonId;`);

        if(milestone && milestone[0]) {
            milestoneId = milestone[0].record_id;
        }
    }

    return milestoneId;
};

/**
 *
 * @param polyName
 */
export const getMilestoneTemplateId = (polyName) => {
    if(polyName === 'L1') {
        return '89a8f8f7-0418-4c65-9d1c-bd8de770772d'
    } else if(polyName === 'L2') {
        return 'fa8a17c2-e546-4c89-acc2-e75f243ff43d'
    } else if(polyName === 'L3') {
        return '160c1c89-7f0b-4a91-a742-752ffd1610c2'
    } else if(polyName === 'L4') {
        return '76ec8ee7-c322-452c-aa46-fd1dcb9b4f5d'
    }
};

export const getProjectById = async (projectId): Promise<DbRecordEntityTransform> => {

    const projectRes = await httpClient.getRequest(
        baseUrl,
        `ProjectModule/v1.0/db/Project/${projectId}`,
        apiToken,
    );

    return projectRes['data'];
};

/**
 *
 * @param moduleName
 * @param entityName
 */
export const getSchemaByModuleAndEntityName = async (moduleName: string, entityName: string) => {

    if(moduleName && entityName) {
        const schemaRes = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/schemas/bymodule?moduleName=${moduleName}&entityName=${entityName}`,
            apiToken,
        );

        return schemaRes['data'];
    }

    return;
}

/**
 *
 * @param schemaId
 */
export const getAllFeaturesBySchemaId = async (schemaId: string) => {
    if(schemaId) {
        const odinFeatures = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/db/Feature/search?terms=*&boolean={}&fields=&schemas=${schemaId}&page=0&size=100&sort=[{"updatedAt":{"order":"asc"}}]`,
            apiToken,
        );
        return odinFeatures['data'];
    }

    return;
}

/**
 *
 * @param schemaId
 * @param polygonId
 */
export const searchRecordsBySchemaIdAndPolygonId = async (
    schemaId: string,
    polygonId: number,
    offset: number,
    limit: number,
) => {
    if(schemaId && polygonId) {
        const searchRes = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/db/Milestone/search?
                schemas=${schemaId}
                &boolean={
                    "must": [
                        {
                            "query_string": {
                                "fields": ["properties.PolygonId"],
                                "query": "${polygonId}",
                                "lenient": true,
                                "default_operator": "AND"
                            }
                       },
                       {
                            "query_string": {
                                "fields": ["schemaId"],
                                "query": "${schemaId}",
                                "lenient": true,
                                "default_operator": "AND"
                            }
                       }
                    ],
                    "filter":[]
                }
                &sort=[]
                &page=${offset || 0}
                &size=${limit || 1}`,
            apiToken,
        );

        return searchRes['data'] ? searchRes['data'] : null;
    }

    return;
}

/**
 *
 * @param schemaId
 * @param polygonId
 */
export const getMilestoneBySchemaIdAndPolygonId = async (
    schemaId: string,
    polygonId: string,
    odinDbConnection: any,
    entities?: string[],
) => {
    if(schemaId && polygonId) {

        const milestone = await odinDbConnection.query(`SELECT record_id FROM db_records_columns
        LEFT JOIN schemas_columns ON (db_records_columns.column_id = schemas_columns.id)
        WHERE db_records_columns.value = '${polygonId}'
        AND db_records_columns.schema_id = '${schemaId}'
        AND schemas_columns.name = 'PolygonId';`);

        if(milestone[0]) {

            const res = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Milestone/${milestone[0].record_id}?entities=[${entities || []}]`,
                apiToken,
            );

            return res['data'];
        }

        return;
    }

    return;
}

/**
 *
 * @param schemaId
 * @param polygonId
 */
export const getMilestoneTemplateBySchemaIdAndType = async (
    schemaId: string,
    type: string,
    odinDbConnection: any,
    entities?: string[],
) => {
    if(schemaId && type) {

        const milestoneTemplate = await odinDbConnection.query(`SELECT record_id FROM db_records_columns \
        LEFT JOIN schemas_columns ON (db_records_columns.column_id = schemas_columns.id) \
        WHERE db_records_columns.value = '${type}' \
        AND db_records_columns.schema_id = '${schemaId}' \
        AND schemas_columns.name = 'Type';`);

        if(milestoneTemplate[0]) {
            const res = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/MilestoneTemplate/${milestoneTemplate[0].record_id}?entities=[${entities || []}]`,
                apiToken,
            );

            return res['data'];
        }

        return;
    }

    return;
}

/**
 *
 * @param schemaId
 * @param polygonId
 */
export const getMilestoneTemplateByRecordId = async (
    recordId: string,
    odinDbConnection: any,
    entities?: string[],
) => {
    if(recordId) {

        const res = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/db/MilestoneTemplate/${recordId}?entities=[${entities || []}]`,
            apiToken,
        );

        return res['data'];
    }

    return;
}

/**
 *
 * @param schemaId
 * @param polygonId
 */
export const getTaskBySchemaIdAndPolygonId = async (
    schemaId: string,
    polygonId: number,
    odinDbConnection: any,
    entities?: string[],
) => {
    if(schemaId && polygonId) {

        const task = await odinDbConnection.query(`SELECT record_id FROM db_records_columns
        LEFT JOIN schemas_columns ON (db_records_columns.column_id = schemas_columns.id)
        WHERE db_records_columns.value = '${polygonId}'
        AND db_records_columns.schema_id = '${schemaId}'
        AND schemas_columns.name = 'PolygonId';`);

        if(task[0]) {

            const res = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Task/${task[0].record_id}?entities=[${entities || []}]`,
                apiToken,
            );

            return res['data'];
        }

        return;
    }

    return;
}


/**
 *
 * Common function for creating/updating tasks by polygon id
 *
 * @param polygonId
 * @param milestoneSchema
 * @param milestoneTemplateSchema
 *
 * @returns null
 */
export const createMilestoneAndTasksByPolygonId = async (
    polygonId,
    milestoneSchema,
    milestoneTemplateSchema,
    odinDbConnection,
) => {

    let hasMore = true;
    let offset = 0;
    let limit = 100;

    while (hasMore) {

        const milestones = await searchRecordsBySchemaIdAndPolygonId(milestoneSchema.id, polygonId, offset, limit);

        if(milestones && milestones.length > 0) {
            for(let milestone of milestones) {

                const milestoneTemplate = await getMilestoneTemplateBySchemaIdAndType(
                    milestoneTemplateSchema.id,
                    milestone.properties['Type'],
                    odinDbConnection,
                    [ 'TaskTemplate' ],
                )
                const tasks = milestoneTemplate['TaskTemplate'].dbRecords;

                for(let task of tasks) {

                    await createTaskAndAssociateMilestone(task, milestone);
                }
                offset++;
            }
        } else {
            // console.log('results are 0');
            hasMore = false;
            break;
        }
    }

    console.log('Milestone search done');
    return null;
}

/**
 *
 * @param task
 * @param milestone
 *
 * @returns void
 */
export const createTaskAndAssociateMilestone = async (task, milestone) => {

    const newTask = new DbRecordCreateUpdateDto();
    newTask.entity = `ProjectModule:Task`;
    newTask.title = `${task.title} ${milestone.properties['PolygonId']}`;
    newTask.properties = {
        ...task.properties,
        PolygonId: milestone.properties['PolygonId'],
    }
    newTask.associations = [
        {
            recordId: milestone.id,
        },
    ];

    const newTaskRes = await httpClient.postRequest(
        baseUrl,
        `ProjectModule/v1.0/db/batch?upsert=true&queueAndRelate=true`,
        apiToken,
        [ newTask ],
    );

    console.log('newTaskRes', newTaskRes);
}

