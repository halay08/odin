import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { forwardRef, Inject } from '@nestjs/common';
import { TasksTemplatesService } from '../../tasks/templates/tasks.templates.service';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { MILESTONE, TASK } = SchemaModuleEntityTypeEnums;


export class MilestonesTemplatesService {

    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private pipelineStagesService: PipelineEntitysStagesService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private tasksTemplatesService: TasksTemplatesService;

    constructor(
        @Inject(forwardRef(() => DbRecordsAssociationsService)) dbRecordsAssociationsService: DbRecordsAssociationsService,
        @Inject(forwardRef(() => DbService)) dbService: DbService,
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        pipelineStagesService: PipelineEntitysStagesService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        tasksTemplatesService: TasksTemplatesService,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineStagesService = pipelineStagesService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.tasksTemplatesService = tasksTemplatesService;
    }


    /**
     *
     * @param principal
     * @param milestoneBody
     * @param tasks
     * @private
     */
    public async createMilestoneAndTasks(
        principal: OrganizationUserEntity,
        milestoneBody: DbRecordCreateUpdateDto,
        templateKey: string,
        body: { [key: string]: any },
    ) {
        try {
            // Create a new milestone
            const newMilestone = new DbRecordCreateUpdateDto();
            newMilestone.entity = `${PROJECT_MODULE}:${MILESTONE}`;
            newMilestone.title = milestoneBody.title;
            newMilestone.properties = milestoneBody.properties;
            newMilestone.associations = milestoneBody.associations;

            // Create Milestone through schema manager
            const milestone = await this.dbService.updateOrCreateDbRecordsByPrincipal(
                principal,
                [ newMilestone ],
            );


            // Create tasks for the milestone
            const milestoneAssociation = new DbRecordAssociationCreateUpdateDto();
            milestoneAssociation.recordId = milestone[0].id;

            let createdTasks = [];
            const tasks = [];
            if(tasks) {
                for(const task of tasks) {
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

                    createdTasks.push(createTask[0]);
                }
            }

            return milestone;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);

        }
    }
}
