import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef, Module } from '@nestjs/common';
import { OrdersItemsModule } from './items/orders.items.module';
import { OrdersController } from './orders.controller';
import { OrdersRabbitmqHandler } from './orders.rabbitmq.handler';
import { OrdersService } from './orders.service';

@Module({
    imports: [
        forwardRef(() => OrdersItemsModule),
        DbModule,
        SchemasModule,
        PipelineEntitysModule,
        PipelineEntitysStagesModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ OrdersController ],
    providers: [ OrdersService, OrdersRabbitmqHandler ],
    exports: [ OrdersService ],

})
export class OrdersModule {

}
