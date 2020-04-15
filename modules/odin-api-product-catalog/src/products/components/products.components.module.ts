import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { forwardRef, Module } from '@nestjs/common';
import { ProductsModule } from '../products.module';
import { ComponentsService } from './components.service';
import { ProductsComponentsService } from './products.components.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        forwardRef(() => ProductsModule),
        RabbitMessageQueueModule.forRoot(),
    ],
    providers: [ ProductsComponentsService, ComponentsService ],
    exports: [ ProductsComponentsService, ComponentsService ],
})
export class ProductsComponentsModule {
}
