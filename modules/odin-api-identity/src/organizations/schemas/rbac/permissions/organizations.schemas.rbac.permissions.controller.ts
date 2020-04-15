import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse } from '@nestjs/swagger';
import { OrganizationsSchemasRbacPermissionsService } from './organizations.schemas.rbac.permissions.service';

@ApiTags('RBAC')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: "" })
@ApiResponse({ status: 201, type: ApiResponseType, description: "" })
@ApiResponse({ status: 401, type: ExceptionType, description: "Unauthorized" })
@ApiResponse({ status: 404, type: ExceptionType, description: "Not found" })
@ApiResponse({ status: 422, type: ExceptionType, description: "Unprocessable entity validation failed" })
@ApiResponse({ status: 500, type: ExceptionType, description: "Internal server error" })

@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/rbac/permissions/schemas`)
export class OrganizationsSchemasRbacPermissionsController {
    private readonly schemasPermissionsService: OrganizationsSchemasRbacPermissionsService;

    public constructor(schemasPermissionsService: OrganizationsSchemasRbacPermissionsService) {
        this.schemasPermissionsService = schemasPermissionsService;
    }

    @Get('/:schemaId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.search')
    public async getByOrganizationEntity(
        @Principal() principal: OrganizationUserEntity,
        @Param('schemaId') schemaId: string,
        ): Promise<SchemaEntity> {
            return await this.schemasPermissionsService.getSchemaById(principal, schemaId);
    }

    /**
     *
     * @param principal
     * @param schemaId
     */

    @Post('/batch/:schemaId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.create')
    public async batchCreate(
        @Principal() principal: OrganizationUserEntity,
        @Param('schemaId', ParseUUIDPipe) schemaId: string,
    ): Promise<OrganizationUserRbacPermissionEntity[]> {
        return await this.schemasPermissionsService.batchCreateByPrincipal(principal, schemaId);
    }

    /**
     *
     * @param principal
     * @param schemaId
     */
    @Delete('/batch/:schemaId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.delete')
    public async batchDeleteByPrincipalAndSchemaId(
        @Principal() principal: OrganizationUserEntity,
        @Param('schemaId', ParseUUIDPipe) schemaId: string
    ): Promise<{affected: number}> {
       return await this.schemasPermissionsService.batchDeleteByPrincipalAndId(principal, schemaId);
    }
}
