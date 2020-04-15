import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUpdateEeroNetwork } from './interfaces/eero.networks.interfaces';
import { NetworkEeroNetworksService } from './network.eero.networks.service';

@ApiTags('Eero Networks')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/network/eero/networks`)
export class NetworkEeroNetworksController {

    private networkEeroNetworksService: NetworkEeroNetworksService;

    constructor(networkEeroNetworksService: NetworkEeroNetworksService) {

        this.networkEeroNetworksService = networkEeroNetworksService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Get(':networkId')
    @UseGuards(PrincipalGuard)
    public async getDetailsByNetworkId(
        @Principal() principal: OrganizationUserEntity,
        @Param('networkId') networkId: string,
    ): Promise<any> {
        return await this.networkEeroNetworksService.getDetailsByNetworkId(principal, networkId);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Put(':networkId/label')
    @UseGuards(PrincipalGuard)
    public async updateNetworkHomeIdentifier(
        @Principal() principal: OrganizationUserEntity,
        @Param('networkId') networkId: string,
        @Body() body: IUpdateEeroNetwork,
    ): Promise<any> {
        return await this.networkEeroNetworksService.updateNetworkHomeIdentifier(principal, networkId, body);
    }

}
