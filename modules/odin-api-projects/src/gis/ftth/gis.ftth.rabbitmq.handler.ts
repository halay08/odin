import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import {
    SUB_DB_RECORD_CREATED,
    SUB_DB_RECORD_DELETED,
    SUB_DB_RECORD_UPDATED,
} from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordCreated, IDbRecordDeleted, IDbRecordUpdated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { GisFtthFeaturesService } from './gis.ftth.features.service';

const { FEATURE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class GisFtthRabbitmqHandler {

    constructor(
        private readonly gisFtthService: GisFtthFeaturesService,
    ) {

        this.gisFtthService = gisFtthService;
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_CREATED}`,
        queue: `${process.env.MODULE_NAME}.${FEATURE}.GisDb.${SUB_DB_RECORD_CREATED}`,
    })
    private async handleRecordCreatedEvent(msg: IDbRecordCreated) {
        // Handle message
        try {
            if(msg.event === LogsConstants.DB_RECORD_CREATED) {
                console.log('creating feature', msg);

                await this.gisFtthService.createFeature(msg.principal, msg.id);

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
        routingKey: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${FEATURE}.GisDb.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleRecordUpdatedEvent(msg: IDbRecordUpdated) {
        try {
            if(msg.event === LogsConstants.DB_RECORD_UPDATED) {
                console.log('updating feature', msg);

                await this.gisFtthService.updateFeature(msg.principal, msg.id);

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
        routingKey: `${process.env.MODULE_NAME}.${FEATURE}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${FEATURE}.GisDb.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleRecordDeletedEvent(msg: IDbRecordDeleted) {
        // Handle message
        if(msg.event === LogsConstants.DB_RECORD_DELETED) {
            console.log('deleting feature', msg);

            await this.gisFtthService.deleteFeature(msg.principal, msg.id);

        }
    }


}
