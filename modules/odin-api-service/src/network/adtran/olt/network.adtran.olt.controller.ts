import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkAdtranOltService } from './network.adtran.olt.service';


@ApiTags('Network OLT')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/network/adtranolt`)
export class NetworkAdtranOltController {

    private networkAdtranOltService: NetworkAdtranOltService;

    constructor(networkAdtranOltService: NetworkAdtranOltService) {
        this.networkAdtranOltService = networkAdtranOltService;
    }

    /**
     *
     * @param principal
     * @param oltIp
     */
    @Get(':oltIp/configXml')
    @UseGuards(PrincipalGuard)
    public async getConfig(
        @Principal() principal: OrganizationUserEntity,
        @Param('oltIp') oltIp: string,
    ): Promise<any> {
        return await this.networkAdtranOltService.getConfigXml(oltIp);
    }

    /**
     *
     * @param principal
     * @param oltIp
     */
    @Get(':oltIp/configJson')
    @UseGuards(PrincipalGuard)
    public async parseOltConfig(
        @Principal() principal: OrganizationUserEntity,
        @Param('oltIp') oltIp: string,
    ): Promise<any> {
        return await this.networkAdtranOltService.getConfigJson(principal, oltIp);
    }

    /**
     *
     * @param principal
     * @param oltIp
     * @param port
     * @param onuId
     */
    @Get(':oltIp/devices/:port/:onuId')
    @UseGuards(PrincipalGuard)
    public async getStatus(
        @Principal() principal: OrganizationUserEntity,
        @Param('oltIp') oltIp: string,
        @Param('port') port: string,
        @Param('onuId') onuId: string,
    ): Promise<any> {
        return await this.networkAdtranOltService.getOnuStatus(principal, { oltIp, port, onuId });
    }

    /**
     *
     * @param principal
     * @param oltIp
     */
    @Post(':oltIp/initialize')
    @UseGuards(PrincipalGuard)
    public async initializeNewOltWithDefaultOnus(
        @Principal() principal: OrganizationUserEntity,
        @Param('oltIp') oltIp: string,
    ): Promise<any> {
        return await this.networkAdtranOltService.initializeNewOltWithDefaultOnus(principal, oltIp);
    }

}

