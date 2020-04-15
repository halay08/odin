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
import { GisFtthPolygonsService } from 'src/gis/ftth/polygon/gis.ftth.polygons.service';
import { GisOsService } from 'src/gis/os/gis.os.service';
import { Address } from 'uk-clear-addressing';
import { GisFtthClosuresService } from '../gis/ftth/closures/gis.ftth.closures.service';
import { FtthPolygon } from '../gis/ftth/polygon/interfaces/ftth-polygon.interface';
import { MilestoneBuildPack } from './types/milestone.buildpack';
import moment = require('moment');


const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { MILESTONE, TASK } = SchemaModuleEntityTypeEnums;


@Injectable()
export class MilestonesService {

    constructor(
        private dbRecordsAssociationsService: DbRecordsAssociationsService,
        private dbService: DbService,
        private schemasService: SchemasService,
        private dbRecordsService: DbRecordsService,
        private pipelineStagesService: PipelineEntitysStagesService,
        private pipelineEntitysStagesService: PipelineEntitysStagesService,
        private amqpConnection: AmqpConnection,
        private gisOsService: GisOsService,
        private gisFtthClosuresService: GisFtthClosuresService,
        private gisFtthPolygonsService: GisFtthPolygonsService,
    ) {

        this.schemasService = schemasService;
        this.dbService = dbService;
        this.dbRecordsService = dbRecordsService;
        this.dbRecordsAssociationsService = dbRecordsAssociationsService;
        this.pipelineStagesService = pipelineStagesService;
        this.pipelineEntitysStagesService = pipelineEntitysStagesService;
        this.amqpConnection = amqpConnection;
        this.gisOsService = gisOsService;
        this.gisFtthClosuresService = gisFtthClosuresService;
        this.gisFtthPolygonsService = gisFtthPolygonsService;

    }

    /**
     *
     * @param principal
     * @param recordId
     * @param requestBody
     */
    public async validateAgainstRules(
        principal: OrganizationUserEntity,
        milestoneId: any,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // if stage is being changed, check if all the child records are completed:
            // formula (complete + failed) = total
            const milestone = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                milestoneId,
                [],
            );

