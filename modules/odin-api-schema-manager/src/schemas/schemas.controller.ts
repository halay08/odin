import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaEntityTransform } from '@d19n/models/dist/schema-manager/schema/transform/schema.entity.transform';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SchemasService } from './schemas.service';


@ApiTags('Schemas')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/schemas`)
export class SchemasController {

  private readonly schemasService: SchemasService;

  public constructor(schemasService: SchemasService) {
    this.schemasService = schemasService;
  }

  /**
   * @param {OrganizationUserEntity} principal
   * @param body
   * @param query
   */
  @Post()
  @ApiQuery({ name: 'upsert', example: 'upsert', required: false })
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.create')
  public async createByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Body() body: SchemaCreateUpdateDto,
    @Query() query: { upsert: boolean },
  ): Promise<SchemaEntity> {
    return await this.schemasService.createSchemaByPrincipal(principal, body, query);
  }

  /**
   * @param {OrganizationUserEntity} principal
   * @param schemaId
   * @param body
   */
  @Put(':schemaId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.update')
  public async updateByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId', ParseUUIDPipe) schemaId: string,
    @Body() body: SchemaCreateUpdateDto,
  ): Promise<SchemaEntity> {
    return await this.schemasService.updateSchemaByPrincipalAndId(principal, schemaId, body);
  }

  /**
   * @param {OrganizationUserEntity} principal
   */
  @Get()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.search')
  public async listByOrganizationEntity(@Principal() principal: OrganizationUserEntity): Promise<SchemaEntity[]> {
    return await this.schemasService.listSchemasByOrganization(principal);
  }

  /**
   * @param {OrganizationUserEntity} principal
   * @param {string} moduleName
   * @param {string} entityName
   * @param relations
   */
  @Get('bymodule')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @ApiQuery({ name: 'relations', example: '["columns"]', required: false })
  @ApiQuery({ name: 'entityName', example: 'contacts', required: false })
  @ApiQuery({ name: 'withAssociations', example: 'true', required: false })
  @HasPermissions('schemas.get')
  public async getByOrganizationAndModule(
    @Principal() principal: OrganizationUserEntity,
    @Query('moduleName') moduleName: string,
    @Query('entityName') entityName: string,
    @Query('withAssociations') withAssociations: string,
  ): Promise<SchemaEntity> {

    if(withAssociations) {

      return await this.schemasService.getFullSchemaByOrganizationAndModuleAndEntity(
        principal,
        moduleName,
        entityName,
      );

    } else {

      return await this.schemasService.getSchemaByOrganizationAndModuleAndEntity(
        principal,
        moduleName,
        entityName,
      )
    }

  }

  /**
   * @param principal
   * @param schemaId
   * @param query
   *
   */
  @Get(':schemaId')
  @ApiQuery({ name: 'format', example: 'transform', required: false })
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.get')
  public async getSchemaTemplateByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
    @Query() query: any,
  ): Promise<SchemaEntity | SchemaEntityTransform> {

    if(query['format'] === 'transform') {
      return await this.schemasService.getSchemaByOrganizationAndIdWithAssociationsTransformed(
        principal,
        { schemaId },
      );
    }
    return await this.schemasService.getSchemaByOrganizationAndIdWithAssociations(
      principal,
      { schemaId },
    );
  }

  /**
   * @param principal
   * @param schemaId
   *
   */
  @Get('newRecordNumber/:schemaId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.get')
  public async generateNewRecordNumber(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
  ): Promise<SchemaEntity> {
    return await this.schemasService.generateNewRecordNumberFromSchema(principal, schemaId);
  }

  /**
   * @param {OrganizationUserEntity} principal
   * @param schemaId
   */
  @Delete(':schemaId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.delete')
  public async deleteByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId', ParseUUIDPipe) schemaId: string,
  ): Promise<{ affected: number }> {
    return await this.schemasService.deleteSchemaByPrincipalAndId(principal, schemaId);
  }
}
