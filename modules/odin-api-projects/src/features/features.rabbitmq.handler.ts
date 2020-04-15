import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
    SUB_DB_RECORD_ASSOCIATION_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { FeaturesService } from './features.service';

const FEATURE = 'Feature';
const FEATURE_MODEL = 'FeatureModel';

const { PRODUCT } = SchemaModuleEntityTypeEnums;

@Injectable()
export class FeaturesRabbitmqHandler {

    constructor(private readonly featuresService: FeaturesService) {

        this.featuresService = featuresService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {
        if(msg.dbRecordAssociation) {
            // Handle message
            const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
            const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

            if(splitParent.entityName === FEATURE && splitChild.entityName === PRODUCT) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.featuresService.computeFeatureProductTotalsAndSave(
                    msg.principal,
                    parentRecordId,
                );
            }

            if(splitParent.entityName === FEATURE && splitChild.entityName === FEATURE_MODEL) {

                const { parentRecordId } = msg.dbRecordAssociation;

                await this.featuresService.createFeatureComponentsFromFeatureModels(
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
        queue: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
    })
    private async handleDbRecordAssociationUpdated(msg: IDbRecordAssociationDeleted) {
        try {
            if(msg.dbRecordAssociation) {

                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === FEATURE && splitChild.entityName === PRODUCT) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.featuresService.computeFeatureProductTotalsAndSave(
                        msg.principal,
                        parentRecordId,
                    );
                }
            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
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
        queue: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationDeleted) {
        console.log('handleDbRecordAssociationDeleted message received', msg);
        try {
            if(msg.dbRecordAssociation) {

                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === FEATURE && splitChild.entityName === PRODUCT) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.featuresService.computeFeatureProductTotalsAndSave(
                        msg.principal,
                        parentRecordId,
                    );
                }

                if(splitParent.entityName === FEATURE && splitChild.entityName === FEATURE_MODEL) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.featuresService.deleteFeatureComponents(
                        msg.principal,
                        parentRecordId,
                    );
                }

            }
        } catch (e) {
            console.error(e);
            throw new ExceptionType(500, e.message);
        }
    }

}
