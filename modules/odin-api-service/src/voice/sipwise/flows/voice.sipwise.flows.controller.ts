import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VoiceSipwiseFlowsService } from './voice.sipwise.flows.service';


@ApiTags('Sipwise Flows')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/voice/sipwise/flows`)
export class VoiceSipwiseFlowsController {

    private voiceSipwiseFlowsService: VoiceSipwiseFlowsService;

    constructor(voiceSipwiseFlowsService: VoiceSipwiseFlowsService) {
        this.voiceSipwiseFlowsService = voiceSipwiseFlowsService;
    }

    /**
     *
     * @param principal
     * @param odnOrderId
     */
    @Post(':odnOrderId/setup')
    @UseGuards(PrincipalGuard)
    public async setupNewCustomer(
        @Principal() principal: OrganizationUserEntity,
        @Param('odnOrderId', ParseUUIDPipe) odnOrderId: string,
    ): Promise<any> {
        return await this.voiceSipwiseFlowsService.setupNewCustomer(principal, odnOrderId);
    }


}
