import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserCreate } from '@d19n/models/dist/identity/organization/user/organization.user.create';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserUpdate } from '@d19n/models/dist/identity/organization/user/organization.user.update';
import { IdentityOrganizationUserChangePassword } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.change.password';
import { IdentityOrganizationUserForgotPassword } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.forgot.password';
import { IdentityOrganizationUserLogin } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.login';
import { IdentityOrganizationUserRegister } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.register';
import { IdentityOrganizationUserResetPassword } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.reset.password';
import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Ip,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { JWTResponse } from '../../utilities/JWTResponse';
import { OrganizationUserEntityLoginHistoryService } from './authentication/organizations.users.authentication.login.history.service';
import { OrganizationUsersService } from './organizations.users.service';

dotenv.config();

/**
 * OrganizationUserEntity management api.
 */
@ApiTags('Organization Users')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/users`)
export class OrganizationUserEntitysController {

    public static JWT_EXPIRY = 86400;

    private readonly usersService: OrganizationUsersService;
    private readonly userLoginHistoryService: OrganizationUserEntityLoginHistoryService;

    public constructor(
        usersService: OrganizationUsersService,
        userLoginHistoryService: OrganizationUserEntityLoginHistoryService,
    ) {
        this.usersService = usersService;
        this.userLoginHistoryService = userLoginHistoryService;
    }

    /**
     *
     * @param login
     * @param request
     * @param response
     * @param reqIp
     */
    @Post('/login')
    public async login(
        @Body() login: IdentityOrganizationUserLogin,
        @Req() request,
        @Res() response,
        @Ip() reqIp,
    ): Promise<JWTResponse> {

        const user = await this.usersService.login(login);
        if(user) {
            const token = jwt.sign(
                { id: user.id },
                process.env.JWT_TOKEN_SECRET,
                { expiresIn: OrganizationUserEntitysController.JWT_EXPIRY },
            );
            const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
            const authenticatedOrganizationUserEntity = await this.usersService.getOrganizationUserEntityById(decoded['id']);
            await this.userLoginHistoryService.recordLoginEvent(
                authenticatedOrganizationUserEntity.organization,
                authenticatedOrganizationUserEntity,
                'login',
                reqIp.ip,
            );
            return response.status(200).json({ expiresIn: OrganizationUserEntitysController.JWT_EXPIRY, token });
        } else {
            throw new ExceptionType(404, 'user not found');
        }
    }

    /**
     *
     * @param headers
     */
    @Get('/my')
    public async getMyProfile(
        @Headers() headers,
    ): Promise<OrganizationUserEntity> {

        if(!headers.authorization) {
            throw new ExceptionType(403, 'forbidden, no token provided');
        }

        const split = headers.authorization.split(' ');

        const decoded = jwt.verify(split[1], process.env.JWT_TOKEN_SECRET || 'secret');

        return await this.usersService.getOrganizationUserEntityById(decoded['id']);
    }


    /**
     *
     * @param userRegister
     */
    @Post('/register')
    @ApiResponse({ status: 201, type: ApiResponseType, description: '' })
    public async register(
        @Body() userRegister: IdentityOrganizationUserRegister,
    ): Promise<OrganizationUserEntity> {
        const user = await this.usersService.register(userRegister);
        if(user) {
            return user;
        } else {
            throw new ExceptionType(404, 'forbidden');
        }
    }

    /**
     *
     * @param principal
     * @param changePassword
     */
    @Post('/change-password')
    @UseGuards(PrincipalGuard)
    public async changePasswordByPrincipal(
        @Principal() principal,
        @Body() changePassword: IdentityOrganizationUserChangePassword,
    ): Promise<OrganizationUserEntity> {
        return await this.usersService.changePassword(principal, changePassword);
    }

    /**
     *
     * @param body
     * @param reqIp
     */
    @Post('/forgot-password')
    public async forgotPasswordByEmail(
        @Body() body: IdentityOrganizationUserForgotPassword,
        @Ip() reqIp,
    ): Promise<OrganizationUserEntity> {
        const res: OrganizationUserEntity = await this.usersService.forgotPasswordByEmail(body);
        await this.userLoginHistoryService.recordLoginEvent(res.organization, res, 'forgot_password', reqIp.ip);
        return res;
    }

    /**
     *
     * @param token
     * @param body
     * @param reqIp
     */
    @Post('/reset-password/:token')
    public async resetPasswordByToken(
        @Param('token') token: string,
        @Body() body: IdentityOrganizationUserResetPassword,
        @Ip() reqIp,
    ): Promise<OrganizationUserEntity> {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        const res: OrganizationUserEntity = await this.usersService.resetPassword(decoded['id'], body);
        await this.userLoginHistoryService.recordLoginEvent(res.organization, res, 'password_reset', reqIp.ip);
        return res;
    }

    /**
     *
     * @param principal
     * @param userId
     * @param roleIds
     */
    @Post('/:userId/roles')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('users.update')
    public async roleAssign(
        @Principal() principal: OrganizationUserEntity,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Body('roleIds') roleIds: string[],
    ): Promise<OrganizationUserEntity> {
        return await this.usersService.addRolesToUser(principal, userId, roleIds);
    }

    /**
     *
     * @param principal
     */
    @Get('/byorg')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('users.search')
    public async getByPrincipalOrganizationEntity(@Principal() principal): Promise<OrganizationUserEntity[]> {

        return await this.usersService.getByOrganizationEntity(principal.organization);

    }

    /**
     *
     * @param principal
     * @param userId
     */
    @Get('/byorg/:userId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('users.search')
    public async getByIdAndPrincipalOrganizationEntity(
        @Principal() principal,
        @Param('userId', ParseUUIDPipe) userId: string,
    ): Promise<OrganizationUserEntity> {
        return await this.usersService.getByIdAndPrincipalOrganizationEntity(principal.organization, userId);
    }

    /**
     *
     * @param principal
     * @param body
     */
    @Post()
    @ApiResponse({ status: 201, type: ApiResponseType, description: '' })
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('users.create')
    public async createByPrincipalOrganizationEntity(
        @Principal() principal,
        @Body() body: OrganizationUserCreate,
    ): Promise<OrganizationUserEntity> {
        return await this.usersService.createByOrganizationEntity(principal, body);
    }

    /**
     *
     * @param principal
     * @param userId
     * @param groupId
     */
    @Post('/:userId/groups')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('users.update')
    public async groupAdd(
        @Principal() principal: OrganizationUserEntity,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Body('groupIds') groupIds: string[],
    ): Promise<OrganizationUserEntity> {
        return await this.usersService.groupAdd(principal, userId, groupIds);
    }

    /**
     *
     * @param principal
     * @param userId
     * @param groupId
     */
    @Delete('/:userId/groups/:groupId')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    @HasPermissions('users.update')
    public async groupRemove(
        @Principal() principal: OrganizationUserEntity,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Param('groupId', ParseUUIDPipe) groupId: string,
    ): Promise<boolean> {
        return await this.usersService.groupRemove(principal, userId, groupId);
    }

    /**
     *
     * @param token
     * @param reqIp
     */
    @Patch('activate/:token')
    public async activateOrganizationUserEntityById(
        @Param('token') token: string,
        @Ip() reqIp,
    ): Promise<OrganizationUserEntity> {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
        const res: OrganizationUserEntity = await this.usersService.activateOrganizationUserEntityById(decoded['id']);
        await this.userLoginHistoryService.recordLoginEvent(res.organization, res, 'activated', reqIp.ip);
        return res;
    }

    /**
     *
     * @param principal
     * @param userId
     * @param body
     */
    @Put('/:userId')
    @UseGuards(PrincipalGuard)
    public async updateByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('userId') userId: string,
        @Body() body: OrganizationUserUpdate,
    ): Promise<OrganizationUserEntity> {
        return await this.usersService.updateByPrincipalAndId(principal, userId, body);
    }

    /**
     *
     * @param principal
     * @param userId
     */
    @Delete('/:userId')
    @UseGuards(PrincipalGuard)
    public async deleteByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('userId') userId: string,
    ): Promise<{ affected: number }> {
        return await this.usersService.deleteByPrincipalAndId(principal, userId);
    }
}
