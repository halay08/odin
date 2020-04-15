import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { SchemaColumnEntity } from "@d19n/models/dist/schema-manager/schema/column/schema.column.entity";
import { HasPermissions } from "@d19n/common/dist/decorators/HasPermissions";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { SchemasColumnsService } from './schemas.columns.service';
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { Principal } from "@d19n/common/dist/decorators/Principal";
import { PrincipalGuard } from "@d19n/client/dist/guards/PrincipalGuard";
import { PermissionsGuard } from "@d19n/client/dist/guards/PermissionsGuard";
import { SchemaColumnCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto";


@ApiTags('Schemas Columns')
@ApiBearerAuth()
@ApiResponse({ status: 200, type: ApiResponseType, description: "" })
@ApiResponse({ status: 201, type: ApiResponseType, description: "" })
@ApiResponse({ status: 401, type: ExceptionType, description: "Unauthorized" })
@ApiResponse({ status: 404, type: ExceptionType, description: "Not found" })
@ApiResponse({ status: 422, type: ExceptionType, description: "Unprocessable entity validation failed" })
@ApiResponse({ status: 500, type: ExceptionType, description: "Internal server error" })
@Controller(`/${process.env.MODULE_NAME}/v1.0/schemas/:schemaId/columns`)
export class SchemasColumnsController {

  private readonly schemaColumnsService: SchemasColumnsService;

  public constructor(schemaColumnsService: SchemasColumnsService) {
    this.schemaColumnsService = schemaColumnsService;
  }

  /**
   * Create a new SchemaColumn.
   *
   * @param principal
   * @param {string} schemaId
   * @param body
   *
   */
  @Post()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.create')
  public async createByPrincipalAndSchema(
    @Principal() principal,
    @Param('schemaId') schemaId: string,
    @Body() body: SchemaColumnCreateUpdateDto,
  ): Promise<SchemaColumnEntity> {
    return await this.schemaColumnsService.createByPrincipal(principal, schemaId, body);
  }

  /**
   *
   * @param principal
   * @param schemaId
   * @param body
   */
  @Put('/batch')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.update')
  public async batchUpdateOrCreateByOrganizationEntity(
    @Principal() principal,
    @Param('schemaId') schemaId: string,
    @Body() body: SchemaColumnCreateUpdateDto[],
  ): Promise<SchemaColumnEntity[]> {
    return await this.schemaColumnsService.updateOrCreateByPrincipal(principal, schemaId, body);
  }

  /**
   *
   * @param principal
   * @param {string} schemaId
   *
   */
  @Get()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.search')
  public async getByOrganizationAndSchemaId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
  ): Promise<SchemaColumnEntity[]> {
    return await this.schemaColumnsService.getSchemaColumnsByOrganizationAndSchemaId(principal.organization, schemaId);
  }

  /**
   *
   * @param principal
   * @param {string} schemaId
   * @param {string} columnId
   *
   */
  @Get('/:columnId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.get')
  public async getByOrganizationAndSchemaIdAndId(
    @Principal() principal,
    @Param('schemaId') schemaId: string,
    @Param('columnId') columnId: string,
  ): Promise<SchemaColumnEntity> {
    return await this.schemaColumnsService.getByOrganizationAndSchemaIdAndId(
      principal.organization,
      schemaId,
      columnId,
    );
  }

  /**
   *
   * @param principal
   * @param {string} schemaId
   * @param {string} columnId
   * @param body
   */
  @Put('/:columnId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.update')
  public async updateByPrincipalAndSchemaIdAndId(
    @Principal() principal,
    @Param('schemaId') schemaId: string,
    @Param('columnId') columnId: string,
    @Body() body: SchemaColumnCreateUpdateDto,
  ): Promise<SchemaColumnEntity> {
    return await this.schemaColumnsService.updateByPrincipalAndSchemaIdAndId(principal, schemaId, columnId, body);
  }

  /**
   *
   * @param principal
   * @param {string} schemaId
   * @param {string} columnId
   *
   */
  @Delete('/:columnId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.delete')
  public async deleteByPrincipalAndSchemaAndId(
    @Principal() principal,
    @Param('schemaId') schemaId: string,
    @Param('columnId') columnId: string,
  ): Promise<{ affected: number }> {
    return await this.schemaColumnsService.deleteByPrincipalAndSchemaAndId(principal, schemaId, columnId);
  }

}
