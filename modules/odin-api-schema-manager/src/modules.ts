import { DbModule } from './db/db.module';
import { AwsS3Module } from './files/awsS3/awsS3.module';
import { LogsUserActivityModule } from './logs/user-activity/logs.user.activity.module';
import { PipelineEntitysModule } from './pipelines/pipelines.module';
import { PipelineEntitysStagesModule } from './pipelines/stages/pipelines.stages.module';
import { SchemasModule } from './schemas/schemas.module';
import { ViewsModule } from './views/views.module';

/**
 * These are the required modules for schema manager
 */
export const schemaManagerModules = [

  DbModule,
  SchemasModule,
  AwsS3Module,
  ViewsModule,
  PipelineEntitysModule,
  PipelineEntitysStagesModule,
  LogsUserActivityModule,

]

