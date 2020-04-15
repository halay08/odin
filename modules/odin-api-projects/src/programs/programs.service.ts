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
import { Injectable } from '@nestjs/common';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { PROGRAM, PROJECT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class ProgramsService {


    private schemasService: SchemasService;
    private dbService: DbService;
    private dbRecordsService: DbRecordsService;
    private dbRecordsAssociationsService: DbRecordsAssociationsService;
    private pipelineStagesService: PipelineEntitysStagesService;
    private pipelineEntitysStagesService: PipelineEntitysStagesService;

    constructor(
        dbRecordsAssociationsService: DbRecordsAssociationsService,
        dbService: DbService,
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
     * @param recordId
     * @param requestBody
     */
    public async validateAgainstRules(
        principal: OrganizationUserEntity,
        programId: any,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // if stage is being changed, check if all the child records are completed:
            // formula (complete + failed) = total
            const program = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                programId,
                [],
            );

            if(body.stageId) {

                const selectedStage = await this.pipelineStagesService.getPipelineAndStagesByStageId(
                    principal.organization,
                    body.stageId,
                );

                if(selectedStage.isSuccess) {
                    const totalCount = getProperty(program, 'ProjectTotalCount');
                    const totalComplete = getProperty(program, 'ProjectCompleteCount');
                    const totalFailed = getProperty(program, 'ProjectFailCount');

                    if(Number(totalCount) === (Number(totalFailed) + Number(totalComplete))) {
                        return true;
                    } else {
                        throw new ExceptionType(
                            409,
                            'This program has projects in progress, complete all projects before moving to Done.',
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
     * @param projectId
     * @param body
     */
    public async handleProgramProjectCreated(
        principal: OrganizationUserEntity,
        projectId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const project = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                projectId,
                [ PROGRAM ],
            );

            const relatedRecords = project[PROGRAM].dbRecords;
            if(relatedRecords) {
                return await this.aggregateProgramProjectValues(principal, relatedRecords.map(elem => elem.id));
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
     * @param projectId
     * @param body
     */
    public async handleProgramProjectStageUpdated(
        principal: OrganizationUserEntity,
        projectId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const project = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                projectId,
                [ PROGRAM ],
            );

            const relatedRecords = project[PROGRAM].dbRecords;

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
    public async handleProgramProjectUpdated(
        principal: OrganizationUserEntity,
        projectId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {
            // replace with get stage and use the stage entity which will contain rules
            const project = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                projectId,
                [ PROGRAM ],
            );

            const relatedRecords = project[PROGRAM].dbRecords;

            if(relatedRecords) {
                return await this.aggregateProgramProjectValues(principal, relatedRecords.map(elem => elem.id));
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
    public async handleProgramProjectDeleted(
        principal: OrganizationUserEntity,
        projectId: string,
        body: DbRecordCreateUpdateDto,
    ) {
        try {

            const programSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
                principal.organization,
                `${PROJECT_MODULE}:${PROGRAM}`,
            );

            const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
                principal.organization,
                {
                    recordId: projectId,
                    parentSchemaId: programSchema.id,
                    relatedAssociationId: undefined,
                },
                { withDeleted: true },
            );

            return await this.aggregateProgramProjectValues(principal, parentRecordIds);

        } catch (e) {
            console.error(e);
            throw new ExceptionType(e.statusCode, e.message, e.validation);
        }
    }


    /**
     *
     * @param principal
     * @param programIds
     * @private
     */
    private async aggregateProgramProjectValues(
        principal: OrganizationUserEntity,
        programIds: string[],
    ): Promise<IDbRecordCreateUpdateRes[]> {

        try {
            const updated: IDbRecordCreateUpdateRes[] = [];

            for(const programId of programIds) {
                // fetch the programs projects
                const program = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                    principal.organization,
                    programId,
                    [ PROJECT ],
                );

                const projects = program[PROJECT].dbRecords;

                let { TotalCost } = this.aggregateRecordCost(projects);

                const { TotalCount, CompleteCount, FailCount } = this.aggregateRecordStageCounts(
                    projects,
                    PROJECT,
                );

                const update = {
                    entity: `${PROJECT_MODULE}:${PROGRAM}`,
                    properties: {
                        Cost: TotalCost,
                        [`${PROJECT}TotalCount`]: TotalCount,
                        [`${PROJECT}CompleteCount`]: CompleteCount,
                        [`${PROJECT}FailCount`]: FailCount,
                    },
                }
                // Update the program properties
                updated.push(await this.dbService.updateDbRecordsByPrincipalAndId(principal, program.id, update));

                return updated;
            }

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
    public async computeProgramProjectsTotalsAndSave(
        principal: OrganizationUserEntity,
        programId: string,
    ): Promise<IDbRecordCreateUpdateRes> {
        try {
            const program = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                programId,
                [ PROJECT ],
            );

            const projects = program[PROJECT].dbRecords;

            // get the task cost from products
            let { TotalCost } = await this.aggregateRecordCost(projects);
            console.log('TotalCost', TotalCost);

            const update = {
                entity: `${PROJECT_MODULE}:${PROGRAM}`,
                properties: {
                    Cost: !isNaN(TotalCost) ? Number(TotalCost).toFixed(2) : 0,
                },
            }
            // Update the task properties
            return await this.dbService.updateDbRecordsByPrincipalAndId(principal, program.id, update);

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
    private aggregateRecordStageCounts(records, entityName) {
        let totalTodo = 0;
        let totalInProgress = 0;
        let totalOnHold = 0;
        let totalComplete = 0;
        let totalStopped = 0;

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
    private async setNextStage(principal: OrganizationUserEntity, programIds: any[]) {

        for(const programId of programIds) {

            const program = await this.dbService.getDbRecordTransformedByOrganizationAndId(
                principal.organization,
                programId,
                [ PROJECT ],
            );

            const projects = program[PROJECT].dbRecords;
            const { SomeInProgress, AllOnHold, AllComplete, AllStopped } = this.getOverallStatusOfAggregateChildRecords(
                projects);

            if(SomeInProgress) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    'ProgramStageInProgress',
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${PROGRAM}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, program.id, updateDto);
            } else if(AllOnHold) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    'ProgramStageOnHold',
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${PROGRAM}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, program.id, updateDto);
            } else if(AllComplete) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    'ProgramStageDone',
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${PROGRAM}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, program.id, updateDto);
            } else if(AllStopped) {
                const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
                    principal.organization,
                    'ProgramStageStop',
                );
                const updateDto = new DbRecordCreateUpdateDto();
                updateDto.entity = `${PROJECT_MODULE}:${PROGRAM}`;
                updateDto.stageId = stage.id;

                await this.dbService.updateDbRecordsByPrincipalAndId(principal, program.id, updateDto);
            }

        }
    }

    /**
     *
     * @param projects
     * @private
     */
    private getOverallStatusOfAggregateChildRecords(projects: DbRecordEntityTransform[]) {

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
            projects,
            PROJECT,
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
