import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DbApiQuery } from '../../types/db.api.query';
import { DbRecordsAssociationsService } from './db.records.associations.service';
import { DbRecordAssociationDeleteResult } from './db.records.associations.service.internal';


@ApiTags('DB Records Associations')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/db-associations`)
export class DbRecordsAssociationsController {

  private readonly dbRecordAssociationService: DbRecordsAssociationsService;

  public constructor(
    dbRecordAssociationService: DbRecordsAssociationsService,
  ) {
    this.dbRecordAssociationService = dbRecordAssociationService;
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param entityName
   * @param body
   * @param query
   */
  @Post(':entityName/:recordId')
  @ApiBody({
    type: DbRecordAssociationCreateUpdateDto,
    description: 'create associations to records (parent or child)',
    required: true,
    isArray: true,
  })
  @UseGuards(PrincipalGuard)
  public async updateOrCreateByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() body: DbRecordAssociationCreateUpdateDto[],
    @Query() query: DbApiQuery,
  ): Promise<DbRecordAssociationEntity[]> {
    return await this.dbRecordAssociationService.createRelatedRecords(principal, { recordId, body });
  }

  /**
   *
   * @param principal
   * @param dbRecordAssociationId
   * @param recordId
   * @param query
   */
  @Get('/:dbRecordAssociationId/:recordId')
  @UseGuards(PrincipalGuard)
  public async getRecordWithColumnMappingsByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('dbRecordAssociationId', ParseUUIDPipe) dbRecordAssociationId: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Query() query: DbApiQuery,
  ): Promise<DbRecordEntityTransform> {
    return await this.dbRecordAssociationService.getRelatedRecordById(
      principal.organization,
      {
        dbRecordAssociationId,
        recordId,
        entities: query['entities'],
      },
    );
  }

  /**
   *
   * @param principal
   * @param dbRecordAssociationId
   * @param recordId
   * @param body
   * @param query
   */
  @Put('/:dbRecordAssociationId/:recordId')
  @UseGuards(PrincipalGuard)
  public async updateDbRecordAssociationByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('dbRecordAssociationId', ParseUUIDPipe) dbRecordAssociationId: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() body: DbRecordAssociationCreateUpdateDto,
    @Query() query: DbApiQuery,
  ): Promise<DbRecordAssociationEntity> {
    return await this.dbRecordAssociationService.updateRelatedRecordById(
      principal,
      {
        dbRecordAssociationId,
        recordId,
        body,
      },
    );
  }

  /**
   *
   * @param principal
   * @param entityName
   * @param recordId
   * @param query
   */
  @Get(':entityName/:recordId/relations')
  @ApiParam({ name: 'recordId', description: 'The id of the source record' })
  @ApiQuery({
    name: 'entities',
    example: '["Account", "Contact"]',
    description: 'load the related entities',
    required: true,
  })
  @ApiQuery({
    name: 'filters',
    example: '[Role:Primary, Status:Active]',
    description: 'return entities matching these filters',
    required: false,
  })
  @UseGuards(PrincipalGuard)
  public async getDbRecordAssociationsTransformedByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Query() query: DbApiQuery,
  ): Promise<{ [key: string]: DbRecordAssociationRecordsTransform }> {

    return await this.dbRecordAssociationService.getRelatedRecordsByEntity(
      principal.organization,
      {
        recordId,
        entities: query['entities'],
        dbRecordAssociationId: query['dbRecordAssociationId'],
        filters: query['filters'],
      },
    );
  }

  /**
   * Delete many associations by Primary Id
   * @param principal
   * @param ids
   */
  @Delete()
  @UseGuards(PrincipalGuard)
  public async deleteManyByPrincipalAndDbRecordAssociationIds(
    @Principal() principal: OrganizationUserEntity,
    @Query('ids') ids: string,
  ): Promise<DbRecordAssociationDeleteResult[]> {
    return await this.dbRecordAssociationService.deleteManyByAssociationIds(principal, ids);
  }

  /**
   * Delete an association by Primary Id
   * @param principal
   * @param dbRecordAssociationId
   */
  @Delete(':dbRecordAssociationId')
  @UseGuards(PrincipalGuard)
  public async deleteByPrincipalAndAssociationId(
    @Principal() principal: OrganizationUserEntity,
    @Param('dbRecordAssociationId', ParseUUIDPipe) dbRecordAssociationId: string,
  ): Promise<DbRecordAssociationDeleteResult> {
    return await this.dbRecordAssociationService.deleteRelatedRecordById(principal, dbRecordAssociationId);
  }

  /**
   * Transfer associations from one record to another record
   * @param principal
   * @param transferorId
   * @param transfereeId
   * @param body
   */
  @Put('transfer/:transferorId/:transfereeId')
  @UseGuards(PrincipalGuard)
  public async transferAssociationsByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Param('transferorId', ParseUUIDPipe) transferorId: string,
    @Param('transfereeId', ParseUUIDPipe) transfereeId: string,
    @Body() body: DbRecordAssociationCreateUpdateDto[],
  ): Promise<DbRecordAssociationEntity[]> {
    return await this.dbRecordAssociationService.transferRelatedRecords(
      principal,
      transferorId,
      transfereeId,
      body,
    );
  }

}
