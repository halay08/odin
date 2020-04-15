import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { PipelineCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/dto/pipeline.create.update.dto';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { DeleteResult } from 'typeorm';
import { LogsUserActivityService } from '../logs/user-activity/logs.user.activity.service';
import { PipelineEntitysRepository } from './pipelines.repository';
import { PipelineEntitysStagesService } from './stages/pipelines.stages.service';

@Injectable()
export class PipelineEntitysService {

  private readonly logsUserActivityService: LogsUserActivityService;
  private readonly pipelineRepository: PipelineEntitysRepository;
  private readonly pipelineEntitysStagesService: PipelineEntitysStagesService;

  constructor(
    @InjectRepository(PipelineEntitysRepository) pipelineRepository: PipelineEntitysRepository,
    @Inject(forwardRef(() => PipelineEntitysStagesService)) pipelineEntitysStagesService: PipelineEntitysStagesService,
    @Inject(forwardRef(() => LogsUserActivityService)) logsUserActivityService: LogsUserActivityService,
  ) {
    this.pipelineRepository = pipelineRepository;
    this.logsUserActivityService = logsUserActivityService;
    this.pipelineEntitysStagesService = pipelineEntitysStagesService;
  }

  /**
   *
   * @param principal
   * @param body
   */
  public async createByPrincipal(
    principal: OrganizationUserEntity,
    body: PipelineCreateUpdateDto,
  ): Promise<PipelineEntity> {
    try {
      const pipeline = await this.pipelineRepository.findOne({
        where: {
          organization: principal.organization,
          name: body.name,
          key: body.key,
          moduleName: body.moduleName,
          entityName: body.entityName,
        },
      });

      if(pipeline) {
        throw new ExceptionType(409, 'pipeline already exists with that name for the module and entity ');
      }

      const newPipelineEntity = new PipelineEntity();

      newPipelineEntity.organization = principal.organization;
      newPipelineEntity.name = body.name ? body.name.trim() : null;
      newPipelineEntity.key = body.key ? body.key.trim() : null;
      newPipelineEntity.description = body.description ? body.description.trim() : null;
      newPipelineEntity.moduleName = body.moduleName;
      newPipelineEntity.entityName = body.entityName;

      const errors = await validate(newPipelineEntity);
      if(errors.length > 0) {
        throw new ExceptionType(422, 'validation error', errors);
      }
      const res: PipelineEntity = await this.pipelineRepository.save(newPipelineEntity);
      await this.logsUserActivityService.createByPrincipal(principal, res.id, res, LogsConstants.PIPELINE_CREATED);

      return res;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param organization
   */
  public async listByOrganizationEntity(organization: OrganizationEntity): Promise<PipelineEntity[]> {
    try {
      const pipeline: PipelineEntity[] = await this.pipelineRepository.find({ where: { organization } });

      return pipeline;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param organization
   * @param id
   */
  public async getByOrganizationAndId(
    organization: OrganizationEntity,
    id: string,
  ): Promise<PipelineEntity> {
    try {
      const pipeline = await this.pipelineRepository.findOne({
        where: {
          organization,
          id,
        },
      });

      if(pipeline) {

        pipeline.stages = await this.pipelineEntitysStagesService.getStagesByPipelineId(organization, pipeline.id);

      }

      if(!pipeline) {
        throw new ExceptionType(404, 'not found');
      }

      return pipeline;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param id
   */
  public async getPipelineEntityAndStagesByOrganizationAndId(
    organization: OrganizationEntity,
    id: string,
  ): Promise<PipelineEntity> {
    try {


      const pipeline: PipelineEntity = await this.pipelineRepository.createQueryBuilder('pipeline')
        .where('pipeline.organization_id = :organizationId', { organizationId: organization.id })
        .andWhere('pipeline.id = :id', { id })
        .leftJoinAndSelect('pipeline.stages', 'stages', 'stages.pipeline_id = :id', { id })
        .orderBy({
          'stages.position': 'ASC',
        })
        .getOne();

      if(!pipeline) {
        throw new ExceptionType(404, 'not found');
      }

      return pipeline;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param moduleName
   * @param entityName
   */
  public async getPipelineByModuleName(
    organization: OrganizationEntity,
    moduleName: string,
    entityName: string,
  ): Promise<PipelineEntity> {
    try {

      const pipeline = await this.pipelineRepository.getByModuleAndEntity(
        organization,
        moduleName,
        entityName,
      );

      return pipeline;
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param moduleName
   * @param entityName
   */
  public async getPipelineAndStagesByModuleName(
    organization: OrganizationEntity,
    moduleName: string,
    entityName: string,
  ): Promise<PipelineEntity> {
    try {

      const pipeline = await this.pipelineRepository.getByModuleAndEntity(
        organization,
        moduleName,
        entityName,
      );
      if(pipeline) {

        pipeline.stages = await this.pipelineEntitysStagesService.getStagesByPipelineId(organization, pipeline.id);

      }
      return pipeline;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param moduleName
   * @param entityName
   */
  public async getPipelineAndStagesByModuleNameApiLegacy(
    organization: OrganizationEntity,
    moduleName: string,
    entityName: string,
  ): Promise<PipelineEntity[]> {
    try {

      const pipeline = await this.pipelineRepository.getByModuleAndEntity(
        organization,
        moduleName,
        entityName,
      );

      if(pipeline) {

        pipeline.stages = await this.pipelineEntitysStagesService.getStagesByPipelineId(organization, pipeline.id);

      }

      return pipeline ? [ pipeline ] : [];

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param stageId
   */
  public async getPipelineById(organization: OrganizationEntity, pipelineId: string) {
    try {

      // Get the pipelines available for this module and entity
      const pipeline: PipelineEntity = await this.pipelineRepository.getById(
        organization,
        pipelineId,
      );

      return pipeline;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param pipelineId
   */
  public async deleteByPrincipalAndId(
    principal: OrganizationUserEntity,
    pipelineId: string,
  ): Promise<{ affected: number }> {
    try {
      const deleteResult: DeleteResult = await this.pipelineRepository.delete({
        organization: principal.organization,
        id: pipelineId,
      });
      // Log event
      await this.logsUserActivityService.createByPrincipal(principal, pipelineId, {
        id: pipelineId,
        affected: deleteResult.affected,
      }, LogsConstants.PIPELINE_DELETED);

      return { affected: deleteResult.affected };
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

}
