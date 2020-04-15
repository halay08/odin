import { RPC_CREATE_ORDER_ITEMS } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { OrdersItemsService } from './orders.items.service';

dotenv.config();


@Injectable()
export class OrdersItemsServiceRpc {

    constructor(private readonly ordersItemsService: OrdersItemsService) {
        this.ordersItemsService = ordersItemsService;
    }

    @RabbitRPC({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${RPC_CREATE_ORDER_ITEMS}`,
        queue: `${process.env.MODULE_NAME}.${RPC_CREATE_ORDER_ITEMS}`,
    })
    public async createOrderItems(msg: any): Promise<any> {
        try {

            const res = await this.ordersItemsService.createOrderItemsFromProducts(
                msg.principal,
                msg.orderId,
                msg.body,
            );

            if(res) {
                return {
                    statusCode: 201,
                    successful: true,
                    message: 'successfully created order items',
                    data: res,
                };
            } else {
                return {
                    statusCode: 500,
                    successful: false,
                    message: 'error creating order items',
                    data: undefined,
                };
            }
        } catch (e) {
            console.error(e);
            return {
                statusCode: e.statusCode,
                successful: false,
                message: e.message,
                validation: e.validation,
                data: undefined,
            }

        }
    }

}
