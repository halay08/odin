import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './type/checkout.dto';


@ApiTags('Checkout')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/checkout`)
export class CheckoutController {

    public constructor(private readonly checkoutService: CheckoutService) {
        this.checkoutService = checkoutService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param body
     */
    @Post()
    @ApiBody({ isArray: false, type: CheckoutDto })
    @UseGuards(PrincipalGuard)
    public async handleWebsiteCheckout(
        @Principal() principal: OrganizationUserEntity,
        @Headers() headers: any,
        @Body() body: CheckoutDto,
    ): Promise<{ orderId: string }> {
        return await this.checkoutService.handleWebsiteCheckout(principal, body, headers);
    }

}
