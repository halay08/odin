import { SUB_DB_RECORD_CREATED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordCreated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { AddressesService } from './addresses.service';

const { ADDRESS } = SchemaModuleEntityTypeEnums;

@Injectable()
export class AddressesRabbitmqHandler {

    constructor(private readonly addressesService: AddressesService) {

        this.addressesService = addressesService;
    }


    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${ADDRESS}.${SUB_DB_RECORD_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${ADDRESS}.${SUB_DB_RECORD_CREATED}`,
    })
    private async handleRecordCreatedEvent(msg: IDbRecordCreated) {
        try {

            console.log('ENRICH_ADDRESS');
            await this.addressesService.enrichAddress(msg.principal, msg.id);

        } catch (e) {

            console.error(e)

        }
    }

}
