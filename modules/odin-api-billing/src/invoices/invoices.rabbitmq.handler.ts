import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
    SUB_DB_RECORD_ASSOCIATION_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InvoicesService } from './invoices.service';


const { INVOICE, INVOICE_ITEM, DISCOUNT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class InvoicesRabbitmqHandler {

    constructor(
        private readonly invoicesService: InvoicesService,
    ) {

        this.invoicesService = invoicesService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${INVOICE}.${INVOICE_ITEM}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            if(splitParent.entityName === INVOICE && splitChild.entityName === INVOICE_ITEM) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.invoicesService.computeInvoiceTotals(msg.principal, parentRecordId);

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
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${INVOICE}.${DISCOUNT}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationInvoiceDiscountCreated(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {

            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            if(splitParent.entityName === INVOICE && splitChild.entityName === DISCOUNT) {

                const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                await this.invoicesService.addDiscountByPrincipal(msg.principal, parentRecordId, childRecordId);

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
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${INVOICE}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
    })
    private async handleDbRecordAssociationUpdated(msg: IDbRecordAssociationUpdated) {

        if(msg.dbRecordAssociation) {

            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            // Handle discounts
            if(splitParent.entityName === INVOICE && splitChild.entityName === INVOICE_ITEM) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.invoicesService.computeInvoiceTotals(msg.principal, parentRecordId);

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
        queue: `${process.env.MODULE_NAME}.${INVOICE}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation) {

            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === INVOICE && splitChild.entityName === DISCOUNT) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.invoicesService.removeDiscountByPrincipal(msg.principal, parentRecordId);

            }
        }
    }


    private static handleError(e) {
        console.error('order event handler error', e);
    }
}
