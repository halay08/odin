import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { FeatureComponentsController } from './feature.components.controller';
import { FeatureComponentsRabbitmqHandler } from './feature.components.rabbitmq.handler';
import { FeatureComponentsService } from './feature.components.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ FeatureComponentsController ],
    providers: [ FeatureComponentsService, FeatureComponentsRabbitmqHandler ],
    exports: [ FeatureComponentsService ],
})
export class FeatureComponentsModule {
}
