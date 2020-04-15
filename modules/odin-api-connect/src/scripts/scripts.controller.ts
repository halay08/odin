import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndexDbService } from './search-indexing/index.db.service';


@ApiTags('Scripts')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/scripts`)
export class ScriptsController {

    constructor(
        private readonly indexDbService: IndexDbService,
    ) {
        this.indexDbService = indexDbService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param entityName
     */
    @Get('indexSingleEntity/:entityName')
    @ApiQuery({ name: 'dateInterval', example: '30 minutes', required: false })
    @ApiQuery({ name: 'from', example: '2020-06-01', required: false })
    @ApiQuery({ name: 'to', example: '2020-07-01', required: false })
    @UseGuards(PrincipalGuard)
    public async indexSingleEntity(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('entityName') entityName: string,
        @Query('dateInterval') dateInterval: string,
        @Query('from') from: string,
        @Query('to') to: string,
    ): Promise<ApiResponseType<any>> {

        const res = await this.indexDbService.indexSingleEntity(entityName, dateInterval, from,to);
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param entityName
     */
    @Get('indexAllEntities')
    @UseGuards(PrincipalGuard)
    public async indexAllEntities(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
    ): Promise<ApiResponseType<any>> {

        const res = await this.indexDbService.indexAllEntities();
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }
}
