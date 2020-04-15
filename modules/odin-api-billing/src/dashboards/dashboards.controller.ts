import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Controller, Post, Get, Param, UseGuards, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmptyRequest } from './dashboards.dto';
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
    @ApiOperation({ summary: "Count of invoices expected to be created in the last bill run" })
    @Post('invoices/plan_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getInvoicesCreatedPlanLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getInvoicesCreatedPlanLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
         @ApiOperation({ summary: "Breakdown of invoices expected to be created in the last bill run" })
         @Post('invoices/plan_breakdown_last_bill_run')
         @UseGuards(PrincipalGuard)
         async getInvoicesBreakdownCreatedPlanLastBillRun(
             @Principal() principal: OrganizationUserEntity,
             @Body() body: EmptyRequest,
         ): Promise<any> {
     
             return await this.dashboardsService.getInvoicesBreakdownCreatedPlanLastBillRun(principal, body);
     
         }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "Count of invoices created in the last bill run" })
    @Post('invoices/fact_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getInvoicesCreatedFactLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getInvoicesCreatedFactLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
         @ApiOperation({ summary: "Breakdown of invoices created in the last bill run" })
         @Post('invoices/fact_breakdown_last_bill_run')
         @UseGuards(PrincipalGuard)
         async getInvoicesBreakdownCreatedFactLastBillRun(
             @Principal() principal: OrganizationUserEntity,
             @Body() body: EmptyRequest,
         ): Promise<any> {
     
             return await this.dashboardsService.getInvoicesBreakdownCreatedFactLastBillRun(principal, body);
     
         }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "Number of invoices where processed in the last bill run" })
    @Post('invoices/processed_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getInvoicesProcessedLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getInvoicesProcessedLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "Number of transactions created during the last bill run" })
    @Post('transactions/created_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getTransactionsCreatedLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getTransactionsCreatedLastBillRun(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "Number of transactions updated since the last bill run" })
    @Post('transactions/updated_since_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getTransactionsUpdatedSinceLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getTransactionsUpdatedSinceLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "Number of invoices are scheduled to be processed in the last bill run" })
    @Post('invoices/scheduled_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getInvoicesScheduledLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getInvoicesScheduledLastBillRun(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "List breakdown of invoices where processed" })
    @Post('invoices/processed_breakdown_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getInvoicesBreakdownProcessedLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getInvoicesBreakdownProcessedLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "List breakdown of transactions created during the bill run" })
    @Post('transactions/created_breakdown_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getTransactionsBreakdownCreatedLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getTransactionsBreakdownCreatedLastBillRun(principal, body);

    }


    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "List breakdown of transactions updated since the last bill run" })
    @Post('transactions/updated_breakdown_since_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getTransactionsBreakdownUpdatedSinceLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getTransactionsBreakdownUpdatedSinceLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "List breakdown of transactions created since the last bill run" })
    @Post('transactions/created_breakdown_since_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getTransactionsBreakdownCreatedSinceLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

       return await this.dashboardsService.getTransactionsBreakdownCreatedSinceLastBillRun(principal, body);

    }

    /**
     * @param principal
     * @param body
     */
    @ApiOperation({ summary: "List breakdown of invoices are scheduled to be processed" })
    @Post('invoices/scheduled_breakdown_last_bill_run')
    @UseGuards(PrincipalGuard)
    async getInvoicesBreakdownScheduledLastBillRun(
        @Principal() principal: OrganizationUserEntity,
        @Body() body: EmptyRequest,
    ): Promise<any> {

        return await this.dashboardsService.getInvoicesBreakdownScheduledLastBillRun(principal, body);

    }


}
