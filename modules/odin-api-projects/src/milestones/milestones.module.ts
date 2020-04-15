import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { GisFtthClosuresModule } from '../gis/ftth/closures/gis.ftth.closures.module';
import { GisFtthPolygonsModule } from '../gis/ftth/polygon/gis.ftth.polygons.module';
import { GisOsModule } from '../gis/os/gis.os.module';
import { TasksModule } from '../tasks/tasks.module';
import { MilestonesController } from './milestones.controller';
import { MilestonesRabbitmqHandler } from './milestones.rabbitmq.handler';
import { MilestonesService } from './milestones.service';
import { MilestonesTemplatesService } from './templates/milestones.templates.service';


@Module({
    imports: [
        TasksModule,
        DbModule,
        SchemasModule,
        PipelineEntitysModule,
        PipelineEntitysStagesModule,
        RabbitMessageQueueModule.forRoot(),
        GisFtthClosuresModule,
        GisOsModule,
        GisFtthPolygonsModule,
    ],
    providers: [ MilestonesService, MilestonesRabbitmqHandler, MilestonesTemplatesService ],
    exports: [ MilestonesService, MilestonesTemplatesService ],
    controllers: [ MilestonesController ],
})
export class MilestonesModule {
}
