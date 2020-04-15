import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VoiceSipwisePhoneNumbersService } from './voice.sipwise.phone-numbers.service';


@ApiTags('Sipwise Phone Numbers')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/sipwise/phonenumbers`)
export class VoiceSipwisePhoneNumbersController {

    private voiceSipwisePhoneNumbersService: VoiceSipwisePhoneNumbersService;

    constructor(voiceSipwisePhoneNumbersService: VoiceSipwisePhoneNumbersService) {
        this.voiceSipwisePhoneNumbersService = voiceSipwisePhoneNumbersService;
    }

    /**
     *
     * @param principal
     * @param query
     */
    @Get(':orderId')
    @UseGuards(PrincipalGuard)
    public async getSubscriberByExternalId(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId') orderId: string,
    ): Promise<any> {
        console.log('orderId', orderId);
        return await this.voiceSipwisePhoneNumbersService.getPhoneNumbersByOrderId(principal, orderId);
    }

}
