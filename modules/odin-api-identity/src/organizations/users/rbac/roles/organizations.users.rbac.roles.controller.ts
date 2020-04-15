import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsUsersRbacPermissionsService } from '../permissions/organizations.users.rbac.permissions.service';
import { OrganizationsUsersRbacRolesService } from './organizations.users.rbac.roles.service';
import { RBACRoleCreate } from './types/RBACRoleCreate';

@ApiTags('RBAC')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/rbac/roles`)
export class OrganizationsUsersRbacRolesController {

    private readonly rolesService: OrganizationsUsersRbacRolesService;
    private readonly permissionsService: OrganizationsUsersRbacPermissionsService;

    public constructor(
        rolesService: OrganizationsUsersRbacRolesService,
        permissionsService: OrganizationsUsersRbacPermissionsService,
    ) {
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
    }

    /**
     *
     * @param principal
     */
    @Get()
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.search')
    public async search(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<OrganizationUserRbacRoleEntity[]> {
        return await this.rolesService.search(principal.organization);
    }

    /**
     *
     * @param principal
     * @param roleId
     */
    @Get('/:roleId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.get')
    public async getByOrganizationAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return await this.rolesService.getByOrganizationAndId(principal.organization, roleId);
    }

    /**
     *
     * @param principal
     * @param roleId
     */
    @Delete('/:roleId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.delete')
    public async deleteByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
    ): Promise<{ affected: number }> {
        return await this.rolesService.deleteByPrincipalAndId(principal, roleId);
    }

    /**
     *
     * @param principal
     * @param roleId
     * @param permissionIds
     */
    @Post('/:roleId/permissions')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async addPermissionToRole(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Body() body: any,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return await this.rolesService.addPermissionsToRole(principal, roleId, body.permissionIds);
    }

    /**
     *
     * @param principal
     * @param roleId
     * @param userIds
     */
    @Post('/:roleId/users')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async assignRoleToUsers(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Body('userIds') userIds: string[],
    ): Promise<OrganizationUserRbacRoleEntity> {
        return await this.rolesService.assignUsersToRole(principal, roleId, userIds);
    }

    /**
     *
     * @param principal
     * @param roleId
     * @param permissionId
     */
    @Delete('/:roleId/permissions/:permissionId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async removePermissionFromRole(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Param('permissionId', ParseUUIDPipe) permissionId: string,
    ): Promise<boolean> {
        return await this.rolesService.permissionRemove(principal.organization, roleId, permissionId);
    }

    /**
     *
     * @param principal
     * @param roleId
     * @param userId
     */
    @Post('/:roleId/users/:userId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async assignRoleToUser(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Param('userId', ParseUUIDPipe) userId: string,
    ): Promise<boolean> {
        return await this.rolesService.assignToOrganizationUserEntity(principal, roleId, userId);
    }

    /**
     *
     * @param principal
     * @param roleId
     * @param userId
     */
    @Delete('/:roleId/users/:userId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.delete')
    public async unassignRoleFromUser(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Param('userId', ParseUUIDPipe) userId: string,
    ): Promise<boolean> {
        return await this.rolesService.unassignFromOrganizationUserEntity(principal, roleId, userId);
    }

    /**
     *
     * @param principal
     * @param role
     */
    @Post()
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async createByPrincipal(
        @Principal() principal: OrganizationUserEntity,
        @Body() role: RBACRoleCreate,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return await this.rolesService.createByPrincipal(principal, role);
    }

    /**
     *
     * @param principal
     * @param roleId
     */
    @Get('/:roleId/users')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async listRolesAssignedUsers(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
    ): Promise<OrganizationUserEntity[]> {
        return await this.rolesService.getOrganizationUserEntitiesByGroupIdAndOrganizationEntity(
            principal.organization,
            roleId,
        );
    }


    /**
     *
     * @param principal
     * @param roleId
     */
    @Get('/:roleId/links')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.get')
    public async listRolesAssignedRoles(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
    ): Promise<OrganizationUserRbacRoleEntity[]> {
        return await this.rolesService.linksGet(principal.organization, roleId);
    }


    /**
     *
     * @param principal
     * @param roleId
     * @param roleToLinkId
     */
    @Post('/:roleId/links')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.create')
    public async assignRoleToRole(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Body() body: any,
    ): Promise<boolean> {
        return await this.rolesService.linkRolesToRole(principal, roleId, body.roleIds);
    }


    /**
     *
     * @param principal
     * @param roleId
     * @param roleToUnlinkId
     */
    @Delete('/:roleId/links/:roleToUnlinkId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('roles.delete')
    public async removeRoleFromRole(
        @Principal() principal: OrganizationUserEntity,
        @Param('roleId', ParseUUIDPipe) roleId: string,
        @Param('roleToUnlinkId', ParseUUIDPipe) roleToUnlinkId: string,
    ): Promise<boolean> {
        return await this.rolesService.linkRemove(principal, roleId, roleToUnlinkId);
    }

}
