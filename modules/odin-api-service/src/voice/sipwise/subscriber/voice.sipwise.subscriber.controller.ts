import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ISipwiseGetSubscribers } from '../interfaces/interfaces';
import { VoiceSipwiseSubscriberService } from './voice.sipwise.subscriber.service';


@ApiTags('Sipwise Subscriber')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/sipwise/subscribers`)
export class VoiceSipwiseSubscriberController {

    private voiceSipwiseSubscriberService: VoiceSipwiseSubscriberService;

    constructor(voiceSipwiseSubscriberService: VoiceSipwiseSubscriberService) {
        this.voiceSipwiseSubscriberService = voiceSipwiseSubscriberService;
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
    public async getSubscriberByExternalId(
        @Principal() principal: OrganizationUserEntity,
        @Query() query: ISipwiseGetSubscribers,
    ): Promise<any> {
        console.log('query', query);
        return await this.voiceSipwiseSubscriberService.searchSubscribers(principal, query);
    }

    /**
     *
     * @param principal
     * @param customerId
     */
    @Delete(':subscriberId')
    @UseGuards(PrincipalGuard)
    public async terminateSubscriberById(
        @Principal() principal: OrganizationUserEntity,
        @Param('subscriberId') subscriberId: string,
    ): Promise<any> {
        return await this.voiceSipwiseSubscriberService.terminateSubscriberById(principal, subscriberId);
    }

}
