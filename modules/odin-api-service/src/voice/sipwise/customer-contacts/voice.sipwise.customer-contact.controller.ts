import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VoiceSipwiseCustomerContactService } from './voice.sipwise.customer-contact.service';


@ApiTags('Sipwise Customer Contacts')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/sipwise/customercontacts`)
export class VoiceSipwiseCustomerContactController {

    private voiceSipwiseCustomerContactService: VoiceSipwiseCustomerContactService;

    constructor(voiceSipwiseCustomerContactService: VoiceSipwiseCustomerContactService) {
        this.voiceSipwiseCustomerContactService = voiceSipwiseCustomerContactService;
    }

    /**
     *
     * @param principal
     */
    @Post(':odnOrderId')
    @UseGuards(PrincipalGuard)
    public async createCustomerContact(
        @Principal() principal: OrganizationUserEntity,
        @Param('odnOrderId', ParseUUIDPipe) odnOrderId: string,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerContactService.createCustomerContact(principal, odnOrderId);
    }

    /**
     *
     * @param principal
     */
    @Get()
    @UseGuards(PrincipalGuard)
    public async listCustomerContacts(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerContactService.listCustomerContacts(principal);
    }

    /**
     *
     * @param principal
     */
    @Get(':customerContactId')
    @UseGuards(PrincipalGuard)
    public async getCustomerContactById(
        @Principal() principal: OrganizationUserEntity,
        @Param('customerContactId') customerContactId: string,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerContactService.getCustomerContactsById(principal, customerContactId);
    }


    /**
     *
     * @param principal
     * @param customerId
     */
    @Delete(':customerContactId')
    @UseGuards(PrincipalGuard)
    public async deleteCustomerContactById(
        @Principal() principal: OrganizationUserEntity,
        @Param('customerContactId') customerContactId: string,
    ): Promise<any> {
        return await this.voiceSipwiseCustomerContactService.deleteCustomerContactById(principal, customerContactId);
    }


}
