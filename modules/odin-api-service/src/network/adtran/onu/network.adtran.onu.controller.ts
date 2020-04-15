import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkAdtranOnuService } from './network.adtran.onu.service';


@ApiTags('Adtran ONT')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/network/adtran/onu`)
export class NetworkAdtranOnuController {

    private networkAdtranOnuService: NetworkAdtranOnuService;

    constructor(networkAdtranOnuService: NetworkAdtranOnuService) {
        this.networkAdtranOnuService = networkAdtranOnuService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':custDeviceId/activate')
    @UseGuards(PrincipalGuard)
    public async activateService(
        @Principal() principal: OrganizationUserEntity,
        @Param('custDeviceId') custDeviceId: string,
    ): Promise<any> {
        return await this.networkAdtranOnuService.addOnu(principal, custDeviceId);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':custDeviceId/deactivate')
    @UseGuards(PrincipalGuard)
    public async deactivateService(
        @Principal() principal: OrganizationUserEntity,
        @Param('custDeviceId') custDeviceId: string,
    ): Promise<any> {
        return await this.networkAdtranOnuService.removeOnu(principal, custDeviceId);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':custDeviceId/check')
    @UseGuards(PrincipalGuard)
    public async checkServiceByOrderItem(
        @Principal() principal: OrganizationUserEntity,
        @Param('custDeviceId') custDeviceId: string,
    ): Promise<any> {
        return await this.networkAdtranOnuService.checkOnuStatus(principal, custDeviceId);
    }
}

