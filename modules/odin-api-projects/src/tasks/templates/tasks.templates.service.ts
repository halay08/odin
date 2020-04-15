import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { TASK, SUBTASK } = SchemaModuleEntityTypeEnums;

@Injectable()
export class TasksTemplatesService {

    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private pipelineStagesService: PipelineEntitysStagesService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;

    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        pipelineStagesService: PipelineEntitysStagesService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineStagesService = pipelineStagesService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
    }


    /**
     *
     * @param principal
     * @param milestoneId
     * @param templateKey
     * @param body
     */
    public async createTasksFromTemplate(
        principal: OrganizationUserEntity,
        milestoneId: string,
        templateKey: string,
        body: { [key: string]: any },
    ): Promise<DbRecordEntityTransform[]> {
        try {
            const tasks = [];
            if(tasks) {
                let createdTasks = [];

                for(const task of tasks) {
                    // Create tasks for the milestone
                    const milestoneAssociation = new DbRecordAssociationCreateUpdateDto();
                    milestoneAssociation.recordId = milestoneId;

                    task.associations = [ ...task.associations, milestoneAssociation ]
                    // Set the previously created task as a blocker
                    if(task.blockedByPrevious) {
                        if(createdTasks && createdTasks.length > 0) {

                            const blockingTaskAssociation = new DbRecordAssociationCreateUpdateDto();
                            blockingTaskAssociation.recordId = createdTasks[createdTasks.length - 1].id;
                            // set the new associations for the task
                            task.associations = [ ...task.associations, blockingTaskAssociation ];
                        }
                    }

                    const newTask = new DbRecordCreateUpdateDto();
                    newTask.entity = `${PROJECT_MODULE}:${TASK}`;
                    newTask.title = task.title;
                    newTask.properties = task.properties;
                    newTask.associations = task.associations && task.associations.length > 0 ? task.associations : undefined;

                    const createTask = await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [ newTask ]);

                    const createSubTasks = await this.createSubtasksFromTemplate(
                        principal,
                        createTask[0].id,
                        task.subtaskTemplateKey,
                    );

                    createdTasks.push(createTask[0]);
                }

                return createdTasks;

            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param milestoneId
     * @param templateKey
     * @param body
     */
    public async createSubtasksFromTemplate(
        principal: OrganizationUserEntity,
        taskId: string,
        templateKey: string,
    ): Promise<DbRecordEntityTransform[]> {
        try {
            const tasks = [];
            if(tasks) {
                let createdTasks = [];

                for(const task of tasks) {
                    // Create tasks for the milestone
                    const taskAssociation = new DbRecordAssociationCreateUpdateDto();
                    taskAssociation.recordId = taskId;

                    task.associations = [ ...task.associations, taskAssociation ]
                    // Set the previously created task as a blocker
                    if(task.blockedByPrevious) {
                        if(createdTasks && createdTasks.length > 0) {

                            const blockingTaskAssociation = new DbRecordAssociationCreateUpdateDto();
                            blockingTaskAssociation.recordId = createdTasks[createdTasks.length - 1].id;
                            // set the new associations for the task
                            task.associations = [ ...task.associations, blockingTaskAssociation ];
                        }
                    }

                    const newTask = new DbRecordCreateUpdateDto();
                    newTask.entity = `${PROJECT_MODULE}:${SUBTASK}`;
                    newTask.title = task.title;
                    newTask.properties = task.properties;
                    newTask.associations = task.associations && task.associations.length > 0 ? task.associations : undefined;

                    const subTask = await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, [ newTask ]);

                    createdTasks.push(subTask[0]);
                }

                return createdTasks;

            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }
}
