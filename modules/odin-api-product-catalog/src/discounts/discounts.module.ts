import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        ProductsModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ DiscountsController ],
    providers: [ DiscountsService ],
    exports: [ DiscountsService ],
})
export class DiscountsModule {

}
