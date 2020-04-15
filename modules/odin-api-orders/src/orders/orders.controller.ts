import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { SendgridEmailEntity } from '@d19n/models/dist/notifications/sendgrid/email/sendgrid.email.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { ProcessOrderBillingDto } from './types/ProcessOrderBillingDto';


@ApiTags('Orders')
@ApiBearerAuth()
@ApiConsumes('application/json')
@ApiProduces('application/json')
@ApiResponse({ status: 200, type: ApiResponseType, description: '' })
@ApiResponse({ status: 201, type: ApiResponseType, description: '' })
@ApiResponse({ status: 401, type: ExceptionType, description: 'Unauthorized' })
@ApiResponse({ status: 404, type: ExceptionType, description: 'Not found' })
@ApiResponse({ status: 422, type: ExceptionType, description: 'Unprocessable entity validation failed' })
@ApiResponse({ status: 500, type: ExceptionType, description: 'Internal server error' })
@Controller(`${process.env.MODULE_NAME}/v1.0/orders`)
export class OrdersController {

    public constructor(private readonly ordersService: OrdersService) {
        this.ordersService = ordersService;
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param templateKey
     * @param body
     */
    @Post(':orderId/email/:templateKey')
    @UseGuards(PrincipalGuard)
    public async createOrderItemsFromProducts(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Param('templateKey') templateKey: string,
        @Body() body: SendgridEmailEntity,
    ): Promise<any> {
        return await this.ordersService.sendOrderEmail(principal, orderId, templateKey, body);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param body
     */
    @Post(':orderId/billing')
    @ApiBody({
        type: ProcessOrderBillingDto,
        required: true,
        isArray: false,
    })
    @UseGuards(PrincipalGuard)
    public async processOrderForBilling(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() body: ProcessOrderBillingDto,
    ): Promise<any> {
        return await this.ordersService.processOrderForBilling(principal, orderId, body);
    }

    /**
     *
     * @param principal
     * @param headers
     * @param orderId
     * @param body
     */
    @Post(':orderId/calculate')
    @UseGuards(PrincipalGuard)
    public async computeOrderTotals(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<any> {
        return await this.ordersService.computeOrderTotals(principal, orderId);
    }


    /**
     * split an order into two orders
     * @param principal
     * @param headers
     * @param orderId
     * @param body
     */
    @Post(':orderId/split')
    @ApiBody({
        type: ProcessOrderBillingDto,
        required: true,
        isArray: false,
    })
    @UseGuards(PrincipalGuard)
    public async splitOrder(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() body: DbRecordAssociationCreateUpdateDto[],
    ): Promise<any> {
        return await this.ordersService.splitOrder(principal, orderId, body);
    }

}
