import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SearchDecoratorsPageable } from '@d19n/models/dist/search/decorators/search.decorators.pageable';
import { SearchDecoratorsSearchable } from '@d19n/models/dist/search/decorators/search.decorators.searchable';
import { SearchPageableType } from '@d19n/models/dist/search/search.pageable.type';
import { SearchQueryTypeHttp } from '@d19n/models/dist/search/search.query.type.http';
import { SearchResponseType } from '@d19n/models/dist/search/search.response.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DbRecordQueueResponse, DbService } from './db.service';
import { DbRecordDeleted } from './types/db.record.deleted';
import { DbRecordMergeDto } from './types/db.record.merge.dto';


@ApiTags('DB Records')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/db`)
export class DbController {

  private readonly dbService: DbService;

  public constructor(dbService: DbService) {
    this.dbService = dbService;
  }

  /**
   *
   * @param principal
   * @param entityName
   * @param request
   * @param response
   * @param pageable
   * @param query
   * @param file
   * @param userFields
   */
  @ApiBearerAuth()
  @ApiQuery({ name: 'terms', example: '*', required: false })
  @ApiQuery({ name: 'page', example: '0', required: true })
  @ApiQuery({ name: 'size', example: 5, required: true })
  @ApiQuery({ name: 'schemas', example: '', required: false })
  @ApiQuery({ name: 'fields', example: '*', required: false })
  @ApiQuery({ name: 'boolean', example: '', required: false })
  @ApiQuery({ name: 'recordId', example: '', required: false })
  @ApiQuery({ name: 'findInSchema', example: '', required: false })
  @ApiQuery({ name: 'findInChildSchema', example: '', required: false })
  @ApiQuery({ name: 'file', example: true, required: false })
  @ApiQuery({ name: 'user_fields', example: '[]', required: false })
  @Get(':entityName/search')
  @UseGuards(PrincipalGuard)
  public async searchByOrganizationEntity(
    @Principal() principal,
    @Req() request,
    @Res() response,
    @Param('entityName') entityName: string,
    @SearchDecoratorsPageable() pageable: SearchPageableType,
    @SearchDecoratorsSearchable() query: SearchQueryTypeHttp,
    @Query('file') file: boolean = false,
    @Query('user_fields') userFields?: string,
  ): Promise<SearchResponseType<any>> {
    const res = await this.dbService.searchDbRecordsByPrincipalWithFileSupport(
      principal,
      query,
      file,
      entityName,
      userFields,
    );
    if(!file || res.sentToEmail) {
      return response.status(res.statusCode || 200).json(res);
    }
    response.header('Content-Type', 'text/csv');
    response.attachment(`${entityName}.csv`);
    return response.send(res)
  }

  /**
   *
   * @param {OrganizationUserEntity} principal
   * @param query
   * @param body
   */
  @Post('/batch')
  @ApiQuery({
    name: 'upsert',
    example: 'false',
    description: 'this will update if exists or create new records',
    required: false,
  })
  @ApiQuery({
    name: 'queue',
    example: 'false',
    description: 'this will queue all records individually to be created',
    required: false,
  })
  @ApiQuery({
    name: 'queueAndRelate',
    example: 'false',
    description: 'this will queue all records and create relationships',
    required: false,
  })
  @ApiBody({ isArray: true, type: DbRecordCreateUpdateDto })
  @ApiResponse({ status: 201, description: 'records created successfully' })
  @UseGuards(PrincipalGuard)
  public async updateOrCreateByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Query() query: any,
    @Body() body: DbRecordCreateUpdateDto[],
  ): Promise<IDbRecordCreateUpdateRes[] | DbRecordQueueResponse> {

    return await this.dbService.batchCreate(principal, body, query);

  }

  /**
   *
   * @param principal
   * @param body
   */
  @Post('/merge')
  @ApiBody({ type: DbRecordMergeDto, isArray: false })
  @UseGuards(PrincipalGuard)
  public async getDbRecordMetaDataById(
    @Principal() principal: OrganizationUserEntity,
    @Body() body: DbRecordMergeDto,
  ): Promise<IDbRecordCreateUpdateRes> {
    return await this.dbService.mergeRecordsByOrganization(principal, body);
  }

  /**
   * Create data record(s).
   *
   * @param principal
   * @param entityName
   * @param query
   * @param body
   */
  @Post(':entityName')
  @ApiQuery({ name: 'upsert', example: 'false', description: 'can be true | false', required: false })
  @ApiBody({ isArray: true, type: DbRecordCreateUpdateDto })
  @ApiResponse({ status: 201, description: 'records created successfully' })
  @UseGuards(PrincipalGuard)
  public async updateOrCreateDbRecordsByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Query() query: any,
    @Body() body: DbRecordCreateUpdateDto[],
  ): Promise<IDbRecordCreateUpdateRes[]> {

    return await this.dbService.updateOrCreateDbRecordsByPrincipal(principal, body, query);

  }

  /**
   *
   * @param principal
   * @param recordId
   * @param entityName
   * @param query
   */
  @Get('many')
  @ApiQuery({
    name: 'ids',
    example: 'id1,id2,id3',
    description: 'get many records by id',
    required: false,
  })
  @UseGuards(PrincipalGuard)
  public async getManyDbRecordTransformedByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Query() query: any,
  ): Promise<DbRecordEntityTransform[]> {
    return await this.dbService.getManyDbRecordTransformedByOrganizationAndId(
      principal,
      query['ids'],
    );
  }


  /**
   *
   * @param principal
   * @param recordId
   * @param entityName
   * @param query
   */
  @Get(':entityName/:recordId')
  @ApiQuery({
    name: 'entities',
    example: '["Order"]',
    description: 'load related record properties',
    required: false,
  })
  @ApiQuery({
    name: 'filters',
    example: '["Role:Primary", "Status:Active"]',
    description: 'return entities matching these filters',
    required: false,
  })
  @UseGuards(PrincipalGuard)
  public async getDbRecordTransformedByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Query() query: any,
  ): Promise<DbRecordEntityTransform> {
    return await this.dbService.getDbRecordTransformedByOrganizationAndId(
      principal,
      recordId,
      query['entities'],
      query['filters'],
    );
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param entityName
   * @param query
   */
  @Get('byExternalId/:entityName/:externalId')
  @ApiQuery({
    name: 'entities',
    example: '["Order"]',
    description: 'load related record properties',
    required: false,
  })
  @UseGuards(PrincipalGuard)
  public async getDbRecordTransformedByOrganizationAndExternalId(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Param('externalId') externalId: string,
    @Query() query: any,
  ): Promise<DbRecordEntityTransform> {
    return await this.dbService.getDbRecordTransformedByOrganizationAndExternalId(
      principal,
      externalId,
      query['entities'],
    );
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param entityName
   * @param body
   */
  @Put(':entityName/:recordId')
  @UseGuards(PrincipalGuard)
  public async updateDbRecordsByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
    @Body() body: DbRecordCreateUpdateDto,
  ): Promise<IDbRecordCreateUpdateRes> {
    return await this.dbService.updateDbRecordsByPrincipalAndId(principal, recordId, body);
  }

  /**
   *
   * @param principal
   * @param recordId
   * @param entityName
   */
  @Delete(':entityName/:recordId')
  @UseGuards(PrincipalGuard)
  public async deleteByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('entityName') entityName: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
  ): Promise<DbRecordDeleted[]> {
    return await this.dbService.deleteByPrincipalAndId(principal, recordId);
  }

}

