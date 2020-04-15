import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef, Module } from '@nestjs/common';
import { ProductsComponentsModule } from './components/products.components.module';
import { ProductsRabbitmqHandler } from './products.rabbitmq.handler';
import { ProductsService } from './products.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        ProductsModule,
        forwardRef(() => ProductsComponentsModule),
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [],
    providers: [ ProductsService, ProductsRabbitmqHandler ],
    exports: [ ProductsService ],
})
export class ProductsModule {
}
