import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GocardlessRefundsService } from './gocardless.refunds.service';
import { GocardlessRefundEntity } from './types/gocardless.refund.entity';

@ApiTags('Gocardless Refunds')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/gocardless/refunds`)
export class GocardlessRefundsController {

    private gocardlessRefundsService: GocardlessRefundsService;

    constructor(gocardlessRefundsService: GocardlessRefundsService) {
        this.gocardlessRefundsService = gocardlessRefundsService;
    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     */
    @Get()
    @UseGuards(PrincipalGuard)
    public async listPayments(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
    ): Promise<ApiResponseType<GocardlessRefundEntity[]>> {

        const res: GocardlessRefundEntity[] = await this.gocardlessRefundsService.listRefunds(principal);
        const apiResponse = new ApiResponseType<GocardlessRefundEntity[]>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param body
     */
    @Post()
    @UseGuards(PrincipalGuard)
    public async createPayment(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Body() body: GocardlessRefundEntity,
    ): Promise<ApiResponseType<GocardlessRefundEntity>> {

        const res: GocardlessRefundEntity = await this.gocardlessRefundsService.createRefund(
            principal,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessRefundEntity>(201, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    @Get('/:refundId')
    @UseGuards(PrincipalGuard)
    public async getPaymentById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('refundId') refundId: string,
    ): Promise<ApiResponseType<GocardlessRefundEntity>> {

        const res: GocardlessRefundEntity = await this.gocardlessRefundsService.getRefundById(
            principal,
            refundId,
        );
        const apiResponse = new ApiResponseType<GocardlessRefundEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param refundId
     * @param body
     */
    @Put('/:refundId')
    @UseGuards(PrincipalGuard)
    public async updatePaymentById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('refundId') refundId: string,
        @Body() body: GocardlessRefundEntity,
    ): Promise<ApiResponseType<GocardlessRefundEntity>> {

        const res: GocardlessRefundEntity = await this.gocardlessRefundsService.updateRefundById(
            principal,
            refundId,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessRefundEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

}
