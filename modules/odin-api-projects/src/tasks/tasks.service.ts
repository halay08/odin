import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { DbService } from '@d19n/schema-manager/dist/db/db.service';
import { DbRecordsAssociationsService } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.service';
import { DbRecordsService } from '@d19n/schema-manager/dist/db/records/db.records.service';
import { PipelineEntitysStagesService } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.service';
import { SchemasService } from '@d19n/schema-manager/dist/schemas/schemas.service';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { TaskProductCalculations } from '../helpers/TaskProductCalculations';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { TASK, SUBTASK, PRODUCT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class TasksService {

    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private pipelineStagesService: PipelineEntitysStagesService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;
    private amqpConnection: AmqpConnection;

    constructor(
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
        schemasService: SchemasService,
        dbRecordsService: DbRecordsService,
        pipelineStagesService: PipelineEntitysStagesService,
        pipelineEntitysStagesService: PipelineEntitysStagesService,
        amqpConnection: AmqpConnection,
    ) {
        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineStagesService = pipelineStagesService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.amqpConnection = amqpConnection;
    }


    /**
     *
     * @param principal
     * @param recordId
     * @param requestBody
     */
    public async validateAgainstRules(
        principal: OrganizationUserEntity,
        taskId: any,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // if stage is being changed, check if all the child records are completed:
            // formula (complete + failed) = total
            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [],
            );

            if(body.stageId) {

                const selectedStage = await this.pipelineStagesService.getPipelineAndStagesByStageId(
                    principal.organization,
                    body.stageId,
                );

                if(selectedStage.isSuccess) {
                    const totalCount = getProperty(task, 'SubtaskTotalCount');
                    const totalComplete = getProperty(task, 'SubtaskCompleteCount');
                    const totalFailed = getProperty(task, 'SubtaskFailCount');

                    if(Number(totalCount) === (Number(totalFailed) + Number(totalComplete))) {
                        return true;
                    } else {
                        throw new ExceptionType(
                            409,
                            'This task has subtasks in progress, complete all subtasks before moving to Done.',
                        );
                    }
                }
            }

            return {};
        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @paramsubtaskId
     * @param body
     */
    public async handleTaskSubtaskCreated(
        principal: OrganizationUserEntity,
        subtaskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const subTask = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                subtaskId,
                [ TASK ],
            );

            const relatedRecords = subTask[TASK].dbRecords;

            if(relatedRecords) {
                return await this.aggregateTaskSubtaskValues(principal, relatedRecords.map(elem => elem.id));
            }

            return;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @paramsubtaskId
     * @param body
     */
    public async handleTaskSubtaskStageUpdated(
        principal: OrganizationUserEntity,
        subtaskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const subtask = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                subtaskId,
                [ TASK ],
            );

            const relatedRecords = subtask[TASK].dbRecords;

            if(relatedRecords) {
                return await this.setNextStage(principal, relatedRecords.map(elem => elem.id));
            }

            return;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param id
     * @param body
     */
    public async handleTaskSubtaskUpdated(
        principal: OrganizationUserEntity,
        subtaskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const subtask = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                subtaskId,
                [ TASK ],
            );

            const relatedRecords = subtask[TASK].dbRecords;
            if(relatedRecords) {
                return await this.aggregateTaskSubtaskValues(principal, relatedRecords.map(elem => elem.id));
            }

            return;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param id
     * @param body
     */
    public async handleTaskSubtaskDeleted(
        principal: OrganizationUserEntity,
        subtaskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {

            const taskSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PROJECT_MODULE}:${TASK}`,
            );

            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: subtaskId,
                    parentSchemaId: taskSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            return await this.aggregateTaskSubtaskValues(principal, parentRecordIds);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param id
     * @param body
     */
    public async handleTaskFeatureUpdated(
        principal: OrganizationUserEntity,
        featureId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                featureId,
                [ TASK ],
            );

            const relatedRecords = feature[TASK].dbRecords;

            if(relatedRecords) {
                for(const record of relatedRecords) {
                    return await this.computeTaskProductTotalsAndSave(principal, record.id);
                }
            }

            return;

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param principal
     * @param id
     * @param body
     */
    public async handleTaskFeatureDeleted(
        principal: OrganizationUserEntity,
        featureId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {

            const taskSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PROJECT_MODULE}:${TASK}`,
            );

            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: featureId,
                    parentSchemaId: taskSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            if(parentRecordIds) {
                for(const parentId of parentRecordIds) {
                    return await this.computeTaskProductTotalsAndSave(principal, parentId);
                }
            }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param taskIds
     * @private
     */
    private async aggregateTaskSubtaskValues(
        principal: OrganizationUserEntity,
        taskIds: string[],
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {
            const updated: IDbRecordCreateUpdateRes[] = [];

            for(const taskId of taskIds) {
                // fetch the tasks tasks
                const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    taskId,
                    [ SUBTASK ],
                );

                const subTasks = task[SUBTASK].dbRecords;

                // get the subtask cost
                let subTaskCost = this.aggregateSubTaskRecordCost(subTasks);
                // get the task cost from products
                let { TotalCost } = await this.computeTaskProductTotals(principal, taskId);

                const { TotalCount, CompleteCount, FailCount } = this.aggregateRecordStageCounts(
                    subTasks,
                    SUBTASK,
                );

                const update = {
                    entity: `${PROJECT_MODULE}:${TASK}`,
                    properties: {
                        Cost: Number(TotalCost) + Number(subTaskCost.TotalCost),
                        [`${SUBTASK}TotalCount`]: TotalCount,
                        [`${SUBTASK}CompleteCount`]: CompleteCount,
                        [`${SUBTASK}FailCount`]: FailCount,
                    },
                }
                // Update the task properties
                updated.push(await this.dbService.updateDbRecordsByPrincipalAndId(principal, task.id, update));

                return updated;
            }

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *
     * @param records
     * @private
     */
    private aggregateSubTaskRecordCost(records: DbRecordEntityTransform[]) {
        let TotalCost = 0;
        if(records) {
            for(const record of records) {
                if(!record.stage.isFail) {
                    const recordCost = getProperty(record, 'Cost');
                    const recordCostOverride = getProperty(record, 'CostOverride');

                    if(recordCostOverride) {
                        TotalCost += Number(recordCostOverride);
                    } else if(recordCost) {
                        TotalCost += Number(recordCost);
                    }
                }
            }
        }
        return { TotalCost: Number(Number(TotalCost).toPrecision(10)).toFixed(2) };
    }

    /**
     *  This will adjust discount periods / free periods and taxes for an order.
     * @param principal
     * @param orderId
     * @param headers
     */
    public async computeTaskProductTotals(
        principal: OrganizationUserEntity,
        taskId: string,
    ): Promise<{ TotalCost: number }> {
        try {
            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [ PRODUCT ],
            );

            // Get the total cost of all features related to the task
            const totalCostQueryRes = await this.amqpConnection.request<any>({
                exchange: 'ConnectModule',
                routingKey: `ConnectModule.RpcRunSqlQuery`,
                payload: {
                    principal,
                    query: {
                        name: 'OdinAggregateChildRecordValueOfNumberProperty',
                        parentEntityName: 'Task',
                        childEntityName: 'Feature',
                        aggColumnName: 'Cost',
                        parentRecordId: task.id,
                    },
                },
                timeout: 20000,
            });

            const totalCostQuery = totalCostQueryRes['data'];
            console.log('totalCostQuery', totalCostQuery);

            let totalFeatureCost = 0;
            if(totalCostQuery && totalCostQuery[0]) {
                totalFeatureCost = totalCostQuery[0]['total'];
            }

            console.log('totalFeatureCost', totalFeatureCost);

            const taskProducts = task[PRODUCT].dbRecords;

            console.log('isNaN(totalFeatureCost)', isNaN(totalFeatureCost));

            let TotalCost = 0;
            if(!taskProducts && !isNaN(totalFeatureCost)) {

                TotalCost = totalFeatureCost;

            } else if(taskProducts && !isNaN(totalFeatureCost)) {

                TotalCost = Number(TaskProductCalculations.computeTotalValue(taskProducts)) + Number(totalFeatureCost);
            } else if(taskProducts) {

                TotalCost = TaskProductCalculations.computeTotalValue(taskProducts);
            }

            return { TotalCost: Number(Number(Number(TotalCost).toPrecision(10)).toFixed(2)) };

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     *  This will adjust discount periods / free periods and taxes for an order.
     * @param principal
     * @param orderId
     * @param headers
     */
    public async computeTaskProductTotalsAndSave(
        principal: OrganizationUserEntity,
        taskId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [ SUBTASK ],
            );

            const subTasks = task[SUBTASK].dbRecords;

            // get the subtask cost
            let subTaskCost = this.aggregateSubTaskRecordCost(subTasks);
            // get the task cost from products
            let { TotalCost } = await this.computeTaskProductTotals(principal, taskId);

            const update = {
                entity: `${PROJECT_MODULE}:${TASK}`,
                properties: {
                    Cost: Number(Number(TotalCost) + Number(subTaskCost.TotalCost)).toFixed(2),
                },
            }
            // Update the task properties
            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, task.id, update);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param records
     * @param entityName
     * @private
     */
    private aggregateRecordStageCounts(records, entityName) {
        let totalTodo = 0;
        let totalInProgress = 0;
        let totalOnHold = 0;
        let totalComplete = 0;
        let totalStopped = 0;

        if(records) {
            for(const record of records) {
                if(record.stage.key === `${entityName}StageTodo`) {
                    totalTodo += 1;
                }
                if(record.stage.key === `${entityName}StageInProgress`) {
                    totalInProgress += 1;
                }
                if(record.stage.key === `${entityName}StageOnHold`) {
                    totalOnHold += 1;
                }
                if(record.stage.key === `${entityName}StageDone`) {
                    totalComplete += 1;
                }
                if(record.stage.key === `${entityName}StageStop`) {
                    totalStopped += 1;
                }
            }
        }

        const TotalCount = totalTodo + totalInProgress + totalOnHold + totalComplete + totalStopped;
        const CompleteCount = totalComplete;
        const FailCount = totalStopped;
        const TotalInProgress = totalInProgress;
        const TotalOnHold = totalOnHold;
        const TotalStopped = totalStopped;

        return { TotalCount, CompleteCount, FailCount, TotalInProgress, TotalOnHold, TotalStopped };
    }

    /**
     *
     * @param principal
     * @param recordIds
     * @private
     */
    private async setNextStage(principal: OrganizationUserEntity, taskIds: any[]) {

        for(const taskId of taskIds) {

            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [ SUBTASK ],
            );

            const milestones = task[SUBTASK].dbRecords;

            const { SomeInProgress, AllOnHold, AllComplete, AllStopped } = this.getOverallStatusOfAggregateChildRecords(
                milestones);

            if(SomeInProgress) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${TASK}StageInProgress`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${TASK}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, task.id, updateDto);
            } else if(AllOnHold) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${TASK}StageOnHold`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${TASK}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, task.id, updateDto);
            } else if(AllComplete) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${TASK}StageDone`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${TASK}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, task.id, updateDto);
            } else if(AllStopped) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${TASK}StageStop`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${TASK}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, task.id, updateDto);
            }

        }
    }

    /**
     *
     * @param projects
     * @private
     */
    private getOverallStatusOfAggregateChildRecords(milestones: DbRecordEntityTransform[]) {

        let SomeInProgress = false;
        let AllComplete = false;
        let AllStopped = false;
        let AllOnHold = false;

        const {
            TotalCount,
            CompleteCount,
            FailCount,
            TotalInProgress,
            TotalOnHold,
            TotalStopped,
        } = this.aggregateRecordStageCounts(
            milestones,
            SUBTASK,
        );

        if(Number(TotalCount) === (Number(CompleteCount) + Number(FailCount))) {
            AllComplete = true;
        } else if(TotalInProgress > 0) {
            SomeInProgress = true;
        } else if(TotalOnHold === TotalCount) {
            AllOnHold = true;
        } else if(TotalStopped === TotalCount) {
            AllStopped = true;
        }

        return { SomeInProgress, AllOnHold, AllComplete, AllStopped };
    }
}
