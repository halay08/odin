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

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { PROJECT, MILESTONE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class ProjectsService {


  private schemasService: SchemasService;
  private dbService: DbService;
  private dbRecordsService: DbRecordsService;
  private dbRecordsAssociationsService: DbRecordsAssociationsService;
  private pipelineStagesService: PipelineEntitysStagesService;
  private pipelineEntitysStagesService: PipelineEntitysStagesService;
  private readonly amqpConnection: AmqpConnection;

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
    projectId: any,
    body: DbRecordCreateUpdateDto,
  ) {
    try {
      // if stage is being changed, check if all the child records are completed:
      // formula (complete + failed) = total
      const project = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        projectId,
        [],
      );

      if(body.stageId) {

        const selectedStage = await this.pipelineStagesService.getPipelineAndStagesByStageId(
          principal.organization,
          body.stageId,
        );

        if(selectedStage.isSuccess) {
          const totalCount = getProperty(project, 'MilestoneTotalCount');
          const totalComplete = getProperty(project, 'MilestoneCompleteCount');
          const totalFailed = getProperty(project, 'MilestoneFailCount');

          if(Number(totalCount) === (Number(totalFailed) + Number(totalComplete))) {
            return true;
          } else {
            throw new ExceptionType(
              409,
              'This project has milestones in progress, complete all milestones before moving to Done.',
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
  public async handleProjectMilestoneCreated(
    principal: OrganizationUserEntity,
    milestoneId: string,
    body: DbRecordCreateUpdateDto,
  ) {
    try {
      // replace with get stage and use the stage entity which will contain rules
      const milestone = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        milestoneId,
        [ PROJECT ],
      );

      const relatedRecords = milestone[PROJECT].dbRecords;

      if(relatedRecords) {
        return await this.aggregateProjectMilestoneValues(principal, relatedRecords.map(elem => elem.id));
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
  public async handleProjectMilestoneStageUpdated(
    principal: OrganizationUserEntity,
    milestoneId: string,
    body: DbRecordCreateUpdateDto,
  ) {
    try {
      // replace with get stage and use the stage entity which will contain rules
      const milestone = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        milestoneId,
        [ PROJECT ],
      );

      const relatedRecords = milestone[PROJECT].dbRecords;

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
  public async handleProjectMilestoneUpdated(
    principal: OrganizationUserEntity,
    milestoneId: string,
    body: DbRecordCreateUpdateDto,
  ) {
    try {
      const milestone = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        milestoneId,
        [ PROJECT ],
      );

      const relatedRecords = milestone[PROJECT].dbRecords;

      if(relatedRecords) {
        return await this.aggregateProjectMilestoneValues(principal, relatedRecords.map(elem => elem.id));
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
  public async handleProjectMilestoneDeleted(
    principal: OrganizationUserEntity,
    milestoneId: string,
    body: DbRecordCreateUpdateDto,
  ) {
    try {

      const projectSchema = await this.schemasService.getSchemaByOrganizationAndEntity(
        principal.organization,
        `${PROJECT_MODULE}:${PROJECT}`,
      );

      const parentRecordIds = await this.dbRecordsAssociationsService.getRelatedParentRecordIds(
        principal.organization,
        {
          recordId: milestoneId,
          parentSchemaId: projectSchema.id,
          relatedAssociationId: undefined,
        },
        { withDeleted: true },
      );

      return await this.aggregateProjectMilestoneValues(principal, parentRecordIds);

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param projectIds
   * @private
   */
  private async aggregateProjectMilestoneValues(
    principal: OrganizationUserEntity,
    projectIds: string[],
  ): Promise<IDbRecordCreateUpdateRes[]> {

    try {
      const updated: IDbRecordCreateUpdateRes[] = [];

      for(const projectId of projectIds) {

        // Get the total cost of all milestones related to the project
        const totalCostQueryRes = await this.amqpConnection.request<any>({
          exchange: 'ConnectModule',
          routingKey: `ConnectModule.RpcRunSqlQuery`,
          payload: {
            principal,
            query: {
              name: 'OdinAggregateChildRecordValueOfNumberProperty',
              parentEntityName: 'Project',
              childEntityName: 'Milestone',
              aggColumnName: 'Cost',
              parentRecordId: projectId,
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
              parentEntityName: 'Project',
              childEntityName: 'Milestone',
              parentRecordId: projectId,
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
          entity: `${PROJECT_MODULE}:${PROJECT}`,
          properties: {
            Cost: !isNaN(TotalCost) ? TotalCost : 0,
            [`${MILESTONE}TotalCount`]: TotalCount,
            [`${MILESTONE}CompleteCount`]: CompleteCount,
            [`${MILESTONE}FailCount`]: FailCount,
          },
        };
        console.log('update', update);
        // Update the program properties
        updated.push(await this.dbService.updateDbRecordsByPrincipalAndId(principal, projectId, update));

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
  public async computeProjectMilestonesTotalsAndSave(
    principal: OrganizationUserEntity,
    projectId: string,
  ): Promise<IDbRecordCreateUpdateRes> {
    try {
      const project = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        projectId,
        [ MILESTONE ],
      );

      const milestones = project[MILESTONE].dbRecords;

      // get the task cost from products
      let { TotalCost } = await this.aggregateRecordCost(milestones);

      const update = {
        entity: `${PROJECT_MODULE}:${PROJECT}`,
        properties: {
          Cost: Number(TotalCost).toFixed(2),
        },
      }
      // Update the task properties
      return await this.dbService.updateDbRecordsByPrincipalAndId(principal, project.id, update);

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
  private async setNextStage(principal: OrganizationUserEntity, projectIds: any[]) {

    for(const projectId of projectIds) {

      const project = await this.dbService.getDbRecordTransformedByOrganizationAndId(
        principal.organization,
        projectId,
        [ MILESTONE ],
      );

      const milestones = project[MILESTONE].dbRecords;

      const { SomeInProgress, AllOnHold, AllComplete, AllStopped } = this.getOverallStatusOfAggregateChildRecords(
        milestones);

      if(SomeInProgress) {
        const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
          principal.organization,
          `${PROJECT}StageInProgress`,
        );
        const updateDto = new DbRecordCreateUpdateDto();
        updateDto.entity = `${PROJECT_MODULE}:${PROJECT}`;
        updateDto.stageId = stage.id;

        await this.dbService.updateDbRecordsByPrincipalAndId(principal, project.id, updateDto);
      } else if(AllOnHold) {
        const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
          principal.organization,
          `${PROJECT}StageOnHold`,
        );
        const updateDto = new DbRecordCreateUpdateDto();
        updateDto.entity = `${PROJECT_MODULE}:${PROJECT}`;
        updateDto.stageId = stage.id;

        await this.dbService.updateDbRecordsByPrincipalAndId(principal, project.id, updateDto);
      } else if(AllComplete) {
        const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
          principal.organization,
          `${PROJECT}StageDone`,
        );
        const updateDto = new DbRecordCreateUpdateDto();
        updateDto.entity = `${PROJECT_MODULE}:${PROJECT}`;
        updateDto.stageId = stage.id;

        await this.dbService.updateDbRecordsByPrincipalAndId(principal, project.id, updateDto);
      } else if(AllStopped) {
        const stage = await this.pipelineEntitysStagesService.getPipelineAndStagesByStageKey(
          principal.organization,
          `${PROJECT}StageStop`,
        );
        const updateDto = new DbRecordCreateUpdateDto();
        updateDto.entity = `${PROJECT_MODULE}:${PROJECT}`;
        updateDto.stageId = stage.id;

        await this.dbService.updateDbRecordsByPrincipalAndId(principal, project.id, updateDto);
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
      MILESTONE,
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
