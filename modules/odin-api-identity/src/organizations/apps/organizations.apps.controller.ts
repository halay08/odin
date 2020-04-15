import { PermissionsGuard } from '@d19n/client/dist/guards/PermissionsGuard';
import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { HasPermissions } from '@d19n/common/dist/decorators/HasPermissions';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { OrganizationsAppsService } from './organizations.apps.service';

@ApiTags('Connected Apps')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/organizations/apps`)
export class OrganizationsAppsController {

    public constructor(private readonly connectedAppService: OrganizationsAppsService) {
    }

    /**
     *
     * @param principal
     */
    @Get()
    @UseGuards(PrincipalGuard)
    public async listByOrganizationEntity(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<OrganizationAppEntity[]> {
        console.log('list org apps');
        return await this.connectedAppService.listByOrganizationEntity(principal.organization);
    }

    /**
     *
     * @param principal
     * @param appId
     */
    @Get('/:appId')
    @UseGuards(PrincipalGuard)
    public async getByOrganizationAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('appId') appId: string,
    ): Promise<OrganizationAppEntity> {
        return await this.connectedAppService.getByOrganizationAndId(principal.organization, appId);
    }

    /**
     *
     * @param principal
     */
    @Get()
    @UseGuards(PrincipalGuard)
    public async search(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<OrganizationAppEntity[]> {
        return await this.connectedAppService.search(principal.organization);
    }

    /**
     *
     * @param principal
     */
    @Get('getByName/:appName')
    @UseGuards(PrincipalGuard)
    public async getByOrganizationAppName(
        @Principal() principal: OrganizationUserEntity,
        @Param('appName') appName: string,
    ): Promise<OrganizationAppEntity> {
        return await this.connectedAppService.getByOrganizationAppName(principal.organization, appName);
    }

    /**
     *
     * @param principal
     * @param connectedApp
     */
    @Post()
    @UseGuards(PrincipalGuard)
    public async create(
        @Principal() principal: OrganizationUserEntity,
        @Body() connectedApp: OrganizationAppEntity,
    ): Promise<OrganizationAppEntity> {
        return await this.connectedAppService.create(principal, connectedApp);
    }

    /**
     *
     * @param principal
     * @param id
     */
    @Delete('/:id')
    @HasPermissions('rbac.tokens.delete')
    @UseGuards(PrincipalGuard, PermissionsGuard)
    public deleteByIdAndOrganizationEntity(
        @Principal() principal: OrganizationUserEntity,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<DeleteResult> {
        return this.connectedAppService.deleteByIdAndOrganizationEntity(principal, id);
    }

    /**
     *
     * @param principal
     * @param appId
     * @param connectedApp
     */
    @Put('/:appId')
    @UseGuards(PrincipalGuard)
    public async updateByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('appId') appId: string,
        @Body() connectedApp: OrganizationAppEntity,
    ): Promise<OrganizationAppEntity> {
        return await this.connectedAppService.update(principal, appId, connectedApp);
    }

}
