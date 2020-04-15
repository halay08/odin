import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkAdtranOnuDataService } from './network.adtran.onu.data.service';


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
@Controller(`/${process.env.MODULE_NAME}/v1.0/network/adtranont/data`)
export class NetworkAdtranOnuDataController {

    private networkAdtranOntService: NetworkAdtranOnuDataService;

    constructor(networkAdtranOntService: NetworkAdtranOnuDataService) {
        this.networkAdtranOntService = networkAdtranOntService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':orderItemId/activate')
    @UseGuards(PrincipalGuard)
    public async activateService(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderItemId') orderItemId: string,
    ): Promise<any> {
        return await this.networkAdtranOntService.activateServiceByOrderItemId(principal, orderItemId);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':orderItemId/deactivate')
    @UseGuards(PrincipalGuard)
    public async deactivateService(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderItemId') orderItemId: string,
    ): Promise<any> {
        return await this.networkAdtranOntService.deactivateServiceByOrderItemId(principal, orderItemId);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':orderItemId/check')
    @UseGuards(PrincipalGuard)
    public async checkServiceByOrderItem(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderItemId') orderItemId: string,
    ): Promise<any> {
        return await this.networkAdtranOntService.checkServiceByOrderItemId(principal, orderItemId);
    }
}

