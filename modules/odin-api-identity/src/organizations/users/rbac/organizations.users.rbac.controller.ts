import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { Body, Controller, forwardRef, Headers, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { OrganizationUsersService } from '../organizations.users.service';
import { OrganizationsUsersRbacService } from './organizations.users.rbac.service';
import { OrganizationsUsersRbacPermissionsService } from './permissions/organizations.users.rbac.permissions.service';
import { OrganizationsUsersRbacRolesService } from './roles/organizations.users.rbac.roles.service';
import { RBACCreate } from './types/RBACCreate';

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
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/rbac`)
export class OrganizationsUsersRbacController {

    private readonly rbacService: OrganizationsUsersRbacService;
    private readonly rolesService: OrganizationsUsersRbacRolesService;
    private readonly permissionsService: OrganizationsUsersRbacPermissionsService;
    private readonly usersService: OrganizationUsersService;

    public constructor(
        @Inject(forwardRef(() => OrganizationUsersService)) usersService: OrganizationUsersService,
        rbacService: OrganizationsUsersRbacService,
        rolesService: OrganizationsUsersRbacRolesService,
        permissionsService: OrganizationsUsersRbacPermissionsService,
    ) {

        this.rbacService = rbacService;
        this.rolesService = rolesService;
        this.permissionsService = permissionsService;
        this.usersService = usersService;

    }

    @Post('initialize')
    @ApiQuery({
        name: 'initializeToken',
        required: true,
    })
    public async initializeAdmin(
        @Headers() headers,
        @Query('initializeToken') initializeToken: string,
    ): Promise<boolean> {

        const initializeSecret = 'fa4f29c7-6606-4d6d-8121-5d5d5f1a6aac';

        if(initializeToken !== initializeSecret) {
            throw new ExceptionType(401, 'not authorized, initialize token invalid');
        }

        if(!headers.authorization) {
            throw new ExceptionType(401, 'unauthorized, no token provided');
        }

        const split = headers.authorization.split(' ');
        const decoded = jwt.verify(split[1], process.env.JWT_TOKEN_SECRET || 'change');
        const principal: OrganizationUserEntity = await this.usersService.getOrganizationUserEntityById(decoded['id']);
        await this.rbacService.initializeAdmin(principal);

        return true;

    }

    /**
     *
     * @param principal
     * @param body
     */
    @Post('admin')
    @UseGuards(PrincipalGuard)
    public async createEntityAdminByPrincipal(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: RBACCreate,
    ): Promise<OrganizationUserRbacRoleEntity> {
        return await this.rbacService.createRoleAndPermissionsByPrincipal(principal, body);
    }

}
