import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from '@d19n/schema-manager/dist/pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { TasksRabbitmqHandler } from './tasks.rabbitmq.handler';
import { TasksService } from './tasks.service';
import { TasksTemplatesService } from './templates/tasks.templates.service';

@Module({
    imports: [
        DbModule,
        SchemasModule,
        PipelineEntitysModule,
        PipelineEntitysStagesModule,
        RabbitMessageQueueModule.forRoot(),
    ],
    providers: [ TasksService, TasksRabbitmqHandler, TasksTemplatesService ],
    exports: [ TasksService, TasksTemplatesService ],
})
export class TasksModule {
}
