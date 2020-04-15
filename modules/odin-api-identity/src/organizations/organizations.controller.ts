import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { SERVICE_NAME } from '@d19n/client/dist/helpers/Services';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationEntitysService } from './organizations.service';
import { OrganizationInterface } from './users/interfaces/organization.inteface';

@ApiBearerAuth()
@ApiTags('Organizations')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${SERVICE_NAME.IDENTITY_MODULE}/v1.0/organizations`)
export class OrganizationEntitysController {

    private readonly organizationsService: OrganizationEntitysService;

    public constructor(organizationsService: OrganizationEntitysService) {
        this.organizationsService = organizationsService;
    }

    @Post()
    public create(@Body() organization: OrganizationEntity): Promise<OrganizationEntity> {
        return this.organizationsService.create(organization);
    }

    /**
     *
     * @param principal
     * @param organizationId
     */
    @Get('/getById/:organizationId')
    @UseGuards(PrincipalGuard)
    public async getByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('organizationId') organizationId: string,
    ): Promise<OrganizationEntity> {
        return await this.organizationsService.getOrganizationByPrincipalAndId(principal, organizationId);
    }

    /**
     *
     * @param organizationId
     * @param body
     */
    @Put('/:organizationId')
    @UseGuards(PrincipalGuard)
    public async updateByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('organizationId') organizationId: string,
        @Body() body: OrganizationInterface,
    ): Promise<OrganizationEntity> {
        return await this.organizationsService.updateOrganizationByPrincipalAndId(principal, organizationId, body);
    }

    /**
     *
     * @param principal
     * @param organizationId
     */
    @Delete('/:organizationId')
    @UseGuards(PrincipalGuard)
    public async deleteByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Param('organizationId') organizationId: string,
    ): Promise<{ affected: number }> {
        return await this.organizationsService.deleteByPrincipalAndId(principal, organizationId);
    }

}
