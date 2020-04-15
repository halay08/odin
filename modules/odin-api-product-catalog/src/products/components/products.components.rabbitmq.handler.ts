import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { SUB_DB_RECORD_UPDATED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordUpdated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { ProductsService } from '../products.service';
import { ComponentsService } from './components.service';
import { ProductsComponentsService } from './products.components.service';


const { PRODUCT_COMPONENT } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class ProductsRabbitmqHandler {

    private readonly productsService: ProductsService;

    constructor(
        @Inject(forwardRef(() => ProductsService)) productsService: ProductsService,
        private readonly productsComponentsService: ProductsComponentsService,
        private readonly componentsService: ComponentsService,
    ) {

        this.productsService = productsService;
        this.componentsService = componentsService;
        this.productsComponentsService = productsComponentsService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${PRODUCT_COMPONENT}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${PRODUCT_COMPONENT}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleRecordUpdatedEvent(msg: IDbRecordUpdated) {

        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            await this.componentsService.updateByPrincipalAndId(msg.principal, msg.id);
        }
    }

}
