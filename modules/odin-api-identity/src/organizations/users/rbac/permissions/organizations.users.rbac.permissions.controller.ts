import { HasPermissions } from "@d19n/common/dist/decorators/HasPermissions";
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags} from '@nestjs/swagger';
import { OrganizationsUsersRbacPermissionsService } from './organizations.users.rbac.permissions.service';
import { RBACPermissionCreate } from './types/RBACPermissionCreate';
import { ApiResponseType } from "@d19n/common/dist/http/types/ApiResponseType";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { Principal } from "@d19n/common/dist/decorators/Principal";
import { SERVICE_NAME } from "@d19n/client/dist/helpers/Services";
import { PermissionsGuard } from "@d19n/client/dist/guards/PermissionsGuard";
import { PrincipalGuard } from "@d19n/client/dist/guards/PrincipalGuard";

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
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/rbac/permissions`)
export class OrganizationsUsersRbacPermissionsController {

    private readonly permissionsService: OrganizationsUsersRbacPermissionsService;

    public constructor(permissionsService: OrganizationsUsersRbacPermissionsService) {
        this.permissionsService = permissionsService;
    }


    @Post()
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.create')
    public async create(
        @Principal() principal: OrganizationUserEntity,
        @Body() permissionCreate: RBACPermissionCreate
    ): Promise<OrganizationUserRbacPermissionEntity> {
      return await this.permissionsService.create(principal, permissionCreate);
    }

    /**
     *
     * @param principal
     * @param permissionId
     */
    @Get('/:permissionId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.search')
    public async getByOrganizationAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('permissionId', ParseUUIDPipe) permissionId: string,
    ): Promise<OrganizationUserRbacPermissionEntity> {
        return await this.permissionsService.getByOrganizationAndId(principal.organization, permissionId);
    }


    @Delete('/:permissionId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.delete')
    public async deleteByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('permissionId', ParseUUIDPipe) permissionId: string
    ): Promise<boolean> {
       return await this.permissionsService.deleteByPrincipalAndId(principal, permissionId);
    }


    @Get()
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('permissions.search')
    public async getByOrganizationEntity(
        @Principal() principal: OrganizationUserEntity,
        ): Promise<OrganizationUserRbacPermissionEntity[]> {
            return await this.permissionsService.getByOrganizationEntity(principal.organization);
    }


}
