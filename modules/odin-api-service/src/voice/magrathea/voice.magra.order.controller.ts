import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VoiceMagraOrderService } from './voice.magra.order.service';


@ApiTags('Sipwise Customer')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/magra/order`)
export class VoiceMagraOrderController {

    private voiceMagraService: VoiceMagraOrderService;

    constructor(voiceMagraService: VoiceMagraOrderService) {
        this.voiceMagraService = voiceMagraService;
    }

    /**
     *
     * @param principal
     */
    @Get('listall')
    @UseGuards(PrincipalGuard)
    public async listAllOrders(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<any> {
        return await this.voiceMagraService.listAllOrders(principal);
    }

    /**
     *
     * @param principal
     */
    @Get('listcurrent')
    @UseGuards(PrincipalGuard)
    public async listCurrentOrders(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<any> {
        return await this.voiceMagraService.listCurrentOrders(principal);
    }

    /**
     *
     * @param principal
     * @param odnOrderId
     */
    @Post(':odnPortingId')
    @UseGuards(PrincipalGuard)
    public async createCustomerContact(
        @Principal() principal: OrganizationUserEntity,
        @Param('odnPortingId', ParseUUIDPipe) odnPortingId: string,
    ): Promise<any> {
        return await this.voiceMagraService.createNewPhonePortingOrder(principal, odnPortingId);
    }

    /**
     *
     * @param principal
     */
    @Get(':magraOrderId')
    @UseGuards(PrincipalGuard)
    public async getPhonePortingOrderById(
        @Principal() principal: OrganizationUserEntity,
        @Param('magraOrderId') magraOrderId: string,
    ): Promise<any> {
        return await this.voiceMagraService.getPortingOrderById(principal, magraOrderId);
    }


}
