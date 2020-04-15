import { PrincipalGuard } from '@d19n/client/dist/guards/PrincipalGuard';
import { Principal } from '@d19n/common/dist/decorators/Principal';
import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { ApiResponseType } from '@d19n/common/dist/http/types/ApiResponseType';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { IDbRecordCreateUpdateRes } from '@d19n/models/dist/schema-manager/db/record/interfaces/interfaces';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Body, Controller, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersItemsService } from './orders.items.service';


class DbRecordAssociationCreateDto {
}

@ApiTags('Order Items')
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
export class OrderItemsController {

    public constructor(
        private readonly ordersItemsService: OrdersItemsService,
        private readonly amqpConnection: AmqpConnection,
    ) {
        this.ordersItemsService = ordersItemsService;
        this.amqpConnection = amqpConnection;
    }

    /**
     *
     * @param principal
     * @param orderId
     * @param body
     */
    @Post(':orderId/items')
    @ApiBody({ isArray: true, type: DbRecordAssociationCreateDto })
    @UseGuards(PrincipalGuard)
    public async createOrderItemsFromProducts(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderId', ParseUUIDPipe) orderId: string,
        @Body() body: DbRecordAssociationCreateUpdateDto[],
    ): Promise<IDbRecordCreateUpdateRes[]> {
        return await this.ordersItemsService.createOrderItemsFromProducts(principal, orderId, body);
    }

    /**
     *
     * @param principal
     * @param orderId
     * @param body
     */
    @Patch('items/:orderItemId/productAmendment')
    @ApiBody({ isArray: true, type: DbRecordAssociationCreateDto })
    @UseGuards(PrincipalGuard)
    public async amendOrderItemProductById(
        @Principal() principal: OrganizationUserEntity,
        @Param('orderItemId', ParseUUIDPipe) orderItemId: string,
        @Body() body: DbRecordAssociationCreateUpdateDto,
    ): Promise<IDbRecordCreateUpdateRes> {
        return await this.ordersItemsService.amendOrderItemProductById(principal, orderItemId, body);
    }

}