            if(body.stageId) {

                const selectedStage = await this.pipelineStagesService.getPipelineAndStagesByStageId(
                    principal.organization,
                    body.stageId,
                );

                if(selectedStage.isSuccess) {
                    const totalCount = getProperty(milestone, 'TaskTotalCount');
                    const totalComplete = getProperty(milestone, 'TaskCompleteCount');
                    const totalFailed = getProperty(milestone, 'TaskFailCount');

                    if(Number(totalCount) === (Number(totalFailed) + Number(totalComplete))) {
                        return true;
                    } else {
                        throw new ExceptionType(
                            409,
                            'This milestone has tasks in progress, complete all tasks before moving to Done.',
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
     * @paramtaskId
     * @param body
     */
    public async handleMilestoneTaskCreated(
        principal: OrganizationUserEntity,
        taskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [ MILESTONE ],
            );

            const relatedRecords = task[MILESTONE].dbRecords;
            if(relatedRecords) {
                return await this.aggregateMilestoneTaskValues(principal, relatedRecords.map(elem => elem.id));
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
     * @paramtaskId
     * @param body
     */
    public async handleMilestoneTaskStageUpdated(
        principal: OrganizationUserEntity,
        taskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [ MILESTONE ],
            );

            const relatedRecords = task[MILESTONE].dbRecords;

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
    public async handleMilestoneTaskUpdated(
        principal: OrganizationUserEntity,
        taskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const task = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                taskId,
                [ MILESTONE ],
            );

            const relatedRecords = task[MILESTONE].dbRecords;

            if(relatedRecords) {
                console.log('update task milestones', relatedRecords);
                return await this.aggregateMilestoneTaskValues(principal, relatedRecords.map(elem => elem.id));
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
    public async handleMilestoneTaskDeleted(
        principal: OrganizationUserEntity,
        taskId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {

            const milestoneSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PROJECT_MODULE}:${MILESTONE}`,
            );

            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: taskId,
                    parentSchemaId: milestoneSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            return await this.aggregateMilestoneTaskValues(principal, parentRecordIds);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }

    /**
     * @param principal
     * @param orderId
     * @param headers
     */
    public async computeMilestoneTasksTotalsAndSave(
        principal: OrganizationUserEntity,
        workOrderId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const workOrder = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                workOrderId,
                [ TASK ],
            );
            console.log('computeMilestoneTasksTotalsAndSave', workOrder);
            const tasks = workOrder[TASK].dbRecords;

            // get the task cost from products
            let { TotalCost } = await this.aggregateRecordCost(tasks);
            console.log('TotalCost', TotalCost);

            const update = {
                entity: `${PROJECT_MODULE}:${MILESTONE}`,
                properties: {
                    Cost: Number(TotalCost),
                },
            }
            // Update the milestone properties
            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, workOrder.id, update);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param milestoneIds
     * @private
     */
    private async aggregateMilestoneTaskValues(
        principal: OrganizationUserEntity,
        milestoneIds: string[],
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {
            const updated: IDbRecordCreateUpdateRes[] = [];

            for(const milestoneId of milestoneIds) {

                // Get the total cost of all milestones related to the project
                const totalCostQueryRes = await this.amqpConnection.request<any>({
                    exchange: 'ConnectModule',
                    routingKey: `ConnectModule.RpcRunSqlQuery`,
                    payload: {
                        principal,
                        query: {
                            name: 'OdinAggregateChildRecordValueOfNumberProperty',
                            parentEntityName: 'Milestone',
                            childEntityName: 'Task',
                            aggColumnName: 'Cost',
                            parentRecordId: milestoneId,
                        },
                    },
                    timeout: 20000,
                });

                const totalCostQuery = totalCostQueryRes['data'];

                let totalFeatureCost = 0;
                if(totalCostQuery && totalCostQuery[0]) {
                    totalFeatureCost = totalCostQuery[0]['total'];
                }

                let TotalCost = 0;
                if(!isNaN(totalFeatureCost)) {
                    TotalCost = totalFeatureCost;
                }

                console.log('TotalCost', TotalCost);

                // Get the total number of milestones by stage related to the project
                const stageCountsQuery = await this.amqpConnection.request<any>({
                    exchange: 'ConnectModule',
                    routingKey: `ConnectModule.RpcRunSqlQuery`,
                    payload: {
                        principal,
                        query: {
                            name: 'OdinAggregateChildRecordsByStage',
                            parentEntityName: 'Milestone',
                            childEntityName: 'Task',
                            parentRecordId: milestoneId,
                        },
                    },
                    timeout: 20000,
                });

                const stageCounts = stageCountsQuery['data'];

                const { TotalCount, CompleteCount, FailCount } = this.aggregateRecordStageCounts(
                    stageCounts,
                    'Milestone',
                );

                console.log('stageCounts', stageCounts);

                const update = {
                    entity: `${PROJECT_MODULE}:${MILESTONE}`,
                    properties: {
                        Cost: !isNaN(TotalCost) ? Number(TotalCost).toFixed(2) : 0,
                        [`${TASK}TotalCount`]: TotalCount,
                        [`${TASK}CompleteCount`]: CompleteCount,
                        [`${TASK}FailCount`]: FailCount,
                    },
                }
                // Update the program properties
                updated.push(await this.dbService.updateDbRecordsByPrincipalAndId(principal, milestoneId, update));

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
    private aggregateRecordCost(records: DbRecordEntityTransform[]): { TotalCost: number } {
        let TotalCost = 0;
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
        return { TotalCost: Number(Number(Number(TotalCost).toPrecision(10)).toFixed(2)) };
    }


    /**
     *
     * @param records
     * @param entityName
     * @private
     */
    private aggregateRecordStageCounts(stages, entityName) {
        let totalTodo = 0;
        let totalInProgress = 0;
        let totalOnHold = 0;
        let totalComplete = 0;
        let totalStopped = 0;

        if(stages) {
            for(const stage of stages) {
                if(stage.key === `${entityName}StageTodo`) {
                    totalTodo += Number(stage.count);
                }
                if(stage.key === `${entityName}StageInProgress`) {
                    totalInProgress += Number(stage.count);
                }
                if(stage.key === `${entityName}StageOnHold`) {
                    totalOnHold += Number(stage.count);
                }
                if(stage.key === `${entityName}StageDone`) {
                    totalComplete += Number(stage.count);
                }
                if(stage.key === `${entityName}StageStop`) {
                    totalStopped += Number(stage.count);
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
    private async setNextStage(principal: OrganizationUserEntity, milestoneIds: any[]) {

        for(const milestoneId of milestoneIds) {

            const milestone = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                milestoneId,
                [ TASK ],
            );

            const tasks = milestone[TASK].dbRecords;
            const { SomeInProgress, AllOnHold, AllComplete, AllStopped } = this.getOverallStatusOfAggregateChildRecords(
                tasks);

            if(SomeInProgress) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${MILESTONE}StageInProgress`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${MILESTONE}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, milestone.id, updateDto);
            } else if(AllOnHold) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${MILESTONE}StageOnHold`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${MILESTONE}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, milestone.id, updateDto);
            } else if(AllComplete) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${MILESTONE}StageDone`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${MILESTONE}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, milestone.id, updateDto);
            } else if(AllStopped) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    `${MILESTONE}StageStop`,
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${MILESTONE}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, milestone.id, updateDto);
            }

        }
    }

    /**
     *
     * @paramtasks
     * @private
     */
    private getOverallStatusOfAggregateChildRecords(tasks: DbRecordEntityTransform[]) {

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
            tasks,
            TASK,
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


    /**
     * Returns list of premises by polygon id from milestone.
     *
     * @param {number} polygonId
     * @return {*}  {Promise<any[]>}
     * @memberof MilestonesService
     */
    public async getPremisesByPolygonId(polygonId: number): Promise<any[]> {

        try {

            const l2Polygon: FtthPolygon = await this.gisFtthPolygonsService.getPolygonById(polygonId);
            let data = [];
            if(l2Polygon[0]) {
                const premises = await this.gisOsService.getPremisesFormattedByGeom(l2Polygon[0]?.geometry)

                for(const premise of premises) {

                    const {
                        line_1,
                        line_2,
                        line_3,
                        post_town,
                        postcode,
                    } = new Address(premise);

                    let fullAddress = '';
                    if(!!line_1) {
                        fullAddress = fullAddress.concat(line_1 + ', ');
                    }
                    if(!!line_2) {
                        fullAddress = fullAddress.concat(line_2 + ', ');
                    }
                    if(!!line_3) {
                        fullAddress = fullAddress.concat(line_3 + ', ');
                    }
                    if(!!post_town) {
                        fullAddress = fullAddress.concat(post_town + ', ');
                    }
                    if(!!postcode) {
                        fullAddress = fullAddress.concat(postcode);
                    }
                    const targetReleaseDate = moment(l2Polygon[0].target_release_date).format('DD/MM/YYYY');

                    const obj = {
                        targetReleaseDate: l2Polygon[0].target_release_date ? targetReleaseDate : l2Polygon[0].target_release_date,
                        l2PolygonId: polygonId,
                        l2BuildStatus: l2Polygon[0].build_status_name,
                        l4ClosureId: l2Polygon[0].l4_closure_id,
                        premise: fullAddress,
                    }
                    data.push(obj);
                }
            }

            return data;

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);

        }
    }


    /**
     * Main function to get all data for build pack generation(milestone and all nested data, Fibre to the home data
     * for table).
     * @param  {OrganizationUserEntity} principal
     * @param  {string} milestoneId
     */
    public async getDataForBuildPackByMilestoneId(
        principal: OrganizationUserEntity,
        milestoneId: string,
    ): Promise<MilestoneBuildPack> {
        try {

            const PROGRAM = 'Program'
            const PROJECT = 'Project'
            const TASK = 'Task'
            const FEATURE = 'Feature'
            const PRODUCT = 'Product'

            const milestone = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                milestoneId,
                [ TASK, PROJECT ],
            )
            const l2Polygon: FtthPolygon = await this.gisFtthPolygonsService.getPolygonById(milestone.properties.PolygonId);

            milestone.polygon = l2Polygon;
            const milestoneTasks = milestone[TASK]?.dbRecords
            const milestoneProject = milestone[PROJECT]?.dbRecords ? milestone[PROJECT]?.dbRecords[0] : [];

            // Get all tasks and related features
            let tasksPromiseArray = []
            if(milestoneTasks) {
                for(const record of milestoneTasks) {

                    tasksPromiseArray.push({
                        func: this.dbService.getDbRecordTransformedByOrganizationAndId(
                            principal.organization,
                            record.id,
                            [ FEATURE ],
                        ),
                    })

                }
            }

            // async load the milestones tasks
            const tasks = await Promise.all(tasksPromiseArray.map(elem => elem.func))

            let features = [];
            let products = [];
            let connections = [];

            for(const task of tasks) {
                // Get features and products from the tasks


                const taskFeatures = task[FEATURE].dbRecords;

                if(taskFeatures) {
                    task.taskFeatures = []

                    for(const taskFeature of taskFeatures) {

                        const feature = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                            principal.organization,
                            taskFeature.id,
                            [ PRODUCT ],
                        )

                        const featureProducts = feature[PRODUCT].dbRecords || [];
                        taskFeature.Product = feature.Product


                        // get connections if the feature is a type closure
                        if(getProperty(feature, 'Feature') === 'CLOSURE') {
                            // get the closures connections we need to get the closure feature id
                            const closureConnections = await this.gisFtthClosuresService.getConnectionsByClosureId(
                                principal,
                                getProperty(
                                    feature,
                                    'ExternalRef',
                                ),
                            )
                            // feature.closureConnections = closureConnections;
                            connections = connections.concat(closureConnections);
                        }


                        products.push(...featureProducts);
                        features.push(feature);
                    }

                }

            }
            /*if (milestoneTasks) {
             milestone[TASK].dbRecords = tasks

             }*/


            // get the program for the milestone project
            let program
            if(milestoneProject?.id) {
                program = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    milestoneProject.id,
                    [ PROGRAM ],
                )
            }


            // get the premises for the milestone
            const premises = await this.getPremisesByPolygonId(getProperty(milestone, 'PolygonId'))

            // construct the build back data object
            const aggregation = new MilestoneBuildPack()
            aggregation.program = program;
            aggregation.project = milestoneProject;
            aggregation.milestone = milestone;
            aggregation.premises = premises;
            aggregation.tasks = tasks;
            aggregation.features = features;
            aggregation.products = products;
            aggregation.connections = connections;

            return aggregation

        } catch (e) {

            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);

        }
    }
}
