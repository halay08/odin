import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { SchemaTypeCreateDto } from '@d19n/models/dist/schema-manager/schema/types/dto/schema.type.create.dto';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { SchemasTypesService } from './schemas.types.service';

@ApiTags('Schemas Types')
@ApiBearerAuth()
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/schemas/:schemaId/types`)
export class SchemasTypesController {


  public constructor(private schemasTypesService: SchemasTypesService) {
    this.schemasTypesService = schemasTypesService;
  }

  /**
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
    @Body() body: SchemaTypeCreateDto,
  ): Promise<SchemaTypeEntity> {
    return await this.schemasTypesService.createByPrincipal(principal, schemaId, body);
  }

  /**
   *
   * @param principal
   * @param {string} schemaId
   * @param body
   *
   */
  @Delete(':schemaTypeId')
  @UseGuards(PrincipalGuard, PermissionsGuard)
  @HasPermissions('schemas.delete')
  public async deleteByPrincipalAndId(
    @Principal() principal,
    @Param('schemaId') schemaId: string,
    @Param('schemaTypeId') schemaTypeId: string,
  ): Promise<DeleteResult> {

    return await this.schemasTypesService.deleteByPrincipalAndId(principal, schemaId, schemaTypeId);

  }

}
