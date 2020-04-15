import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsUserActivityModule } from '../../logs/user-activity/logs.user.activity.module';
import { PipelineEntitysModule } from '../pipelines.module';
import { PipelineEntitysStagesController } from './pipelines.stages.controller';
import { PipelineEntitysStagesRepository } from './pipelines.stages.repository';
import { PipelineEntitysStagesService } from './pipelines.stages.service';

@Module({
  imports: [
    forwardRef(() => LogsUserActivityModule),
    forwardRef(() => PipelineEntitysModule),
    TypeOrmModule.forFeature([ PipelineEntitysStagesRepository ]),
  ],
  controllers: [ PipelineEntitysStagesController ],
  providers: [ PipelineEntitysStagesService ],
  exports: [ PipelineEntitysStagesService ],
})
export class PipelineEntitysStagesModule {
}
