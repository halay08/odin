import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';


@ApiTags('Reporting')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/reporting`)
export class ReportingController {

    private readonly reportingService: ReportingService;

    constructor(reportingService: ReportingService) {
        this.reportingService = reportingService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param query
     */
    @Get('premises-passed')
    @UseGuards(PrincipalGuard)
    public async premisesPassed(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
    ): Promise<ApiResponseType<any>> {
        const res = await this.reportingService.premisesPassed(principal);
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
    @Get('pipelines-overview')
    @UseGuards(PrincipalGuard)
    public async pipelinesOverview(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: { moduleName: string, entityName: string, },
    ): Promise<ApiResponseType<any>> {
        const res = await this.reportingService.pipelinesOverview(principal, query);
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
    @Get('orders-overview')
    @UseGuards(PrincipalGuard)
    public async ordersOverview(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: { orderStageKey: string },
    ): Promise<ApiResponseType<any>> {
        const res = await this.reportingService.ordersOverview(principal, query);
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
    @Get('/orders-no-mandate')
    @UseGuards(PrincipalGuard)
    public async ordersNoPaymentMethods(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: { startDate: string, endDate: string, },
    ): Promise<ApiResponseType<any>> {
        const res = await this.reportingService.ordersNoPaymentMethods(principal);
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
    @Get('/orders-inactive-mandate')
    @UseGuards(PrincipalGuard)
    public async ordersInactivePaymentMethods(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: { startDate: string, endDate: string, },
    ): Promise<ApiResponseType<any>> {
        const res = await this.reportingService.ordersInactivePaymentMethods(principal);
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
    @Get('bill-runs')
    @UseGuards(PrincipalGuard)
    public async billRunReports(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Query() query: { startDate: string, endDate: string, },
    ): Promise<ApiResponseType<any>> {
        const res = await this.reportingService.billRunReports(principal);
        const apiResponse = new ApiResponseType<any>(200, 'success', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


}
