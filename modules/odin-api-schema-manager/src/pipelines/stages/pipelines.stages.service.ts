import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { PipelineStageCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/stage/dto/pipeline.stage.create.update.dto';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { DeleteResult } from 'typeorm';
import { IMethodOptions } from '../../db/interfaces/interfaces';
import { LogsUserActivityService } from '../../logs/user-activity/logs.user.activity.service';
import { PipelineEntitysService } from '../pipelines.service';
import { PipelineEntitysStagesRepository } from './pipelines.stages.repository';

@Injectable()
export class PipelineEntitysStagesService {

  private readonly logsUserActivityService: LogsUserActivityService;
  private readonly pipelinesStagesRepository: PipelineEntitysStagesRepository;
  private readonly pipelinesService: PipelineEntitysService;

  constructor(
    @InjectRepository(PipelineEntitysStagesRepository) pipelinesStagesRepository: PipelineEntitysStagesRepository,
    @Inject(forwardRef(() => PipelineEntitysService)) pipelinesService: PipelineEntitysService,
    @Inject(forwardRef(() => LogsUserActivityService)) logsUserActivityService: LogsUserActivityService,
  ) {
    this.pipelinesStagesRepository = pipelinesStagesRepository;
    this.pipelinesService = pipelinesService;
    this.logsUserActivityService = logsUserActivityService;
  }


  /**
   *
   * @param principal
   * @param pipelineId
   * @param body
   */
  public async updateOrCreateStage(
    principal: OrganizationUserEntity,
    pipelineId: string,
    body: PipelineStageCreateUpdateDto,
  ): Promise<PipelineStageEntity> {
    return new Promise(async (resolve, reject) => {
      try {

        const pipeline = await this.pipelinesService.getByOrganizationAndId(principal.organization, pipelineId);

        const pipelineStages: PipelineStageEntity[] = await this.pipelinesStagesRepository.find({
          where: {
            organization: principal.organization,
            pipeline: pipeline,
          },
        });

        const stage: PipelineStageEntity = await this.pipelinesStagesRepository.findOne({
          where: {
            organization: principal.organization,
            pipeline: pipeline,
            key: body.key,
          },
        });

        if(stage) {
          return reject(new ExceptionType(409, 'a stage with that name already exists'));
        }

        const newStage = new PipelineStageEntity();

        newStage.organization = principal.organization;
        newStage.pipeline = pipeline;
        newStage.name = body.name;
        newStage.key = body.key;
        newStage.isDefault = body.isDefault;
        newStage.isSuccess = body.isSuccess;
        newStage.isFail = body.isFail;
        newStage.description = body.description;
        newStage.position = pipelineStages.length + 1;

        const errors = await validate(newStage);
        if(errors.length > 0) {
          return reject(new ExceptionType(422, 'validation error', errors));
        }
        const res: PipelineStageEntity = await this.pipelinesStagesRepository.save(newStage);

        await this.logsUserActivityService.createByPrincipal(
          principal,
          newStage.id,
          newStage,
          LogsConstants.PIPELINE_STAGE_CREATED,
        );
        return resolve(res);

      } catch (e) {
        return reject(new ExceptionType(500, e.message));
      }
    });
  }

  /**
   *
   * @param organization
   * @param id
   * @param relations
   */
  public async getPipelineStageByOrganizationAndId(
    organization: OrganizationEntity,
    stageId: string,
    relations?: string[],
  ): Promise<PipelineStageEntity> {
    try {
      const stage = await this.pipelinesStagesRepository.findOne({
        where: {
          organization,
          id: stageId,
        },
        relations: relations ? relations : [],
      });
      if(!stage) {
        throw new ExceptionType(404, `cannot find stage with id ${stageId}`);
      }
      return stage;
    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }

  /**
   *
   * @param principal
   * @param stageId
   * @param body
   */
  public async updateByPrincipalEntityAndId(
    principal: OrganizationUserEntity,
    stageId: string,
    body: PipelineStageCreateUpdateDto,
  ): Promise<PipelineStageEntity> {
    return new Promise(async (resolve, reject) => {
      try {

        const stage = await this.pipelinesStagesRepository.findOne({
          where: {
            organization: principal.organization,
            id: stageId,
          },
        });

        if(!stage) {
          throw new ExceptionType(404, `cannot find stage with id ${stageId}`);
        }

        stage.name = body.name;
        stage.key = body.name;
        stage.description = body.description;
        stage.position = body.position;

        const errors = await validate(stage);
        if(errors.length > 0) {
          return reject(new ExceptionType(422, 'validation error', errors));
        }
        const res: PipelineStageEntity = await this.pipelinesStagesRepository.save(stage);

        await this.logsUserActivityService.createByPrincipal(
          principal,
          stage.id,
          stage,
          LogsConstants.PIPELINE_STAGE_UPDATED,
        );

        return resolve(res);
      } catch (e) {
        return reject(new ExceptionType(500, e.message));
      }
    })
  }


  /**
   *
   * @param principal
   * @param stageId
   */
  public async deleteByOrganizationAndPipelineEntityAndId(
    principal: OrganizationUserEntity,
    stageId: string,
  ): Promise<{ affected: number }> {
    return new Promise(async (resolve, reject) => {
      try {
        const stage: PipelineStageEntity = await this.getPipelineStageByOrganizationAndId(
          principal.organization,
          stageId,
          [ 'pipeline' ],
        );

        const deleteResult: DeleteResult = await this.pipelinesStagesRepository.delete({
          organization: principal.organization,
          id: stageId,
        });
        // Log event
        await this.logsUserActivityService.createByPrincipal(principal, stageId, {
          pipelineId: stage.pipeline.id,
          stageId,
          affected: deleteResult.affected,
        }, LogsConstants.PIPELINE_STAGE_DELETED);

        // if the stage is deleted get all stages after for this pipeline need to be reduced by 1
        if(deleteResult.affected > 0) {
          const stages: PipelineStageEntity[] = await this.pipelinesStagesRepository
            .createQueryBuilder('stage')
            .where('stage.pipeline_id = :pipelineId', { pipelineId: stage.pipeline.id })
            .andWhere(`stage.position > :stagePosition`, { stagePosition: stage.position })
            .getMany();
          // updated stage positions
          for(let elem of stages) {
            // move the stage back one position
            elem.position = elem.position - 1;
            await this.updateByPrincipalEntityAndId(principal, elem.id, elem);
          }
        }

        return resolve({ affected: deleteResult.affected });

      } catch (e) {
        return reject(new ExceptionType(500, e.message));
      }
    });
  }

  /**
   *
   * @param principal
   * @param params
   * @param options
   */
  public async getPipelineStageByIdOrReturnDefault(
    principal: OrganizationUserEntity,
    params: {
      moduleName: string,
      entityName: string,
      stageId?: string,
    },
    options?: IMethodOptions,
  ) {

    try {

      const trace = await tracer.startSpan(
        'getPipelineStageByIdOrReturnDefault',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );
      if(params.stageId) {
        const res = await this.getPipelineStageByOrganizationAndId(
          principal.organization,
          params.stageId,
        );
        trace.finish();

        return res;
      } else {
        // Get the pipelines available for this module and entity
        const pipeline: PipelineEntity = await this.pipelinesService.getPipelineByModuleName(
          principal.organization,
          params.moduleName,
          params.entityName,
        );

        if(!pipeline) {
          return undefined;
        }

        const stages: PipelineStageEntity[] = await this.pipelinesStagesRepository.getPipelineStageByPipelineId(
          principal.organization,
          pipeline.id,
        );

        trace.finish();

        return stages ? stages.find(stage => stage.position === 1) : undefined;
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param stageId
   */
  public async getPipelineAndStagesByStageId(organization: OrganizationEntity, stageId: string) {
    try {

      const stage: PipelineStageEntity = await this.pipelinesStagesRepository.getPipelineStageByOrganizationAndId(
        organization,
        stageId,
      );

      const pipeline: PipelineEntity = await this.pipelinesService.getPipelineById(organization, stage.pipelineId);

      const stages: PipelineStageEntity[] = await this.pipelinesStagesRepository.getPipelineStageByPipelineId(
        organization,
        pipeline.id,
      );

      stage.pipeline = pipeline;
      stage.pipeline.stages = stages;

      return stage;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param stageKey
   */
  public async getPipelineAndStagesByStageKey(organization: OrganizationEntity, stageKey: string) {
    try {
      return await this.pipelinesStagesRepository.getPipelineStageByOrganizationAndKey(
        organization,
        stageKey,
      );

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param stageId
   */
  public async getStagesByPipelineId(organization: OrganizationEntity, pipelineId: string) {
    try {

      const stages: PipelineStageEntity[] = await this.pipelinesStagesRepository.getPipelineStageByPipelineId(
        organization,
        pipelineId,
      );

      return stages;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }
}
