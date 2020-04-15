import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { Body, Controller, Headers, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment.methods.service';
import { PaymentMethodMandateCreate } from './types/payment.method.mandate.create';


@ApiTags('Payment Methods')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/contact/:contactId/payment-methods`)
export class PaymentMethodsController {

    private readonly paymentMethodsService: PaymentMethodsService;

    constructor(paymentMethodsService: PaymentMethodsService) {
        this.paymentMethodsService = paymentMethodsService;
    }

    /*createCustomerMandatePaymentMethod*
     *
     * @param principal
     * @param headers
     * @param contactId
     * @param body
     */
    @Post()
    @UseGuards(PrincipalGuard)
    public async createCustomerMandatePaymentMethod(
        @Principal() principal: OrganizationUserEntity,
        @Headers() headers,
        @Param('contactId', ParseUUIDPipe) contactId: string,
        @Body() body: PaymentMethodMandateCreate,
    ): Promise<IDbRecordCreateUpdateRes> {
        return await this.paymentMethodsService.createCustomerMandatePaymentMethod(principal, headers, contactId, body);
    }

}
