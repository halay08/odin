import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { FeaturesModule } from '../../features/features.module';
import { JiraModule } from '../../integrations/jira/jira.module';
import { GisFtthFeaturesController } from './gis.ftth.features.controller';
import { GisFtthFeaturesService } from './gis.ftth.features.service';
import { GisFtthRabbitmqHandler } from './gis.ftth.rabbitmq.handler';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        FeaturesModule,
        JiraModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        GisFtthFeaturesController,
    ],
    providers: [
        GisFtthRabbitmqHandler,
        GisFtthFeaturesService,
    ],
    exports: [
        GisFtthFeaturesService,
    ],
})
export class GisFtthModule {
}



