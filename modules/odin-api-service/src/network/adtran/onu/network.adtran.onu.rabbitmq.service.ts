import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { NetworkAdtranOnuService } from './network.adtran.onu.service';

const { SERVICE_MODULE } = SchemaModuleTypeEnums;
const { CUSTOMER_DEVICE_ONT, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

@Injectable()
export class NetworkAdtranOnuRabbitmqService {

    constructor(private readonly networkAdtranOnuService: NetworkAdtranOnuService) {

        this.networkAdtranOnuService = networkAdtranOnuService;

    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${CUSTOMER_DEVICE_ONT}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async deviceAssociationCreated(msg: IDbRecordAssociationCreated) {

        console.log('deviceAssociationCreated CUSTOMER_DEVICE_ONT', msg);

        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === ORDER_ITEM && splitChild.entityName === CUSTOMER_DEVICE_ONT) {

                const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                await this.networkAdtranOnuService.addAddressToOnu(
                    msg.principal,
                    {
                        orderItemId: parentRecordId,
                        customerDeviceId: childRecordId,
                    },
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
        queue: `${process.env.MODULE_NAME}.${CUSTOMER_DEVICE_ONT}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async deviceAssociationDeleted(msg: IDbRecordAssociationDeleted) {

        try {
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
                // Handle discounts
                if(splitParent.entityName === ORDER_ITEM && splitChild.entityName === CUSTOMER_DEVICE_ONT) {

                    const { childRecordId } = msg.dbRecordAssociation;

                    await this.networkAdtranOnuService.removeAddressFromOnu(
                        msg.principal,
                        {
                            customerDeviceId: childRecordId,
                        },
                    );

                    await this.networkAdtranOnuService.removeOnuFromOlt(
                        msg.principal,
                        {
                            customerDeviceId: childRecordId,
                        },
                    );
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}
