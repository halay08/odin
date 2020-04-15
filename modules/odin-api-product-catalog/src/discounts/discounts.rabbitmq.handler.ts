import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { SUB_DB_RECORD_UPDATED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordUpdated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { DiscountsService } from './discounts.service';

const { DISCOUNT } = SchemaModuleEntityTypeEnums;

dotenv.config();

@Injectable()
export class ProductsRabbitmqHandler {

    constructor(
        private readonly discountsService: DiscountsService,
    ) {
        this.discountsService = discountsService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${DISCOUNT}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${DISCOUNT}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleRecordUpdatedEvent(msg: IDbRecordUpdated) {

        if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
            await this.discountsService.updateByPrincipalAndId(msg.principal, msg.id);
        }
    }

}
