import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VoiceSipwiseSubscriberPreferenceDto } from './dto/voice.sipwise.subscriber.preference.dto';
import { VoiceSipwiseSubscriberPreferenceService } from './voice.sipwise.subscriber.preference.service';


@ApiTags('Sipwise Subscriber Preferences')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/sipwise/subscriberpreferences`)
export class VoiceSipwiseSubscriberPreferenceController {

    private voiceSipwiseSubscriberService: VoiceSipwiseSubscriberPreferenceService;

    constructor(voiceSipwiseSubscriberService: VoiceSipwiseSubscriberPreferenceService) {
        this.voiceSipwiseSubscriberService = voiceSipwiseSubscriberService;
    }

    /**
     *
     * @param principal
     * @param subscriberId
     */
    @Get(':subscriberId')
    @UseGuards(PrincipalGuard)
    public async getSubscriberByExternalId(
        @Principal() principal: OrganizationUserEntity,
        @Param('subscriberId') subscriberId: string,
    ): Promise<any> {
        console.log('subscriberId', subscriberId);
        return await this.voiceSipwiseSubscriberService.getSubscriberPreferenceBySubscriberId(principal, subscriberId);
    }

    /**
     *
     * @param principal
     * @param subscriberId
     * @param body
     */
    @Put(':subscriberId')
    @UseGuards(PrincipalGuard)
    public async updateSubscriberPreferenceBySubscriberId(
        @Principal() principal: OrganizationUserEntity,
        @Param('subscriberId') subscriberId: string,
        @Body() body: VoiceSipwiseSubscriberPreferenceDto,
    ): Promise<any> {
        console.log('subscriberId', subscriberId);
        return await this.voiceSipwiseSubscriberService.updateSubscriberPreferenceBySubscriberId(
            principal,
            subscriberId,
            body,
        );
    }


}
