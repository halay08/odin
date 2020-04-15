import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { Body, Controller, Get, Headers, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OpsPremiseCreateUpdate, PremisesService } from './premises.service';


@ApiTags('Premise')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/premises`)
export class PremisesController {

    private premisesService: PremisesService;

    constructor(premisesService: PremisesService) {
        this.premisesService = premisesService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param udprn
     * @param umprn
     * @param body
     */
    @ApiParam({ name: 'umprn', required: false })
    @Get('/:udprn/:umprn')
    @UseGuards(PrincipalGuard)
    public async getPremiseByUdprnAndUmprnAndOrganization(
        @Principal() principal: OrganizationUserEntity,
        @Headers() headers,
        @Param('udprn') udprn: string,
        @Param('umprn') umprn: string,
    ): Promise<any> {
        console.log('get', udprn, umprn);
        return await this.premisesService.getPremiseByUdprnAndUmprnAndOrganization(principal, udprn, umprn);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param udprn
     * @param umprn
     * @param body
     */
    @Post('/:udprn/:umprn/visit')
    @ApiBody({ isArray: false, type: DbRecordCreateUpdateDto })
    @UseGuards(PrincipalGuard)
    public async createNewVisit(
        @Principal() principal: OrganizationUserEntity,
        @Headers() headers,
        @Param('udprn') udprn: string,
        @Param('umprn') umprn: string,
        @Body() body: DbRecordCreateUpdateDto,
    ): Promise<any> {
        return await this.premisesService.createNewVisit(principal, udprn, umprn, body);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    @Patch('ops')
    @ApiBody({ isArray: false, type: DbRecordCreateUpdateDto })
    @UseGuards(PrincipalGuard)
    public async updateCreateOpsPremiseStatusByPrincipal(
        @Principal() principal: OrganizationUserEntity,
        @Headers() headers,
        @Body() body: OpsPremiseCreateUpdate[],
    ): Promise<any> {
        return await this.premisesService.bulkUpdateCreateOpsPremiseStatusByPrincipal(principal, body);
    }

}
