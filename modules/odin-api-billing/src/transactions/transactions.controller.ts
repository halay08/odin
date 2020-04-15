import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionPaymentCreateDto } from './types/transaction.payment.create.dto';
import { TransactionRefundCreateDto } from './types/transaction.refund.create.dto';


@ApiTags('Transactions')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/transactions`)
export class TransactionsController {

    public constructor(private readonly transactionsService: TransactionsService) {
        this.transactionsService = transactionsService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param invoiceId
     * @param body
     */
    @Post('invoices/:invoiceId')
    @UseGuards(PrincipalGuard)
    public async createPaymentTransactionForInvoice(
        @Principal() principal: OrganizationUserEntity,
        @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
        @Body() body: TransactionPaymentCreateDto,
    ): Promise<any> {
        return await this.transactionsService.createPaymentTransactionForInvoice(principal, invoiceId, body);
    }

    /**
     *
     * @param principal
     * @param transactionId
     * @param body
     */
    @Post(':transactionId/refund')
    @UseGuards(PrincipalGuard)
    public async createRefundTransactionForInvoice(
        @Principal() principal: OrganizationUserEntity,
        @Param('transactionId', ParseUUIDPipe) transactionId: string,
        @Body() body: TransactionRefundCreateDto,
    ): Promise<any> {
        return await this.transactionsService.createRefundForTransaction(
            principal,
            transactionId,
            body,
        );
    }


    /**
     *
     * @param principal
     * @param transactionId
     * @param invoiceId
     * @param templateKey
     * @param body
     */
    @Post('invoices/:invoiceId/:transactionId/email/:templateKey')
    @UseGuards(PrincipalGuard)
    public async createOrderItemsFromProducts(
        @Principal() principal: OrganizationUserEntity,
        @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
        @Param('transactionId', ParseUUIDPipe) transactionId: string,
        @Param('templateKey') templateKey: string,
        @Body() body: SendgridEmailEntity,
    ): Promise<any> {
        return await this.transactionsService.sendEmail(
            principal,
            invoiceId,
            transactionId,
            templateKey,
            body,
        );
    }

}
