import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { MilestoneBuildPack } from './types/milestone.buildpack';


@ApiBearerAuth()
@ApiTags('Milestones API')
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`/${process.env.MODULE_NAME}/v1.0/Milestone`)
export class MilestonesController {

    constructor(
        private milestonesService: MilestonesService,
    ) {

        this.milestonesService = milestonesService;
    }

    /**
     *
     * @param principal
     * @param res
     * @param milestoneId
     */
    @Get('/build-pack/:milestoneId')
    @UseGuards(PrincipalGuard)
    async getDataForBuildPackByMilestoneId(
        @Principal() principal: OrganizationUserEntity,
        @Res() res: any,
        @Param('milestoneId') milestoneId: string,
    ): Promise<MilestoneBuildPack> {
           const result = await this.milestonesService.getDataForBuildPackByMilestoneId(principal, milestoneId);
           return res.json(result);
    }

}
