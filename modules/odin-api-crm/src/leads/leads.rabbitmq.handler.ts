import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
    SUB_DB_RECORD_ASSOCIATION_UPDATED,
    SUB_DB_RECORD_CREATED,
    SUB_DB_RECORD_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
    IDbRecordAssociationUpdated,
    IDbRecordCreated,
    IDbRecordDeleted,
    IDbRecordUpdated,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { PremisesService } from '../premise/premises.service';
import { LeadsService } from './leads.service';

const { LEAD, PRODUCT, ADDRESS } = SchemaModuleEntityTypeEnums;

@Injectable()
export class LeadsRabbitmqHandler {

    constructor(private readonly leadsService: LeadsService, private readonly premisesService: PremisesService) {

        this.leadsService = leadsService;
        this.premisesService = premisesService;
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleRecordUpdatedEvent(msg: IDbRecordUpdated) {
        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
            await this.leadsService.handleStageChange(msg.principal, msg.id);
        }
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_CREATED}`,
    })
    private async handleRecordCreatedEvent(msg: IDbRecordCreated) {
        try {
            // Handle message
            await this.premisesService.addRelatedLeadToPremise(msg.principal, msg.id);
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
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationAddressCreated(msg: IDbRecordAssociationCreated) {
        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === LEAD && splitChild.entityName === ADDRESS) {

                const { parentRecordId } = msg.dbRecordAssociation;
                await this.premisesService.addRelatedLeadToPremise(msg.principal, parentRecordId);

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
        routingKey: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleRecordDeletedEvent(msg: IDbRecordDeleted) {
        await this.premisesService.removeRelatedLeadFromPremise(msg.principal, msg.id);
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {
        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === LEAD && splitChild.entityName === PRODUCT) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.leadsService.computeLeadProductTotals(
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
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
    })
    private async handleDbRecordAssociationUpdated(msg: IDbRecordAssociationUpdated) {
        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
            // Handle discounts
            if(splitParent.entityName === LEAD && splitChild.entityName === PRODUCT) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.leadsService.computeLeadProductTotals(
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
        queue: `${process.env.MODULE_NAME}.${LEAD}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationDeleted) {
        try {
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
                // Handle discounts
                if(splitParent.entityName === LEAD && splitChild.entityName === PRODUCT) {
                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.leadsService.computeLeadProductTotals(
                        msg.principal,
                        parentRecordId,
                    );
                }
            }
        } catch (e) {
        }
    }

}
