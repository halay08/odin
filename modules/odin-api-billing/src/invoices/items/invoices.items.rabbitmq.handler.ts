import { SUB_DB_RECORD_DELETED } from '@d19n/models/dist/rabbitmq/rabbitmq.constants';
import { IDbRecordDeleted } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InvoicesService } from '../invoices.service';
import { InvoicesItemsService } from './invoices.items.service';

const { INVOICE_ITEM } = SchemaModuleEntityTypeEnums;

@Injectable()
export class InvoicesItemsRabbitmqHandler {

    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly invoicesItemsService: InvoicesItemsService,
    ) {
        this.invoicesService = invoicesService;
        this.invoicesItemsService = invoicesItemsService;
    }

    /**
     *
     * @param msg
     * @private
     */
    @RabbitSubscribe({
        exchange: process.env.MODULE_NAME,
        routingKey: `${process.env.MODULE_NAME}.${INVOICE_ITEM}.${SUB_DB_RECORD_DELETED}`,
        queue: `${process.env.MODULE_NAME}.${INVOICE_ITEM}.${SUB_DB_RECORD_DELETED}`,
    })
    private async handleRecordDeletedEvent(msg: IDbRecordDeleted) {
        await this.invoicesItemsService.removeInvoiceItemFromInvoice(msg.principal, msg.id);
    }


}
