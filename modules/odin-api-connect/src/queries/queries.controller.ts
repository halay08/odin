import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryCreateUpdateDto } from './queries.create.update.dto';
import { QueriesService } from './queries.service';
import { IRecordQuery } from './types/queries.standard.interface';


@ApiTags('Queries')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/queries`)
export class QueriesController {

    private queriesService: QueriesService;

    constructor(queriesService: QueriesService) {
        this.queriesService = queriesService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param body
     */
    @Post()
    @UseGuards(PrincipalGuard)
    public async saveQueryByPrincipal(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: QueryCreateUpdateDto,
    ): Promise<ApiResponseType<any>> {
        console.log('create', body);
        const res = await this.queriesService.saveQueryByPrincipal(principal, body);
        const apiResponse = new ApiResponseType<any>(201, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param query
     */
    @Get()
    @ApiQuery({ name: 'name', example: 'Order', required: true })
    @UseGuards(PrincipalGuard)
    public async getQueryByPrincipalAndName(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: { [key: string]: any },
    ): Promise<ApiResponseType<any>> {
        const res = await this.queriesService.getQueryByPrincipalAndName(principal, query);
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param query
     */
    @Get('run')
    @UseGuards(PrincipalGuard)
    public async runQueryByPrincipalAndName(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: IRecordQuery,
    ): Promise<ApiResponseType<any>> {
        const res = await this.queriesService.runQueryByPrincipalAndName(principal, query);
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param queryId
     * @param body
     */
    @Put(':queryId')
    @UseGuards(PrincipalGuard)
    public async updateQueryByPrincipalAndName(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('queryId', ParseUUIDPipe) queryId: string,
        @Body() body: QueryCreateUpdateDto,
    ): Promise<ApiResponseType<any>> {
        const res = await this.queriesService.updateQueryByPrincipalAndName(principal, queryId, body);
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param queryId
     * @param body
     */
    @Delete(':queryId')
    @UseGuards(PrincipalGuard)
    public async deleteByPrincipalAndId(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('queryId', ParseUUIDPipe) queryId: string,
    ): Promise<ApiResponseType<any>> {
        const res = await this.queriesService.deleteByPrincipalAndId(principal, queryId);
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);
    }

}

