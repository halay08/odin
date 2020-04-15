import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GocardlessPaymentsService } from './gocardless.payments.service';
import { GocardlessPaymentEntity } from './types/gocardless.payment.entity';

@ApiTags('Gocardless Payments')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/gocardless/payments`)
export class GocardlessPaymentsController {

    private gocardlessPaymentsService: GocardlessPaymentsService;

    constructor(gocardlessPaymentsService: GocardlessPaymentsService) {
        this.gocardlessPaymentsService = gocardlessPaymentsService;
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
    ): Promise<ApiResponseType<GocardlessPaymentEntity[]>> {

        const res: GocardlessPaymentEntity[] = await this.gocardlessPaymentsService.listPayments(
            principal,
        );
        const apiResponse = new ApiResponseType<GocardlessPaymentEntity[]>(200, '', res);
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
        @Body() body: GocardlessPaymentEntity,
    ): Promise<ApiResponseType<GocardlessPaymentEntity>> {

        const res: GocardlessPaymentEntity = await this.gocardlessPaymentsService.createPayment(
            principal,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessPaymentEntity>(201, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


    @Get('/:paymentId')
    @UseGuards(PrincipalGuard)
    public async getPaymentById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('paymentId') paymentId: string,
    ): Promise<ApiResponseType<GocardlessPaymentEntity>> {

        const res: GocardlessPaymentEntity = await this.gocardlessPaymentsService.getPaymentById(
            principal,
            paymentId,
        );
        const apiResponse = new ApiResponseType<GocardlessPaymentEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param paymentId
     * @param body
     */
    @Put('/:paymentId')
    @UseGuards(PrincipalGuard)
    public async updatePaymentById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('paymentId') paymentId: string,
        @Body() body: GocardlessPaymentEntity,
    ): Promise<ApiResponseType<GocardlessPaymentEntity>> {

        const res: GocardlessPaymentEntity = await this.gocardlessPaymentsService.updatePaymentById(
            principal,
            paymentId,
            body,
        );
        const apiResponse = new ApiResponseType<GocardlessPaymentEntity>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param paymentId
     */
    @Post('/:paymentId/actions/cancel')
    @UseGuards(PrincipalGuard)
    public async cancelPaymentById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('paymentId') paymentId: string,
    ): Promise<ApiResponseType<any>> {

        const res: any = await this.gocardlessPaymentsService.cancelPaymentById(principal, paymentId);
        const apiResponse = new ApiResponseType<any>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }

    /**
     *
     * @param principal
     * @param request
     * @param response
     * @param headers
     * @param paymentId
     */
    @Post('/:paymentId/actions/retry')
    @UseGuards(PrincipalGuard)
    public async reinstatePaymentById(
        @Principal() principal: OrganizationUserEntity,
        @Req() request,
        @Res() response,
        @Param('paymentId') paymentId: string,
    ): Promise<ApiResponseType<any>> {

        const res: any = await this.gocardlessPaymentsService.retryPaymentById(
            principal,
            paymentId,
        );
        const apiResponse = new ApiResponseType<any>(200, '', res);
        return response.status(apiResponse.statusCode).json(apiResponse);

    }


}
