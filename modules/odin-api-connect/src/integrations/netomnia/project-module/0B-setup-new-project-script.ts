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


export async function setupProjects(projects: IPolygon[], programId: string, planMilestoneTemplateId: string) {

    const httpClient = new BaseHttpClient();

    const newProjects = [];

    try {
        // North production project id
        const programRes = await httpClient.getRequest(
            baseUrl,
            `ProjectModule/v1.0/db/Program/${programId}`,
            apiToken,
        );

        console.log('programRes', programRes);

        const program = programRes['data'];
        const programAssociation = new DbRecordAssociationCreateUpdateDto();
        programAssociation.recordId = program.id;

        // map over the projects


        for(const proj of projects) {
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

            const newProjectCreateRes = await httpClient.postRequest(
                baseUrl,
                `ProjectModule/v1.0/db/batch?upsert=true`,
                apiToken,
                [ newProject ],
            );

            const newProjectRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Project/${newProjectCreateRes['data'][0].id}`,
                apiToken,
            );
            const project = newProjectRes['data'];

            console.log('project', project);

            const projectAssociation = new DbRecordAssociationCreateUpdateDto();
            projectAssociation.recordId = project.id;

            newProjects.push(project);

            const milestoneTemplateRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Project/${planMilestoneTemplateId}?entities=[TaskTemplate]`,
                apiToken,
            );

            console.log('milestoneTemplateRes', milestoneTemplateRes);
            const milestoneTemplate = milestoneTemplateRes['data'];

            console.log('milestoneTemplate', milestoneTemplate);

            // 2. Create L0 Milestone from L0 Milestone Template
            // Create a new milestone
            const newMilestone = new DbRecordCreateUpdateDto();
            newMilestone.entity = `ProjectModule:Milestone`;
            newMilestone.title = milestoneTemplate.title;
            newMilestone.properties = { ...milestoneTemplate.properties, PolygonId: proj.polygonId };
            newMilestone.associations = [
                {
                    recordId: project.id,
                },
                projectAssociation,
            ];

            const newMilestoneRes = await httpClient.postRequest(
                baseUrl,
                `ProjectModule/v1.0/db/batch?upsert=true&queueAndRelate=true`,
                apiToken,
                [ newMilestone ],
            );

            console.log('newMilestoneRes', newMilestoneRes);

            const getMilestoneRes = await httpClient.getRequest(
                baseUrl,
                `ProjectModule/v1.0/db/Milestone/${newMilestoneRes['data'][0].id}?entities=[Task]`,
                apiToken,
            );

            const milestone = getMilestoneRes['data'];
            const milestoneTasks = milestone['Task'].dbRecords;


            const taskTemplates = milestoneTemplate['TaskTemplate'].dbRecords;

            if(!milestoneTasks) {
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
                        projectAssociation,
                    ];

                    await httpClient.postRequest(
                        baseUrl,
                        `ProjectModule/v1.0/db/batch?upsert=true&queueAndRelate=true`,
                        apiToken,
                        [ newTask ],
                    );
                }
            }
        }

        // return project ids with title of the project
        return newProjects;
    } catch (e) {
        console.error(e);

    }

}

