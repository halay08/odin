import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordDeleted,
    IDbRecordUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { OrdersItemsService } from './orders.items.service';

const { ORDER_ITEM, ORDER } = SchemaModuleEntityTypeEnums;

@Injectable()
export class OrdersItemsRabbitmqHandler {

    constructor(
        private readonly ordersService: OrdersService,
        private readonly ordersItemsService: OrdersItemsService,
    ) {
        this.ordersService = ordersService;
        this.ordersItemsService = ordersItemsService;
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${ORDER_ITEM}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER_ITEM}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleOrderItemUpdatedEvent(msg: IDbRecordUpdated) {

        try {
            if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
                await this.ordersItemsService.computeOrderTotalFromOrderItem(msg.principal, msg.id);
            }
        } catch (e) {
            console.error(e);
        }
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${ORDER_ITEM}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER_ITEM}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleOrderItemDeletedEvent(msg: IDbRecordDeleted) {

        try {

            await this.ordersItemsService.computeOrderTotalFromOrderItem(msg.principal, msg.id);

        } catch (e) {
            console.error(e);
        }
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER}.${ORDER_ITEM}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        console.log('msg order order item created', msg);

        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            //Handle Order Items
            if(splitParent.entityName === ORDER && splitChild.entityName === ORDER_ITEM) {

                const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                await this.ordersItemsService.processOrderItemsForBilling(
                    msg.principal,
                    parentRecordId,
                    [ childRecordId ],
                );
            }
        }
    }

}
