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
import * as dotenv from 'dotenv';
import { ProductsComponentsService } from './components/products.components.service';
import { ProductsService } from './products.service';


const { PRODUCT_COMPONENT } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class ProductsRabbitmqHandler {

    constructor(
        private readonly productsService: ProductsService,
        private readonly productsComponentsService: ProductsComponentsService,
    ) {

        this.productsService = productsService;
        this.productsComponentsService = productsComponentsService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_CREATED}`,
    })
    private async handleDbRecordAssociationCreated(msg: IDbRecordAssociationCreated) {

        try {
            console.log('(msg.dbRecordAssociation', msg.dbRecordAssociation);

            if(msg.dbRecordAssociation) {
                const { entityName } = splitEntityToModuleAndEntity(msg.dbRecordAssociation.childEntity);
                // Handle message
                if(entityName === PRODUCT_COMPONENT) {

                    const { parentRecordId, childRecordId } = msg.dbRecordAssociation;

                    await this.productsComponentsService.addProductComponentsByPrincipal(
                        msg.principal,
                        parentRecordId,
                        childRecordId,
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
        queue: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_UPDATED}`,
    })
    private async handleDbRecordAssociationUpdated(msg: IDbRecordAssociationUpdated) {

        if(msg.dbRecordAssociation && msg.dbRecordAssociation.childSchema.entityName === PRODUCT_COMPONENT) {
            const { parentRecordId } = msg.dbRecordAssociation;

            await this.productsService.computeProductTotals(msg.principal, parentRecordId);
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
        queue: `${process.env.MODULE_NAME}.${SUB_DB_RECORD_ASSOCIATION_DELETED}`,
    })
    private async handleDbRecordAssociationDeleted(msg: IDbRecordAssociationCreated) {

        if(msg.dbRecordAssociation && msg.dbRecordAssociation.childSchema.entityName === PRODUCT_COMPONENT) {
            // Handle message
            await this.productsComponentsService.removeComponentByPrincipal(
                msg.principal,
                msg.dbRecordAssociation,
            );
        }
    }

}
