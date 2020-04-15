import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { SchemaAssociationEntity } from "@d19n/models/dist/schema-manager/schema/association/schema.association.entity";
import { HasPermissions } from "@d19n/common/dist/decorators/HasPermissions";
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { SchemasAssociationsService } from './schemas.associations.service';
import { Principal } from "@d19n/common/dist/decorators/Principal";
import { PrincipalGuard } from "@d19n/client/dist/guards/PrincipalGuard";
import { PermissionsGuard } from "@d19n/client/dist/guards/PermissionsGuard";
import { SchemaAssociationCreateUpdateDto } from "@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto";
import { DbRecordAssociationConstants } from "@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants";

@ApiTags('Schemas Associations')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: "" })
@ApiResponse({ status: 201, type: ApiResponseType, description: "" })
@ApiResponse({ status: 401, type: ExceptionType, description: "Unauthorized" })
@ApiResponse({ status: 404, type: ExceptionType, description: "Not found" })
@ApiResponse({ status: 422, type: ExceptionType, description: "Unprocessable entity validation failed" })
@ApiResponse({ status: 500, type: ExceptionType, description: "Internal server error" })
@Controller(`/${process.env.MODULE_NAME}/v1.0/schemas/:schemaId/associations`)
export class SchemasAssociationsController {

  private readonly associationService: SchemasAssociationsService;

  public constructor(associationService: SchemasAssociationsService) {
    this.associationService = associationService;
  }

  /**
   *
   * @param principal
   * @param schemaId
   *
   * @param direction
   */
  @Get("/:direction/unique_associations")
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.get')
  public async getAssociationsByOrganizationAndSchemaIdAndDirection(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
    @Param("direction") direction: DbRecordAssociationConstants,
  ): Promise<SchemaAssociationEntity[]> {
    return await this.associationService.getAssociationsByOrganizationAndSchemaIdAndDirection(
      principal.organization,
      schemaId,
      direction,
    );
  }

  /**
   *
   * @param {OrganizationUserEntity} principal
   * @param schemaId
   * @param {SchemaAssociationCreateUpdateDto} body
   */
  @Post()
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.create')
  public async createSchemaAssociationByPrincipal(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
    @Body() body: SchemaAssociationCreateUpdateDto,
  ): Promise<SchemaAssociationEntity> {
    return await this.associationService.createSchemaAssociationByPrincipal(principal, schemaId, body);
  }

  /**
   *
   * @param principal
   * @param schemaId
   * @param associationId
   *
   */
  @Get("/:associationId")
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.get')
  public async getSchemaAssociationByOrganizationAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
    @Param("associationId") associationId: string,
  ): Promise<SchemaAssociationEntity> {
    return await this.associationService.getSchemaAssociationByOrganizationAndId(principal.organization, associationId);
  }


  /**
   *
   * @param principal
   * @param schemaId
   * @param associationId
   * @param body
   */
  @Put("/:associationId")
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.update')
  public async updateSchemaAssociationByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
    @Param("associationId") associationId: string,
    @Body() body: SchemaAssociationCreateUpdateDto,
  ): Promise<SchemaAssociationEntity> {
    return await this.associationService.updateSchemaAssociationByPrincipalAndId(principal, associationId, body);
  }


  /**
   *
   * @param principal
   * @param schemaId
   * @param associationId
   */
  @Delete("/:associationId")
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.delete')
  public async deleteSchemaAssociationByPrincipalAndId(
    @Principal() principal: OrganizationUserEntity,
    @Param('schemaId') schemaId: string,
    @Param("associationId") associationId: string,
  ): Promise<{ affected: number }> {
    return await this.associationService.deleteSchemaAssociationByPrincipalAndId(principal, associationId);
  }

}
