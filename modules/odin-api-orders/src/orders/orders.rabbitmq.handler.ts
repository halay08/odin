import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
    SUB_DB_RECORD_ASSOCIATION_UPDATED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
    IDbRecordAssociationUpdated,
    IDbRecordCreated,
    IDbRecordUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { OrdersService } from './orders.service';

const { CRM_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { ORDER, DISCOUNT, WORK_ORDER, ADDRESS, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

@Injectable()
export class OrdersRabbitmqHandler {

    private readonly ordersService: OrdersService

    constructor(ordersService: OrdersService) {

        this.ordersService = ordersService;
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${ORDER}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER}.${SUB_DB_RECORD_UPDATED}`,
        // queueOptions: {
        //     deadLetterExchange: ''
        // }
    })
    private async handleOrderUpdatedEvent(msg: IDbRecordUpdated) {

        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            await this.ordersService.handleStageChange(msg.principal, msg.id, msg.body);
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
        queue: `${process.env.MODULE_NAME}.${ORDER}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            if(splitParent.entityName === ORDER && splitChild.entityName === DISCOUNT) {
                // Handle discounts

                const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                await this.ordersService.addDiscountByPrincipal(
                    msg.principal,
                    parentRecordId,
                    childRecordId,
                );
            }

            //Handle Order Items
            if(splitParent.entityName === ORDER && splitChild.entityName === ORDER_ITEM) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.ordersService.computeOrderTotals(
                    msg.principal,
                    parentRecordId,
                );
            }
        }
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationDeleted) {

        try {
            if(msg.dbRecordAssociation) {

                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
                // Handle discounts
                if(splitParent.entityName === ORDER && splitChild.entityName === DISCOUNT) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.ordersService.removeDiscountByPrincipal(
                        msg.principal,
                        parentRecordId,
                    );
                }
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
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
    })
    private async handleDbRecordAssociationUpdated(msg: IDbRecordAssociationUpdated) {

        if(msg.dbRecordAssociation) {

            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            //Handle Order Items
            if(splitParent.entityName === ORDER && splitChild.entityName === ORDER_ITEM) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.ordersService.computeOrderTotals(
                    msg.principal,
                    parentRecordId,
                );
            }
        }
    }


    //
    // Work Order events
    //

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: FIELD_SERVICE_MODULE,
        routingKey: `${FIELD_SERVICE_MODULE}.${WORK_ORDER}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER}.${WORK_ORDER}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleWorkOrderCreatedEvent(msg: IDbRecordCreated) {
        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            await this.ordersService.handleOrderWorkOrderStageChange(msg.principal, msg.id, msg.body);
        }
    }


    //
    // Address events
    //

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: CRM_MODULE,
        routingKey: `${CRM_MODULE}.${ADDRESS}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${ORDER}.${ADDRESS}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleAddressUpdatedEvent(msg: IDbRecordUpdated) {

        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            // Handle message
            await this.ordersService.handleAddressUpdated(msg.principal, msg.id, msg.body);
        }
    }

}
