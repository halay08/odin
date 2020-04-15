import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GisOsService } from './gis.os.service';


@Controller(`/${process.env.MODULE_NAME}/v1.0/os`)
@ApiTags('Ordinance Survey')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
export class GisOsController {

    private gisOsService: GisOsService;

    constructor(
        gisOsService: GisOsService,
    ) {
        this.gisOsService = gisOsService;
    }

    /**
     *
     * @param principal
     * @param polygonId
     */
    @Get('/premises/:polygonId')
    @UseGuards(PrincipalGuard)
    async getPremisesByPolygonId(
        @Principal() principal: OrganizationUserEntity,
        @Param('polygonId') polygonId: string,
    ): Promise<any> {

        return await this.gisOsService.getPremisesByPolygonId(principal, polygonId);

    }

    /**
     *
     * @param principal
     */
    @Get('/premises-passed')
    @UseGuards(PrincipalGuard)
    async PremisesPassed(
        @Principal() principal: OrganizationUserEntity,
    ): Promise<any> {

        return await this.gisOsService.premisesPassed(principal);

    }

}
