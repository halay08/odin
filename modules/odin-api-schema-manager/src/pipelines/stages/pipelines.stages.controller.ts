import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { PipelineStageCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/stage/dto/pipeline.stage.create.update.dto';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PipelineEntitysStagesService } from './pipelines.stages.service';

@ApiTags('Pipelines')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/stages`)
export class PipelineEntitysStagesController {

  public readonly stageService: PipelineEntitysStagesService;

  constructor(stageService: PipelineEntitysStagesService) {
    this.stageService = stageService;
  }

  /**
   *
   * @param principal
   * @param pipelineId
   * @param body
   */
  @Post(':pipelineId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.create')
  public async updateOrCreateStage(
    @Principal() principal: OrganizationUserEntity,
    @Param('pipelineId') pipelineId: string,
    @Body() body: PipelineStageCreateUpdateDto,
  ): Promise<PipelineStageEntity> {
    return await this.stageService.updateOrCreateStage(principal, pipelineId, body);
  }

  /**
   *
   * @param principal
   * @param stageId
   */
  @Get('/byKey/:stageKey')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.get')
  public async getPipelineAndStagesByStageKey(
    @Principal() principal: OrganizationUserEntity,
    @Param('stageKey') stageKey: string,
  ): Promise<PipelineStageEntity> {
    return await this.stageService.getPipelineAndStagesByStageKey(principal.organization, stageKey);
  }

  /**
   *
   * @param principal
   * @param stageId
   */
  @Get(':stageId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.get')
  public async getPipelineAndStagesByStageId(
    @Principal() principal: OrganizationUserEntity,
    @Param('stageId') stageId: string,
  ): Promise<PipelineStageEntity> {
    return await this.stageService.getPipelineAndStagesByStageId(principal.organization, stageId);
  }

  /**
   *
   * @param principal
   * @param stageId
   */
  @Delete(':stageId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.delete')
  public async deleteByOrganizationAndPipelineEntityAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('stageId') stageId: string,
  ): Promise<{ affected: number }> {
    return await this.stageService.deleteByOrganizationAndPipelineEntityAndId(principal, stageId);
  }

}
