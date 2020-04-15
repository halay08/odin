import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ISipwiseGetCustomers } from '../interfaces/interfaces';
import { VoiceSipwiseCustomerService } from './voice.sipwise.customer.service';


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
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/sipwise/customers`)
export class VoiceSipwiseCustomerController {

    private voiceSipwiseCustomerService: VoiceSipwiseCustomerService;

    constructor(voiceSipwiseCustomerService: VoiceSipwiseCustomerService) {
        this.voiceSipwiseCustomerService = voiceSipwiseCustomerService;
    }

    /**
     *
     * @param principal
     * @param query
     */
    @Get()
    @ApiQuery({
        name: 'contact_id',
        example: '123',
        description: 'get customers by contact id',
        required: false,
    })
    @UseGuards(PrincipalGuard)
    public async getCustomers(
        @Principal() principal: OrganizationUserEntity,
        @Query() query: ISipwiseGetCustomers,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerService.searchCustomers(principal, query);
    }

    /**
     *
     * @param principal
     * @param customerId
     */
    @Get(':customerId')
    @UseGuards(PrincipalGuard)
    public async getCustomerById(
        @Principal() principal: OrganizationUserEntity,
        @Param('customerId') customerId: string,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerService.getCustomerById(principal, customerId);
    }

    /**
     *
     * @param principal
     * @param customerId
     */
    @Delete(':customerId')
    @UseGuards(PrincipalGuard)
    public async deleteCustomerById(
        @Principal() principal: OrganizationUserEntity,
        @Param('customerId') customerId: string,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerService.deleteCustomerById(principal, customerId);
    }


}
