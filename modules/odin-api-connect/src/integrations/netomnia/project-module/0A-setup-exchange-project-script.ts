import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { BaseHttpClient } from '../../../common/Http/BaseHttpClient';
import { IPolygon } from './interfaces/gis.interfaces';

dotenv.config({ path: '../../../../.env' });

const baseUrl = process.env.K8_BASE_URL;
const apiToken = process.env.ODIN_API_TOKEN;


// const programId = '519d959b-20de-4346-bde9-8a3ca3ee107b';
// const l0PolygonId = 144; // this is an L0 polygon 1 of 4 L0 s
// const exchangeMilestoneTemplateId = 'b41e58e9-2f97-4198-a3d0-638f81d7d701'; // Build (Exchange)

export async function setupExchangeProject(
    exchangeProjects: IPolygon[],
    programId: string,
    l0PolygonId: number,
    exchangeMilestoneTemplateId: string,
) {

    const httpClient = new BaseHttpClient();

    const newProjects = [];

    try {

        // North production project id
        const programRes = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/db/Program/${programId}`,
            apiToken,
        );

        const program = programRes['data'];
        const programAssociation = new DbRecordAssociationCreateUpdateDto();
        programAssociation.recordId = program.id;

        // map over the projects

        for(const proj of exchangeProjects) {

            console.log('proj', proj);
            // Create a project
            const newProject = new DbRecordCreateUpdateDto();
            newProject.entity = `ProjectModule:Project`;
            newProject.title = proj.title;
            newProject.properties = {
                PolygonId: proj.polygonId,
            };
            newProject.associations = [
                {
                    recordId: program.id,
                },
            ];

            const newProjectRes = await httpClient.postRequest(
                baseUrl,
                `ProjectModule/v1.0/db/batch?upsert=true`,
                apiToken,
                [ newProject ],
            );

            const project = newProjectRes['data']

            const projectAssociation = new DbRecordAssociationCreateUpdateDto();
            projectAssociation.recordId = project[0].id;

            newProjects.push(project[0]);

            const milestoneTemplateRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Project/${exchangeMilestoneTemplateId}?entities=[TaskTemplate]`,
                apiToken,
            );

            const milestoneTemplate = milestoneTemplateRes['data'];

            // 2. Create L0 Milestone from L0 Milestone Template
            // Create a new milestone
            const newMilestone = new DbRecordCreateUpdateDto();
            newMilestone.entity = `ProjectModule:Milestone`;
            newMilestone.title = milestoneTemplate.title;
            newMilestone.properties = { ...milestoneTemplate.properties, PolygonId: proj.polygonId };
            newMilestone.associations = [
                projectAssociation,
            ];

            const newMilestoneCreateRes = await httpClient.postRequest(
                baseUrl,
                `ProjectModule/v1.0/db/batch?upsert=true`,
                apiToken,
                [ newMilestone ],
            );

            const newMilestoneRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Milestone/${newMilestoneCreateRes['data'][0].id}`,
                apiToken,
            );
            const milestone = newMilestoneRes['data'];

            const taskTemplates = milestoneTemplate['TaskTemplate'].dbRecords;

            if(milestone) {

                // Loop over the milestone task templates
                // Create a new task from the task template
                // Association the task with the new milestone created above
                for(let task of taskTemplates) {
                    const newTask = new DbRecordCreateUpdateDto();
                    newTask.entity = `ProjectModule:Task`;
                    newTask.title = task.title;
                    newTask.properties = {
                        ...task.properties,
                        PolygonId: getProperty(milestone, 'PolygonId'),
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

                    console.log('newTaskRes', newTaskRes)
                }
            }
        }

        // return project ids with title of the project
        return newProjects;
    } catch (e) {
        console.error(e);

    }

}

