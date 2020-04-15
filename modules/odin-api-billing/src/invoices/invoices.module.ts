import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesOrderEventsService } from './invoices.order.events.service';
import { InvoicesOrderRabbitmqHandler } from './invoices.order.rabbitmq.handler';
import { InvoicesRabbitmqHandler } from './invoices.rabbitmq.handler';
import { InvoicesService } from './invoices.service';
import { InvoicesItemsRabbitmqHandler } from './items/invoices.items.rabbitmq.handler';
import { InvoicesItemsService } from './items/invoices.items.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        PipelineEntitysModule,
        PipelineEntitysStagesModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        InvoicesController,
    ],
    providers: [
        InvoicesService,
        InvoicesRabbitmqHandler,
        InvoicesItemsService,
        InvoicesItemsRabbitmqHandler,
        InvoicesOrderEventsService,
        InvoicesOrderRabbitmqHandler,
    ],
    exports: [
        InvoicesService,
    ],
})

export class InvoicesModule {
}
