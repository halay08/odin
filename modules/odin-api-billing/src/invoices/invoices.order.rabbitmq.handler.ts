import { SUB_DB_RECORD_UPDATED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordUpdated } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InvoicesOrderEventsService } from './invoices.order.events.service';

const { ORDER_MODULE } = SchemaModuleTypeEnums;
const { ORDER, INVOICE } = SchemaModuleEntityTypeEnums;

@Injectable()
export class InvoicesOrderRabbitmqHandler {

    constructor(
        private readonly invoicesOrderEventsService: InvoicesOrderEventsService,
    ) {

        this.invoicesOrderEventsService = invoicesOrderEventsService;
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: ORDER_MODULE,
        routingKey: `${ORDER_MODULE}.${ORDER}.${SUB_DB_RECORD_UPDATED}`,
        queue: `${process.env.MODULE_NAME}.${INVOICE}.${ORDER}.${SUB_DB_RECORD_UPDATED}`,
    })
    private async handleOrderUpdatedEvent(msg: IDbRecordUpdated) {
        //
        // console.log('handleOrderUpdatedEvent message received ', msg);
        // // Handle message
        // if(msg.event === LogsConstants.DB_RECORD_STAGE_UPDATED) {
        //     await this.invoicesOrderEventsService.handleOrderStageChange(msg.principal, msg.dbRecord.id, msg.body);
        // }
    }

}
