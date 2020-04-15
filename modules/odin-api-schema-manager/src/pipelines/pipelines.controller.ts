import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { PipelineCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/dto/pipeline.create.update.dto';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PipelineEntitysService } from './pipelines.service';

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
@Controller(`/${process.env.MODULE_NAME}/v1.0/pipelines`)
export class PipelineEntitiesController {

  public readonly pipelinesService: PipelineEntitysService;

  constructor(pipelinesService: PipelineEntitysService) {
    this.pipelinesService = pipelinesService;
  }

  /**
   *
   * @param principal
   * @param body
   */
  @Post()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.create')
  public async createByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Body() body: PipelineCreateUpdateDto,
  ): Promise<PipelineEntity> {
    return await this.pipelinesService.createByPrincipal(principal, body);
  }

  /**
   *
   * @param principal
   */
  @Get()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.get')
  public async listByOrganizationEntity(
    @Principal() principal: OrganizationUserEntity,
  ): Promise<PipelineEntity[]> {
    return await this.pipelinesService.listByOrganizationEntity(principal.organization);
  }

  /**
   *
   * @param principal
   * @param id
   */
  @Get('/:id')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.get')
  public async getByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('id') id: string,
  ): Promise<PipelineEntity> {
    return await this.pipelinesService.getByOrganizationAndId(principal.organization, id);
  }

  /**
   *
   * @param principal
   * @param id
   */
  @Get('/:id/stages')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.get')
  public async getPipelineEntityAndStagesByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('id') id: string,
  ): Promise<PipelineEntity> {
    return await this.pipelinesService.getPipelineEntityAndStagesByOrganizationAndId(principal.organization, id);
  }

  /**
   *
   * @param principal
   * @param moduleName
   * @param entityName
   */
  @Get('/bymodule/:moduleName/:entityName')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.get')
  public async getPipelineAndStagesByModuleName(
    @Principal() principal: OrganizationUserEntity,
    @Param('moduleName') moduleName: string,
    @Param('entityName') entityName: string,
  ): Promise<PipelineEntity[]> {
    return await this.pipelinesService.getPipelineAndStagesByModuleNameApiLegacy(
      principal.organization,
      moduleName,
      entityName,
    );
  }


  /**
   *
   * @param principal
   * @param request
   * @param response
   * @param id
   */
  @Delete('/:id')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('pipelines.delete')
  public async deleteByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Req() request,
    @Res() response,
    @Param('id') id: string,
  ): Promise<{ affected: number }> {
    return await this.pipelinesService.deleteByPrincipalAndId(principal, id);
  }

}
