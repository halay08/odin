import {
    SUB_DB_RECORD_ASSOCIATION_CREATED,
    SUB_DB_RECORD_ASSOCIATION_DELETED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import {
    IDbRecordAssociationCreated,
    IDbRecordAssociationDeleted,
} from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { splitEntityToModuleAndEntity } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { FeatureComponentsService } from './feature.components.service';


const FEATURE_MODEL = 'FeatureModel';
const FEATURE_COMPONENT = 'FeatureComponent';

@Injectable()
export class FeatureComponentsRabbitmqHandler {

    constructor(private readonly featuresService: FeatureComponentsService) {

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
        queue: `${process.env.MODULE_NAME}.${FEATURE_COMPONENT}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        try {
            if(msg.dbRecordAssociation) {
                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === FEATURE_COMPONENT && splitChild.entityName === FEATURE_MODEL) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.featuresService.createFeatureComponentsFromFeatureModels(
                        msg.principal,
                        parentRecordId,
                    );
                }
            }
        } catch (e) {
            console.error(e)
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
        queue: `${process.env.MODULE_NAME}.${FEATURE_COMPONENT}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationDeleted) {
        try {
            if(msg.dbRecordAssociation) {

                // Handle message
                const splitParent = splitEntityToModuleAndEntity(msg.dbRecordAssociation.parentEntity);
                const splitChild = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);

                if(splitParent.entityName === FEATURE_COMPONENT && splitChild.entityName === FEATURE_MODEL) {

                    const { parentRecordId } = msg.dbRecordAssociation;

                    await this.featuresService.deleteFeatureComponents(
                        msg.principal,
                        parentRecordId,
                    );
                }

            }
        } catch (e) {
            console.error(e);
        }
    }


}
