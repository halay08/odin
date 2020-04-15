import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Post, Get, Param, UseGuards, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { FromToRequest } from './dashboards.dto';
import { DashboardsService } from './dashboards.service';


@Controller(`/${process.env.MODULE_NAME}/v1.0/dashboards`)
@ApiTags('Dashboards')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: 'Successful' })
@ApiResponse({ status: 201, type: ApiResponseType, description: 'Created' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
export class DashboardsController {

    private dashboardsService: DashboardsService;

    constructor(
        dashboardsService: DashboardsService,
    ) {
        this.dashboardsService = dashboardsService;
    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total visits in the period selected"})
    @Post('visits/total')
    @UseGuards(PrincipalGuard)
    async getTotalVisits(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getTotalVisits(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total visits % change compared to the previous period selected"})
    @Post('visits/change')
    @UseGuards(PrincipalGuard)
    async getTotalVisitsChange(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getTotalVisitsChange(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total visits grouped by Outcome in the period selected"})
    @Post('visits/by_outcome')
    @UseGuards(PrincipalGuard)
    async getVisitsByOutcome(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getVisitsByOutcome(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total visits grouped by user who created the visits in the period selected"})
    @Post('visits/by_user')
    @UseGuards(PrincipalGuard)
    async getVisitsByUsers(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getVisitsByUsers(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total visits grouped by NotInterestedReason in the period selected"})
    @Post('visits/by_notinterestedreason')
    @UseGuards(PrincipalGuard)
    async getVisitsByNotInterestedReason(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getVisitsByNotInterestedReason(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total leads in the period selected"})
    @Post('leads/total')
    @UseGuards(PrincipalGuard)
    async getLeads(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getLeads(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total leads grouped by Source in the period selected"})
    @Post('leads/by_source')
    @UseGuards(PrincipalGuard)
    async getLeadsBySource(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getLeadsBySource(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total leads grouped by user who created the leads in the period selected"})
    @Post('leads/by_user')
    @UseGuards(PrincipalGuard)
    async getLeadsByUser(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getLeadsByUser(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Total leads grouped by Address SalesStatus in the period selected"})
    @Post('leads/by_salesstatus')
    @UseGuards(PrincipalGuard)
    async getLeadsBySalesStatus(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getLeadsBySalesStatus(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({summary: "Leads that have an address sales status ORDER or PRE_ORDER and do not have an active order ie (not cancelled)"})
    @Post('leads/by_salesstatus_in_order_preorder')
    @UseGuards(PrincipalGuard)
    async getLeadsBySalesStatusInOrderPreOrderNotCancelled(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: FromToRequest,
    ): Promise<any> {

        return await this.dashboardsService.getLeadsBySalesStatusInOrderPreOrderNotCancelled(principal, body);

    }
    

}
