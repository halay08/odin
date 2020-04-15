import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef, Module } from '@nestjs/common';
import { OrdersModule } from '../orders.module';
import { OrderItemsController } from './order.items.controller';
import { OrdersItemsRabbitmqHandler } from './orders.items.rabbitmq.handler';
import { OrdersItemsService } from './orders.items.service';
import { OrdersItemsServiceRpc } from './orders.items.service.rpc';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        forwardRef(() => OrdersModule),
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ OrderItemsController ],
    providers: [ OrdersItemsService, OrdersItemsServiceRpc, OrdersItemsRabbitmqHandler ],
    exports: [ OrdersItemsService ],
})
export class OrdersItemsModule {
}
