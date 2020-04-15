import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkEeroEerosService } from './network.eero.eeros.service';

@ApiTags('Eero eeros')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/network/eero/eeros`)
export class NetworkEeroEerosController {

    private networkEeroEerosService: NetworkEeroEerosService;

    constructor(networkEeroEerosService: NetworkEeroEerosService) {

        this.networkEeroEerosService = networkEeroEerosService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Get(':serialNumber')
    @UseGuards(PrincipalGuard)
    public async getConfig(
        @Principal() principal: OrganizationUserEntity,
        @Param('serialNumber') serialNumber: string,
    ): Promise<any> {
        return await this.networkEeroEerosService.getBySerialNumber(principal, serialNumber);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post(':serialNumber/speedtest')
    @UseGuards(PrincipalGuard)
    public async runSpeedTest(
        @Principal() principal: OrganizationUserEntity,
        @Param('serialNumber') serialNumber: string,
    ): Promise<any> {
        return await this.networkEeroEerosService.runSpeedTest(principal, serialNumber);
    }

}
