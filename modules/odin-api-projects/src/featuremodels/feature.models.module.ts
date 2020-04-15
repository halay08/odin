import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { FeatureModelsController } from './feature.models.controller';
import { FeatureModelsRabbitmqHandler } from './feature.models.rabbitmq.handler';
import { FeatureModelsService } from './feature.models.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [ FeatureModelsController ],
    providers: [ FeatureModelsService, FeatureModelsRabbitmqHandler ],
    exports: [ FeatureModelsService ],
})
export class FeatureModelsModule {
}
