import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
    IDbRecordUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { NetworkEeroEerosService } from './network.eero.eeros.service';

const { SERVICE_MODULE } = SchemaModuleTypeEnums;
const { CUSTOMER_DEVICE_ROUTER, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

@Injectable()
export class NetworkEeroEerosRabbitmqHandler {

    constructor(private readonly networkEeroEerosService: NetworkEeroEerosService) {

        this.networkEeroEerosService = networkEeroEerosService;

    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: SERVICE_MODULE,
        routingKey: `${SERVICE_MODULE}.${CUSTOMER_DEVICE_ROUTER}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${CUSTOMER_DEVICE_ROUTER}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleCustomerDeviceRouterUpdated(msg: IDbRecordUpdated) {
        // Handle message
        await this.networkEeroEerosService.addHomeIdentifier(msg.principal, msg.id);
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${CUSTOMER_DEVICE_ROUTER}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === ORDER_ITEM && splitChild.entityName === CUSTOMER_DEVICE_ROUTER) {

                const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                await this.networkEeroEerosService.addHomeIdentifier(msg.principal, childRecordId);
                await this.networkEeroEerosService.addRouterToOnt(msg.principal, {
                    orderItemId: parentRecordId,
                    customerDeviceId: childRecordId,
                });
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
        queue: `${process.env.MODULE_NAME}.${CUSTOMER_DEVICE_ROUTER}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationDeleted) {

        try {
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
                // Handle discounts
                if(splitParent.entityName === ORDER_ITEM && splitChild.entityName === CUSTOMER_DEVICE_ROUTER) {

                    const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                    await this.networkEeroEerosService.removeHomeIdentifier(msg.principal, childRecordId);
                    await this.networkEeroEerosService.removeRouterFromOnt(msg.principal, {
                        orderItemId: parentRecordId,
                        customerDeviceId: childRecordId,
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

}
