import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsUserActivityModule } from '../logs/user-activity/logs.user.activity.module';
import { PipelineEntitiesController } from './pipelines.controller';
import { PipelineEntitysRepository } from './pipelines.repository';
import { PipelineEntitysService } from './pipelines.service';
import { PipelineEntitysStagesModule } from './stages/pipelines.stages.module';

@Module({
  imports: [
    forwardRef(() => LogsUserActivityModule),
    forwardRef(() => PipelineEntitysStagesModule),
    TypeOrmModule.forFeature([ PipelineEntitysRepository ]),
  ],
  controllers: [ PipelineEntitiesController ],
  providers: [ PipelineEntitysService ],
  exports: [ PipelineEntitysService ],
})
export class PipelineEntitysModule {
}
