import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { ViewsCreateUpdateDto } from '@d19n/models/dist/schema-manager/views/dto/views.create.update.dto';
import { ViewEntity } from '@d19n/models/dist/schema-manager/views/view.entity';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { ViewsService } from './views.services';


@ApiTags('UI List Views')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/views`)
export class ViewsController {

  private viewsService: ViewsService;

  constructor(viewsService: ViewsService) {
    this.viewsService = viewsService;
  }

  /**
   *
   * @param principal
   * @param request
   * @param response
   * @param body
   */
  @Post()
  @UseGuards(PrincipalGuard)
  public async createView(
    @Principal() principal: OrganizationUserEntity,
    @Body() body: ViewsCreateUpdateDto,
  ): Promise<ViewEntity> {
    console.log('create', body);
    return await this.viewsService.createView(principal, body);
  }

  /**
   *
   * @param principal
   * @param request
   * @param response
   * @param query
   */
  @Get('byKey/:key')
  @ApiParam({ name: 'key', example: 'ActiveOrders', required: true })
  @UseGuards(PrincipalGuard)
  public async getViewByKey(
    @Principal() principal: OrganizationUserEntity,
    @Param('key') key: string,
  ): Promise<ViewEntity> {
    return await this.viewsService.getViewByKey(principal, key);
  }

  /**
   *
   * @param principal
   * @param request
   * @param response
   * @param query
   */
  @Get('byModule/:moduleName/:entityName')
  @ApiParam({ name: 'userId', required: true })
  @ApiParam({ name: 'moduleName', required: true })
  @ApiParam({ name: 'entityName', required: true })
  @UseGuards(PrincipalGuard)
  public async listViewsByUserAndModuleAndEntity(
    @Principal() principal: OrganizationUserEntity,
    @Param('moduleName') moduleName: string,
    @Param('entityName') entityName: string,
  ): Promise<ViewEntity[]> {
    return await this.viewsService.listViewsByUserAndModuleAndEntity(principal, moduleName, entityName);
  }

  /**
   *
   * @param principal
   * @param request
   * @param response
   * @param queryId
   * @param body
   */
  @Delete(':viewId')
  @UseGuards(PrincipalGuard)
  public async deleteViewById(
    @Principal() principal: OrganizationUserEntity,
    @Param('viewId', ParseUUIDPipe) viewId: string,
  ): Promise<DeleteResult> {
    return await this.viewsService.deleteViewById(principal, viewId);
  }

}

