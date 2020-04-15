import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { PipelineCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/dto/pipeline.create.update.dto';
import { PipelineStageCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/stage/dto/pipeline.stage.create.update.dto';
import { SchemaAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import {
    SchemaModuleEntityTypeEnums,
    SchemaModuleEntityTypes,
} from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { PipelineEntitysService } from '@d19n/schema-manager/dist/pipelines/pipelines.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasAssociationsService } from '@d19n/schema-manager/dist/schemas/associations/schemas.associations.service';
import { SchemasColumnsService } from '@d19n/schema-manager/dist/schemas/columns/schemas.columns.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { dbRecordAssociationUrlConstants, dbRecordUrlConstants } from '@d19n/schema-manager/dist/schemas/url.constants';
import { Injectable } from '@nestjs/common';
import * as FEATURE from './features/feature.entity';
import * as FEATURE_TEMPLATE from './features/templates/feature.template.entity';
import * as MILESTONE from './milestones/milestone.entity';
import * as MILESTONE_TEMPLATE from './milestones/templates/milestone.template.entity';
import * as PROGRAM from './programs/program.entity';
import * as PROJECT from './projects/project.entity';
import * as SUBTASK from './subtasks/subtask.entity';
import * as SUBTASK_TEMPLATE from './subtasks/templates/subtask.template.entity';
import * as TASK from './tasks/task.entity';
import * as TASK_TEMPLATE from './tasks/templates/task.template.entity';

@Injectable()
export class InitializeService {

    private schemasService: SchemasService;
    private pipelineEntitysService: PipelineEntitysService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private schemasColumnsService: SchemasColumnsService;
    private schemasAssociationsService: SchemasAssociationsService;

    constructor(
        schemasService: SchemasService,
        schemasColumnsService: SchemasColumnsService,
        schemasAssociationsService: SchemasAssociationsService,
        pipelineEntitysService: PipelineEntitysService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
    ) {
        this.schemasService = schemasService;
        this.schemasColumnsService = schemasColumnsService;
        this.schemasAssociationsService = schemasAssociationsService;
        this.pipelineEntitysService = pipelineEntitysService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
    }

    public async initialize(principal: OrganizationUserEntity, headers): Promise<any> {
        try {

            const noteSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.SUPPORT_MODULE}:Note`,
            );

            const fileSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `SchemaModule:File`,
            );

            const productSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${SchemaModuleTypeEnums.PRODUCT_MODULE}:${SchemaModuleEntityTypeEnums.PRODUCT}`,
            );


            let initializeResults = [];

            /**
             *  Create Program Schema
             */
            const programSchemaCreate = new SchemaCreateUpdateDto();
            programSchemaCreate.name = SchemaModuleEntityTypes.PROGRAM.name;
            programSchemaCreate.description = 'programs for the project management module.';
            programSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            programSchemaCreate.entityName = SchemaModuleEntityTypeEnums.PROGRAM;
            programSchemaCreate.recordNumber = 1;
            programSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.PROGRAM.prefix;
            programSchemaCreate.isSequential = true;
            programSchemaCreate.isStatic = true;
            programSchemaCreate.isHidden = false;
            programSchemaCreate.hasTitle = true;
            programSchemaCreate.isTitleUnique = true;
            programSchemaCreate.position = 1;
            programSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            programSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            programSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            programSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            programSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const programSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                programSchemaCreate,
                { upsert: true },
            );

            const programColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                programSchema.id,
                PROGRAM.columns,
            );
            initializeResults.push({
                programColumns,
            });

            try {
                /**
                 * Create Program Pipeline
                 * Create Program Pipeline Stages
                 */
                const programPipelineCreate = new PipelineCreateUpdateDto();

                programPipelineCreate.name = 'Program';
                programPipelineCreate.key = 'ProgramPipeline';
                programPipelineCreate.description = 'pipeline for programs';
                programPipelineCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
                programPipelineCreate.entityName = SchemaModuleEntityTypeEnums.PROGRAM;
                programPipelineCreate.isDefault = true;

                const programPipeline = await this.pipelineEntitysService.createByPrincipal(
                    principal,
                    programPipelineCreate,
                );

                const programStageTodoCreate = new PipelineStageCreateUpdateDto();
                programStageTodoCreate.name = 'Todo';
                programStageTodoCreate.key = 'ProgramStageTodo';
                programStageTodoCreate.description = 'program todo stage';
                programStageTodoCreate.isDefault = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    programPipeline.id,
                    programStageTodoCreate,
                );

                const programStageInProgressCreate = new PipelineStageCreateUpdateDto();
                programStageInProgressCreate.name = 'In Progress';
                programStageInProgressCreate.key = 'ProgramStageInProgress';
                programStageInProgressCreate.description = 'program in progress stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    programPipeline.id,
                    programStageInProgressCreate,
                );

                const programStageOnHoldCreate = new PipelineStageCreateUpdateDto();
                programStageOnHoldCreate.name = 'On Hold';
                programStageOnHoldCreate.key = 'ProgramStageOnHold';
                programStageOnHoldCreate.description = 'program on hold stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    programPipeline.id,
                    programStageOnHoldCreate,
                );

                const programStageDoneCreate = new PipelineStageCreateUpdateDto();
                programStageDoneCreate.name = 'Done';
                programStageDoneCreate.key = 'ProgramStageDone';
                programStageDoneCreate.description = 'program done stage';
                programStageDoneCreate.isSuccess = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    programPipeline.id,
                    programStageDoneCreate,
                );

                const programStageStopCreate = new PipelineStageCreateUpdateDto();
                programStageStopCreate.name = 'Stop';
                programStageStopCreate.key = 'ProgramStageStop';
                programStageStopCreate.description = 'program stop stage';
                programStageStopCreate.isFail = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    programPipeline.id,
                    programStageStopCreate,
                );
            } catch (e) {
                console.error(e);
            }


            /**
             *  Create Project Schema
             */
            const projectSchemaCreate = new SchemaCreateUpdateDto();
            projectSchemaCreate.name = SchemaModuleEntityTypes.PROJECT.name;
            projectSchemaCreate.description = 'projects for the project management module.';
            projectSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            projectSchemaCreate.entityName = SchemaModuleEntityTypeEnums.PROJECT;
            projectSchemaCreate.recordNumber = 1;
            projectSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.PROJECT.prefix;
            projectSchemaCreate.isSequential = true;
            projectSchemaCreate.isStatic = true;
            projectSchemaCreate.isHidden = false;
            projectSchemaCreate.hasTitle = true;
            projectSchemaCreate.isTitleUnique = true;
            projectSchemaCreate.position = 1;
            projectSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            projectSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            projectSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            projectSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            projectSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const projectSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                projectSchemaCreate,
                { upsert: true },
            );

            const projectColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                projectSchema.id,
                PROJECT.columns,
            );
            initializeResults.push({
                projectColumns,
            });

            try {

                /**
                 * Create Project Pipeline
                 * Create Project Pipeline Stages
                 */
                const projectPipelineCreate = new PipelineCreateUpdateDto();

                projectPipelineCreate.name = 'Project';
                projectPipelineCreate.key = 'ProjectPipeline';
                projectPipelineCreate.description = 'pipeline for projects';
                projectPipelineCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
                projectPipelineCreate.entityName = SchemaModuleEntityTypeEnums.PROJECT;
                projectPipelineCreate.isDefault = true;

                const projectPipeline = await this.pipelineEntitysService.createByPrincipal(
                    principal,
                    projectPipelineCreate,
                );

                const projectStageTodoCreate = new PipelineStageCreateUpdateDto();
                projectStageTodoCreate.name = 'Todo';
                projectStageTodoCreate.key = 'ProjectStageTodo';
                projectStageTodoCreate.description = 'project todo stage';
                projectStageTodoCreate.isDefault = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    projectPipeline.id,
                    projectStageTodoCreate,
                );

                const projectStageInProgressCreate = new PipelineStageCreateUpdateDto();
                projectStageInProgressCreate.name = 'In Progress';
                projectStageInProgressCreate.key = 'ProjectStageInProgress';
                projectStageInProgressCreate.description = 'project in progress stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    projectPipeline.id,
                    projectStageInProgressCreate,
                );

                const projectStageOnHoldCreate = new PipelineStageCreateUpdateDto();
                projectStageOnHoldCreate.name = 'On Hold';
                projectStageOnHoldCreate.key = 'ProjectStageOnHold';
                projectStageOnHoldCreate.description = 'project on hold stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    projectPipeline.id,
                    projectStageOnHoldCreate,
                );

                const projectStageDoneCreate = new PipelineStageCreateUpdateDto();
                projectStageDoneCreate.name = 'Done';
                projectStageDoneCreate.key = 'ProjectStageDone';
                projectStageDoneCreate.description = 'project done stage';
                projectStageDoneCreate.isSuccess = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    projectPipeline.id,
                    projectStageDoneCreate,
                );

                const projectStageStopCreate = new PipelineStageCreateUpdateDto();
                projectStageStopCreate.name = 'Stop';
                projectStageStopCreate.key = 'ProjectStageStop';
                projectStageStopCreate.description = 'project stop stage';
                projectStageStopCreate.isFail = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    projectPipeline.id,
                    projectStageStopCreate,
                );
            } catch (e) {
                console.error(e);
            }


            /**
             *  Create Milestone Schema
             */
            const milestoneSchemaCreate = new SchemaCreateUpdateDto();
            milestoneSchemaCreate.name = SchemaModuleEntityTypes.MILESTONE.name;
            milestoneSchemaCreate.description = 'milestones for the project management module.';
            milestoneSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            milestoneSchemaCreate.entityName = SchemaModuleEntityTypeEnums.MILESTONE;
            milestoneSchemaCreate.recordNumber = 1;
            milestoneSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.MILESTONE.prefix;
            milestoneSchemaCreate.isSequential = true;
            milestoneSchemaCreate.isStatic = true;
            milestoneSchemaCreate.isHidden = false;
            milestoneSchemaCreate.hasTitle = true;
            milestoneSchemaCreate.isTitleUnique = true;
            milestoneSchemaCreate.position = 1;
            milestoneSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            milestoneSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            milestoneSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            milestoneSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            milestoneSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const milestoneSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                milestoneSchemaCreate,
                { upsert: true },
            );

            const milestoneColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                milestoneSchema.id,
                MILESTONE.columns,
            );
            initializeResults.push({
                milestoneColumns,
            });


            /**
             *  Create Milestone Template Schema
             */
            const milestoneTemplateSchemaCreate = new SchemaCreateUpdateDto();
            milestoneTemplateSchemaCreate.name = 'milestone template';
            milestoneTemplateSchemaCreate.description = 'milestone templates for the project management module.';
            milestoneTemplateSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            milestoneTemplateSchemaCreate.entityName = 'MilestoneTemplate';
            milestoneTemplateSchemaCreate.recordNumber = 1;
            milestoneTemplateSchemaCreate.recordNumberPrefix = 'MST';
            milestoneTemplateSchemaCreate.isSequential = true;
            milestoneTemplateSchemaCreate.isStatic = true;
            milestoneTemplateSchemaCreate.isHidden = false;
            milestoneTemplateSchemaCreate.hasTitle = true;
            milestoneTemplateSchemaCreate.isTitleUnique = true;
            milestoneTemplateSchemaCreate.position = 1;
            milestoneTemplateSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            milestoneTemplateSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            milestoneTemplateSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            milestoneTemplateSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            milestoneTemplateSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const milestoneTemplateSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                milestoneTemplateSchemaCreate,
                { upsert: true },
            );

            const milestoneTemplateColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                milestoneTemplateSchema.id,
                MILESTONE_TEMPLATE.columns,
            );
            initializeResults.push({
                milestoneTemplateColumns,
            });


            try {
                /**
                 * Create Milestone Pipeline
                 * Create Milestone Pipeline Stages
                 */
                const milestonePipelineCreate = new PipelineCreateUpdateDto();

                milestonePipelineCreate.name = 'Milestone';
                milestonePipelineCreate.key = 'MilestonePipeline';
                milestonePipelineCreate.description = 'pipeline for milestones';
                milestonePipelineCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
                milestonePipelineCreate.entityName = SchemaModuleEntityTypeEnums.MILESTONE;
                milestonePipelineCreate.isDefault = true;

                const milestonePipeline = await this.pipelineEntitysService.createByPrincipal(
                    principal,
                    milestonePipelineCreate,
                );

                const milestoneStageTodoCreate = new PipelineStageCreateUpdateDto();
                milestoneStageTodoCreate.name = 'Todo';
                milestoneStageTodoCreate.key = 'MilestoneStageTodo';
                milestoneStageTodoCreate.description = 'milestone todo stage';
                milestoneStageTodoCreate.isDefault = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    milestonePipeline.id,
                    milestoneStageTodoCreate,
                );

                const milestoneStageInProgressCreate = new PipelineStageCreateUpdateDto();
                milestoneStageInProgressCreate.name = 'In Progress';
                milestoneStageInProgressCreate.key = 'MilestoneStageInProgress';
                milestoneStageInProgressCreate.description = 'milestone in progress stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    milestonePipeline.id,
                    milestoneStageInProgressCreate,
                );

                const milestoneStageOnHoldCreate = new PipelineStageCreateUpdateDto();
                milestoneStageOnHoldCreate.name = 'On Hold';
                milestoneStageOnHoldCreate.key = 'MilestoneStageOnHold';
                milestoneStageOnHoldCreate.description = 'milestone on hold stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    milestonePipeline.id,
                    milestoneStageOnHoldCreate,
                );

                const milestoneStageDoneCreate = new PipelineStageCreateUpdateDto();
                milestoneStageDoneCreate.name = 'Done';
                milestoneStageDoneCreate.key = 'MilestoneStageDone';
                milestoneStageDoneCreate.description = 'milestone done stage';
                milestoneStageDoneCreate.isSuccess = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    milestonePipeline.id,
                    milestoneStageDoneCreate,
                );

                const milestoneStageStopCreate = new PipelineStageCreateUpdateDto();
                milestoneStageStopCreate.name = 'Stop';
                milestoneStageStopCreate.key = 'MilestoneStageStop';
                milestoneStageStopCreate.description = 'milestone stop stage';
                milestoneStageStopCreate.isFail = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    milestonePipeline.id,
                    milestoneStageStopCreate,
                );
            } catch (e) {
                console.error(e);
            }


            /**
             *  Create Task Schema
             */
            const taskSchemaCreate = new SchemaCreateUpdateDto();
            taskSchemaCreate.name = SchemaModuleEntityTypes.TASK.name;
            taskSchemaCreate.description = 'tasks for the project management module.';
            taskSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            taskSchemaCreate.entityName = SchemaModuleEntityTypeEnums.TASK;
            taskSchemaCreate.recordNumber = 1;
            taskSchemaCreate.recordNumberPrefix = SchemaModuleEntityTypes.TASK.prefix;
            taskSchemaCreate.isSequential = true;
            taskSchemaCreate.isStatic = true;
            taskSchemaCreate.isHidden = false;
            taskSchemaCreate.hasTitle = true;
            taskSchemaCreate.isTitleUnique = false;
            taskSchemaCreate.position = 1;
            taskSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            taskSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            taskSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            taskSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            taskSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const taskSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                taskSchemaCreate,
                { upsert: true },
            );

            const taskColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                taskSchema.id,
                TASK.columns,
            );
            initializeResults.push({
                taskColumns,
            });


            /**
             *  Create Task Template Schema
             */
            const taskTemplateSchemaCreate = new SchemaCreateUpdateDto();
            taskTemplateSchemaCreate.name = 'task template';
            taskTemplateSchemaCreate.description = 'task templates for the project management module.';
            taskTemplateSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            taskTemplateSchemaCreate.entityName = 'TaskTemplate';
            taskTemplateSchemaCreate.recordNumber = 1;
            taskTemplateSchemaCreate.recordNumberPrefix = 'TSKT';
            taskTemplateSchemaCreate.isSequential = true;
            taskTemplateSchemaCreate.isStatic = true;
            taskTemplateSchemaCreate.isHidden = false;
            taskTemplateSchemaCreate.hasTitle = true;
            taskTemplateSchemaCreate.isTitleUnique = true;
            taskTemplateSchemaCreate.position = 1;
            taskTemplateSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            taskTemplateSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            taskTemplateSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            taskTemplateSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            taskTemplateSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const taskTemplateSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                taskTemplateSchemaCreate,
                { upsert: true },
            );

            const taskTemplateColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                taskTemplateSchema.id,
                TASK_TEMPLATE.columns,
            );
            initializeResults.push({
                taskTemplateColumns,
            });


            try {
                /**
                 * Create Task Pipeline
                 * Create Task Pipeline Stages
                 */
                const taskPipelineCreate = new PipelineCreateUpdateDto();

                taskPipelineCreate.name = 'Task';
                taskPipelineCreate.key = 'TaskPipeline';
                taskPipelineCreate.description = 'pipeline for tasks';
                taskPipelineCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
                taskPipelineCreate.entityName = SchemaModuleEntityTypeEnums.TASK;
                taskPipelineCreate.isDefault = true;

                const taskPipeline = await this.pipelineEntitysService.createByPrincipal(
                    principal,
                    taskPipelineCreate,
                );

                const taskStageTodoCreate = new PipelineStageCreateUpdateDto();
                taskStageTodoCreate.name = 'Todo';
                taskStageTodoCreate.key = 'TaskStageTodo';
                taskStageTodoCreate.description = 'task todo stage';
                taskStageTodoCreate.isDefault = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    taskPipeline.id,
                    taskStageTodoCreate,
                );

                const taskStageInProgressCreate = new PipelineStageCreateUpdateDto();
                taskStageInProgressCreate.name = 'In Progress';
                taskStageInProgressCreate.key = 'TaskStageInProgress';
                taskStageInProgressCreate.description = 'task in progress stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    taskPipeline.id,
                    taskStageInProgressCreate,
                );

                const taskStageOnHoldCreate = new PipelineStageCreateUpdateDto();
                taskStageOnHoldCreate.name = 'On Hold';
                taskStageOnHoldCreate.key = 'TaskStageOnHold';
                taskStageOnHoldCreate.description = 'task on hold stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    taskPipeline.id,
                    taskStageOnHoldCreate,
                );

                const taskStageDoneCreate = new PipelineStageCreateUpdateDto();
                taskStageDoneCreate.name = 'Done';
                taskStageDoneCreate.key = 'TaskStageDone';
                taskStageDoneCreate.description = 'task done stage';
                taskStageDoneCreate.isSuccess = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    taskPipeline.id,
                    taskStageDoneCreate,
                );

                const taskStageStopCreate = new PipelineStageCreateUpdateDto();
                taskStageStopCreate.name = 'Stop';
                taskStageStopCreate.key = 'TaskStageStop';
                taskStageStopCreate.description = 'task stop stage';
                taskStageStopCreate.isFail = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    taskPipeline.id,
                    taskStageStopCreate,
                );
            } catch (e) {
                console.error(e);
            }


            /**
             *  Create Subtask Schema
             */
            const subtaskCreate = new SchemaCreateUpdateDto();
            subtaskCreate.name = SchemaModuleEntityTypes.SUBTASK.name;
            subtaskCreate.description = 'subtasks for the project management module.';
            subtaskCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            subtaskCreate.entityName = SchemaModuleEntityTypeEnums.SUBTASK;
            subtaskCreate.recordNumber = 1;
            subtaskCreate.recordNumberPrefix = SchemaModuleEntityTypes.SUBTASK.prefix;
            subtaskCreate.isSequential = true;
            subtaskCreate.isStatic = true;
            subtaskCreate.isHidden = false;
            subtaskCreate.hasTitle = true;
            subtaskCreate.isTitleUnique = false;
            subtaskCreate.position = 1;
            subtaskCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            subtaskCreate.getUrl = dbRecordUrlConstants.getUrl;
            subtaskCreate.postUrl = dbRecordUrlConstants.postUrl;
            subtaskCreate.putUrl = dbRecordUrlConstants.putUrl;
            subtaskCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const subtaskSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                subtaskCreate,
                { upsert: true },
            );

            const subtaskColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                subtaskSchema.id,
                SUBTASK.columns,
            );
            initializeResults.push({
                subtaskColumns,
            });


            /**
             *  Create Subtask Template Schema
             */
            const subtaskTemplateSchemaCreate = new SchemaCreateUpdateDto();
            subtaskTemplateSchemaCreate.name = 'subtask template';
            subtaskTemplateSchemaCreate.description = 'task templates for the project management module.';
            subtaskTemplateSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            subtaskTemplateSchemaCreate.entityName = 'SubtaskTemplate';
            subtaskTemplateSchemaCreate.recordNumber = 1;
            subtaskTemplateSchemaCreate.recordNumberPrefix = 'SUBT';
            subtaskTemplateSchemaCreate.isSequential = true;
            subtaskTemplateSchemaCreate.isStatic = true;
            subtaskTemplateSchemaCreate.isHidden = false;
            subtaskTemplateSchemaCreate.hasTitle = true;
            subtaskTemplateSchemaCreate.isTitleUnique = true;
            subtaskTemplateSchemaCreate.position = 1;
            subtaskTemplateSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            subtaskTemplateSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            subtaskTemplateSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            subtaskTemplateSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            subtaskTemplateSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const subtaskTemplateSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                subtaskTemplateSchemaCreate,
                { upsert: true },
            );

            const subtaskTemplateColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                subtaskTemplateSchema.id,
                SUBTASK_TEMPLATE.columns,
            );
            initializeResults.push({
                subtaskTemplateColumns,
            });


            try {

                /**
                 * Create Subtask Pipeline
                 * Create Subtask Pipeline Stages
                 */
                const subtaskPipelineCreate = new PipelineCreateUpdateDto();

                subtaskPipelineCreate.name = 'Subtask';
                subtaskPipelineCreate.key = 'SubtaskPipeline';
                subtaskPipelineCreate.description = 'pipeline for subtasks';
                subtaskPipelineCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
                subtaskPipelineCreate.entityName = SchemaModuleEntityTypeEnums.SUBTASK;
                subtaskPipelineCreate.isDefault = true;

                const subtaskPipeline = await this.pipelineEntitysService.createByPrincipal(
                    principal,
                    subtaskPipelineCreate,
                );

                const subtaskStageTodoCreate = new PipelineStageCreateUpdateDto();
                subtaskStageTodoCreate.name = 'Todo';
                subtaskStageTodoCreate.key = 'SubtaskStageTodo';
                subtaskStageTodoCreate.description = 'subtask todo stage';
                subtaskStageTodoCreate.isDefault = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    subtaskPipeline.id,
                    subtaskStageTodoCreate,
                );

                const subtaskStageInProgressCreate = new PipelineStageCreateUpdateDto();
                subtaskStageInProgressCreate.name = 'In Progress';
                subtaskStageInProgressCreate.key = 'SubtaskStageInProgress';
                subtaskStageInProgressCreate.description = 'subtask in progress stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    subtaskPipeline.id,
                    subtaskStageInProgressCreate,
                );

                const subtaskStageOnHoldCreate = new PipelineStageCreateUpdateDto();
                subtaskStageOnHoldCreate.name = 'On Hold';
                subtaskStageOnHoldCreate.key = 'SubtaskStageOnHold';
                subtaskStageOnHoldCreate.description = 'subtask on hold stage';

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    subtaskPipeline.id,
                    subtaskStageOnHoldCreate,
                );

                const subtaskStageDoneCreate = new PipelineStageCreateUpdateDto();
                subtaskStageDoneCreate.name = 'Done';
                subtaskStageDoneCreate.key = 'SubtaskStageDone';
                subtaskStageDoneCreate.description = 'subtask done stage';
                subtaskStageDoneCreate.isSuccess = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    subtaskPipeline.id,
                    subtaskStageDoneCreate,
                );

                const subtaskStageStopCreate = new PipelineStageCreateUpdateDto();
                subtaskStageStopCreate.name = 'Stop';
                subtaskStageStopCreate.key = 'SubtaskStageStop';
                subtaskStageStopCreate.description = 'subtask stop stage';
                subtaskStageStopCreate.isFail = true;

                await this.pipelineEntitysStagesService.updateOrCreateStage(
                    principal,
                    subtaskPipeline.id,
                    subtaskStageStopCreate,
                );
            } catch (e) {
                console.error(e);
            }

            /**
             *  Create Feature Schema
             */
            const featureCreate = new SchemaCreateUpdateDto();
            featureCreate.name = 'feature';
            featureCreate.description = 'features for the project management module.';
            featureCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            featureCreate.entityName = 'Feature';
            featureCreate.recordNumber = 1;
            featureCreate.recordNumberPrefix = 'FE';
            featureCreate.isSequential = true;
            featureCreate.isStatic = true;
            featureCreate.isHidden = false;
            featureCreate.hasTitle = true;
            featureCreate.isTitleUnique = true;
            featureCreate.position = 1;
            featureCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            featureCreate.getUrl = dbRecordUrlConstants.getUrl;
            featureCreate.postUrl = dbRecordUrlConstants.postUrl;
            featureCreate.putUrl = dbRecordUrlConstants.putUrl;
            featureCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const featureSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                featureCreate,
                { upsert: true },
            );

            const featureColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                featureSchema.id,
                FEATURE.columns,
            );
            initializeResults.push({
                featureColumns,
            });

            /**
             *  Create Feature Template Schema
             */
            const featureTemplateSchemaCreate = new SchemaCreateUpdateDto();
            featureTemplateSchemaCreate.name = 'feature template';
            featureTemplateSchemaCreate.description = 'features templates for the project management module.';
            featureTemplateSchemaCreate.moduleName = SchemaModuleTypeEnums.PROJECT_MODULE;
            featureTemplateSchemaCreate.entityName = 'FeatureTemplate';
            featureTemplateSchemaCreate.recordNumber = 1;
            featureTemplateSchemaCreate.recordNumberPrefix = 'FET';
            featureTemplateSchemaCreate.isSequential = true;
            featureTemplateSchemaCreate.isStatic = true;
            featureTemplateSchemaCreate.isHidden = false;
            featureTemplateSchemaCreate.hasTitle = true;
            featureTemplateSchemaCreate.isTitleUnique = true;
            featureTemplateSchemaCreate.position = 1;
            featureTemplateSchemaCreate.searchUrl = dbRecordUrlConstants.searchUrl;
            featureTemplateSchemaCreate.getUrl = dbRecordUrlConstants.getUrl;
            featureTemplateSchemaCreate.postUrl = dbRecordUrlConstants.postUrl;
            featureTemplateSchemaCreate.putUrl = dbRecordUrlConstants.putUrl;
            featureTemplateSchemaCreate.deleteUrl = dbRecordUrlConstants.deleteUrl;

            const featureTemplateSchema = await this.schemasService.createSchemaByPrincipal(
                principal,
                featureTemplateSchemaCreate,
                { upsert: true },
            );

            const featureTemplateSchemaColumns = await this.schemasColumnsService.updateOrCreateByPrincipal(
                principal,
                featureTemplateSchema.id,
                FEATURE_TEMPLATE.columns,
            );
            initializeResults.push({
                featureTemplateSchemaColumns,
            });


            //
            // Create an association Program -> Project
            //
            const programProjectAssociation = new SchemaAssociationCreateUpdateDto();
            programProjectAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            programProjectAssociation.childSchemaId = projectSchema.id;
            programProjectAssociation.parentActions = 'CREATE_ONLY';
            programProjectAssociation.childActions = 'READ_ONLY';
            programProjectAssociation.cascadeDeleteChildRecord = true;
            programProjectAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            programProjectAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            programProjectAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            programProjectAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    programSchema.id,
                    programProjectAssociation,
                );
                initializeResults.push({
                    programProjectAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            console.log('programProjectAssociation', programProjectAssociation);

            //
            // Create an association Project -> Milestone
            //
            const projectMilestoneAssociation = new SchemaAssociationCreateUpdateDto();
            projectMilestoneAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            projectMilestoneAssociation.childSchemaId = milestoneSchema.id;
            projectMilestoneAssociation.parentActions = 'CREATE_ONLY';
            projectMilestoneAssociation.childActions = 'READ_ONLY';
            projectMilestoneAssociation.hasColumnMappings = false;
            projectMilestoneAssociation.cascadeDeleteChildRecord = true;
            projectMilestoneAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            projectMilestoneAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            projectMilestoneAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            projectMilestoneAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    projectSchema.id,
                    projectMilestoneAssociation,
                );
                initializeResults.push({
                    programProjectAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }
            console.log('projectMilestoneAssociation', projectMilestoneAssociation);

            //
            // Create an association Milestone -> Task
            //
            const milestoneTaskAssociation = new SchemaAssociationCreateUpdateDto();
            milestoneTaskAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            milestoneTaskAssociation.childSchemaId = taskSchema.id;
            milestoneTaskAssociation.parentActions = 'CREATE_ONLY';
            milestoneTaskAssociation.childActions = 'READ_ONLY';
            milestoneTaskAssociation.hasColumnMappings = false;
            milestoneTaskAssociation.cascadeDeleteChildRecord = true;
            milestoneTaskAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            milestoneTaskAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            milestoneTaskAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            milestoneTaskAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    milestoneSchema.id,
                    milestoneTaskAssociation,
                );
                initializeResults.push({
                    projectTaskAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            console.log('milestoneTaskAssociation', milestoneTaskAssociation);

            //
            // Create an association Milestone -> Milestone
            //
            const milestoneMilestoneAssociation = new SchemaAssociationCreateUpdateDto();
            milestoneMilestoneAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            milestoneMilestoneAssociation.childSchemaId = milestoneSchema.id;
            milestoneMilestoneAssociation.parentActions = 'CREATE_ONLY';
            milestoneMilestoneAssociation.childActions = 'CREATE_ONLY';
            milestoneMilestoneAssociation.hasColumnMappings = false;
            milestoneMilestoneAssociation.cascadeDeleteChildRecord = false;
            milestoneMilestoneAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            milestoneMilestoneAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            milestoneMilestoneAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            milestoneMilestoneAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    milestoneSchema.id,
                    milestoneMilestoneAssociation,
                );
                initializeResults.push({
                    milestoneMilestoneAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }
            console.log('milestoneMilestoneAssociation', milestoneMilestoneAssociation);
            //
            // Create an association Task -> Task
            //
            const taskTaskAssociation = new SchemaAssociationCreateUpdateDto();
            taskTaskAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskTaskAssociation.childSchemaId = taskSchema.id;
            taskTaskAssociation.parentActions = 'LOOKUP_AND_CREATE';
            taskTaskAssociation.childActions = 'LOOKUP_AND_CREATE';
            taskTaskAssociation.hasColumnMappings = false;
            taskTaskAssociation.cascadeDeleteChildRecord = false;
            taskTaskAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskTaskAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskTaskAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskTaskAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskSchema.id,
                    taskTaskAssociation,
                );
                initializeResults.push({
                    taskTaskAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }


            //
            // Create an association Task -> Subtask
            //
            const taskSubtaskAssociation = new SchemaAssociationCreateUpdateDto();
            taskSubtaskAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskSubtaskAssociation.childSchemaId = subtaskSchema.id;
            taskSubtaskAssociation.parentActions = 'CREATE_ONLY';
            taskSubtaskAssociation.childActions = 'READ_ONLY';
            taskSubtaskAssociation.hasColumnMappings = false;
            taskSubtaskAssociation.cascadeDeleteChildRecord = true;
            taskSubtaskAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskSubtaskAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskSubtaskAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskSubtaskAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskSchema.id,
                    taskSubtaskAssociation,
                );
                initializeResults.push({
                    taskSubtaskAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Task -> Feature
            //
            const taskFeatureAssociation = new SchemaAssociationCreateUpdateDto();
            taskFeatureAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskFeatureAssociation.childSchemaId = featureSchema.id;
            taskFeatureAssociation.parentActions = 'LOOKUP_ONLY';
            taskFeatureAssociation.childActions = 'READ_ONLY';
            taskFeatureAssociation.hasColumnMappings = true;
            taskFeatureAssociation.cascadeDeleteChildRecord = true;
            taskFeatureAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskFeatureAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskFeatureAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskFeatureAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskSchema.id,
                    taskFeatureAssociation,
                );
                initializeResults.push({
                    taskFeatureAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Task -> Product
            //
            const taskProductAssociation = new SchemaAssociationCreateUpdateDto();
            taskProductAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskProductAssociation.childSchemaId = productSchema.id;
            taskProductAssociation.parentActions = 'LOOKUP_ONLY';
            taskProductAssociation.childActions = 'READ_ONLY';
            taskProductAssociation.hasColumnMappings = true;
            taskProductAssociation.cascadeDeleteChildRecord = false;
            taskProductAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskProductAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskProductAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskProductAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskSchema.id,
                    taskProductAssociation,
                );
                initializeResults.push({
                    taskProductAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }


            //
            // Create an association MilestoneTemplate -> TaskTemplate
            //
            const milestoneTemplateTaskTemplateAssociation = new SchemaAssociationCreateUpdateDto();
            milestoneTemplateTaskTemplateAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            milestoneTemplateTaskTemplateAssociation.childSchemaId = taskTemplateSchema.id;
            milestoneTemplateTaskTemplateAssociation.parentActions = 'LOOKUP_AND_CREATE';
            milestoneTemplateTaskTemplateAssociation.childActions = 'LOOKUP_ONLY';
            milestoneTemplateTaskTemplateAssociation.hasColumnMappings = false;
            milestoneTemplateTaskTemplateAssociation.cascadeDeleteChildRecord = false;
            milestoneTemplateTaskTemplateAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            milestoneTemplateTaskTemplateAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            milestoneTemplateTaskTemplateAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            milestoneTemplateTaskTemplateAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    milestoneTemplateSchema.id,
                    milestoneTemplateTaskTemplateAssociation,
                );
                initializeResults.push({
                    milestoneTemplateTaskTemplateAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }


            //
            // Create an association TaskTemplate -> FeatureTemplate
            //
            const taskTemplateFeatureTemplateAssociation = new SchemaAssociationCreateUpdateDto();
            taskTemplateFeatureTemplateAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskTemplateFeatureTemplateAssociation.childSchemaId = featureTemplateSchema.id;
            taskTemplateFeatureTemplateAssociation.parentActions = 'LOOKUP_ONLY';
            taskTemplateFeatureTemplateAssociation.childActions = 'READ_ONLY';
            taskTemplateFeatureTemplateAssociation.hasColumnMappings = false;
            taskTemplateFeatureTemplateAssociation.cascadeDeleteChildRecord = false;
            taskTemplateFeatureTemplateAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskTemplateFeatureTemplateAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskTemplateFeatureTemplateAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskTemplateFeatureTemplateAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskTemplateSchema.id,
                    taskTemplateFeatureTemplateAssociation,
                );
                initializeResults.push({
                    taskTemplateFeatureTemplateAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association TaskTemplate -> Subtask
            //
            const taskTemplateSubTaskTemplateAssociation = new SchemaAssociationCreateUpdateDto();
            taskTemplateSubTaskTemplateAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskTemplateSubTaskTemplateAssociation.childSchemaId = subtaskTemplateSchema.id;
            taskTemplateSubTaskTemplateAssociation.parentActions = 'CREATE_ONLY';
            taskTemplateSubTaskTemplateAssociation.childActions = 'READ_ONLY';
            taskTemplateSubTaskTemplateAssociation.hasColumnMappings = false;
            taskTemplateSubTaskTemplateAssociation.cascadeDeleteChildRecord = true;
            taskTemplateSubTaskTemplateAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskTemplateSubTaskTemplateAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskTemplateSubTaskTemplateAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskTemplateSubTaskTemplateAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskTemplateSchema.id,
                    taskTemplateSubTaskTemplateAssociation,
                );
                initializeResults.push({
                    taskTemplateSubTaskTemplateAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association FeatureTemplate -> Product
            //
            const featureTemplateProductAssociation = new SchemaAssociationCreateUpdateDto();
            featureTemplateProductAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            featureTemplateProductAssociation.childSchemaId = productSchema.id;
            featureTemplateProductAssociation.parentActions = 'LOOKUP_ONLY';
            featureTemplateProductAssociation.childActions = 'READ_ONLY';
            featureTemplateProductAssociation.hasColumnMappings = false;
            featureTemplateProductAssociation.cascadeDeleteChildRecord = false;
            featureTemplateProductAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            featureTemplateProductAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            featureTemplateProductAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            featureTemplateProductAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    featureTemplateSchema.id,
                    featureTemplateProductAssociation,
                );
                initializeResults.push({
                    featureTemplateProductAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }


            //
            // Create an association Program -> Note
            //
            const programNoteAssociation = new SchemaAssociationCreateUpdateDto();
            programNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            programNoteAssociation.childSchemaId = noteSchema.id;
            programNoteAssociation.parentActions = 'CREATE_ONLY';
            programNoteAssociation.childActions = 'READ_ONLY';
            programNoteAssociation.hasColumnMappings = false;
            programNoteAssociation.cascadeDeleteChildRecord = true;
            programNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            programNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            programNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            programNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    programSchema.id,
                    programNoteAssociation,
                );
                initializeResults.push({
                    programNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Project -> Note
            //
            const projectNoteAssociation = new SchemaAssociationCreateUpdateDto();
            projectNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            projectNoteAssociation.childSchemaId = noteSchema.id;
            projectNoteAssociation.parentActions = 'CREATE_ONLY';
            projectNoteAssociation.childActions = 'READ_ONLY';
            projectNoteAssociation.hasColumnMappings = false;
            projectNoteAssociation.cascadeDeleteChildRecord = true;
            projectNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            projectNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            projectNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            projectNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    projectSchema.id,
                    projectNoteAssociation,
                );
                initializeResults.push({
                    projectNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Feature -> Note
            //
            const featureNoteAssociation = new SchemaAssociationCreateUpdateDto();
            featureNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            featureNoteAssociation.childSchemaId = noteSchema.id;
            featureNoteAssociation.parentActions = 'CREATE_ONLY';
            featureNoteAssociation.childActions = 'READ_ONLY';
            featureNoteAssociation.hasColumnMappings = false;
            featureNoteAssociation.cascadeDeleteChildRecord = true;
            featureNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            featureNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            featureNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            featureNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    featureSchema.id,
                    featureNoteAssociation,
                );
                initializeResults.push({
                    featureNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Milestone -> Note
            //
            const milestoneNoteAssociation = new SchemaAssociationCreateUpdateDto();
            milestoneNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            milestoneNoteAssociation.childSchemaId = noteSchema.id;
            milestoneNoteAssociation.parentActions = 'CREATE_ONLY';
            milestoneNoteAssociation.childActions = 'READ_ONLY';
            milestoneNoteAssociation.hasColumnMappings = false;
            milestoneNoteAssociation.cascadeDeleteChildRecord = true;
            milestoneNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            milestoneNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            milestoneNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            milestoneNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    milestoneSchema.id,
                    milestoneNoteAssociation,
                );
                initializeResults.push({
                    milestoneNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Task -> Note
            //
            const taskNoteAssociation = new SchemaAssociationCreateUpdateDto();
            taskNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskNoteAssociation.childSchemaId = noteSchema.id;
            taskNoteAssociation.parentActions = 'CREATE_ONLY';
            taskNoteAssociation.childActions = 'READ_ONLY';
            taskNoteAssociation.hasColumnMappings = false;
            taskNoteAssociation.cascadeDeleteChildRecord = true;
            taskNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskSchema.id,
                    taskNoteAssociation,
                );
                initializeResults.push({
                    taskNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Subtask -> Note
            //
            const subtaskNoteAssociation = new SchemaAssociationCreateUpdateDto();
            subtaskNoteAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            subtaskNoteAssociation.childSchemaId = noteSchema.id;
            subtaskNoteAssociation.parentActions = 'CREATE_ONLY';
            subtaskNoteAssociation.childActions = 'READ_ONLY';
            subtaskNoteAssociation.hasColumnMappings = false;
            subtaskNoteAssociation.cascadeDeleteChildRecord = true;
            subtaskNoteAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            subtaskNoteAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            subtaskNoteAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            subtaskNoteAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    subtaskSchema.id,
                    subtaskNoteAssociation,
                );
                initializeResults.push({
                    subtaskNoteAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Project -> File
            //
            const projectFileAssociation = new SchemaAssociationCreateUpdateDto();
            projectFileAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            projectFileAssociation.childSchemaId = fileSchema.id;
            projectFileAssociation.parentActions = 'CREATE_ONLY';
            projectFileAssociation.childActions = 'READ_ONLY';
            projectFileAssociation.cascadeDeleteChildRecord = true;
            projectFileAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            projectFileAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            projectFileAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            projectFileAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    projectSchema.id,
                    projectFileAssociation,
                );
                initializeResults.push({
                    projectFileAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Milestone -> File
            //
            const milestoneFileAssociation = new SchemaAssociationCreateUpdateDto();
            milestoneFileAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            milestoneFileAssociation.childSchemaId = fileSchema.id;
            milestoneFileAssociation.parentActions = 'CREATE_ONLY';
            milestoneFileAssociation.childActions = 'READ_ONLY';
            milestoneFileAssociation.cascadeDeleteChildRecord = true;
            milestoneFileAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            milestoneFileAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            milestoneFileAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            milestoneFileAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    milestoneSchema.id,
                    milestoneFileAssociation,
                );
                initializeResults.push({
                    milestoneFileAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }

            //
            // Create an association Task -> File
            //
            const taskFileAssociation = new SchemaAssociationCreateUpdateDto();
            taskFileAssociation.type = SchemaAssociationCardinalityTypes.ONE_TO_MANY;
            taskFileAssociation.childSchemaId = fileSchema.id;
            taskFileAssociation.parentActions = 'CREATE_ONLY';
            taskFileAssociation.childActions = 'READ_ONLY';
            taskFileAssociation.cascadeDeleteChildRecord = true;
            taskFileAssociation.getUrl = dbRecordAssociationUrlConstants.getUrl;
            taskFileAssociation.postUrl = dbRecordAssociationUrlConstants.postUrl;
            taskFileAssociation.putUrl = dbRecordAssociationUrlConstants.putUrl;
            taskFileAssociation.deleteUrl = dbRecordAssociationUrlConstants.deleteUrl;

            try {
                await this.schemasAssociationsService.createSchemaAssociationByPrincipal(
                    principal,
                    taskSchema.id,
                    taskFileAssociation,
                );
                initializeResults.push({
                    taskFileAssociation: 1,
                });
            } catch (e) {
                console.error(e);
            }


            return initializeResults;
        } catch (e) {
            console.error(e);
        }
    }
}
