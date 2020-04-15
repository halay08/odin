import { Client } from '@elastic/elasticsearch';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { ELASTIC_SEARCH_LOGS_CLIENT } from '../../common/Constants';
import { DbModule } from '../../db/db.module';
import { PipelineEntitysStagesModule } from '../../pipelines/stages/pipelines.stages.module';
import { LogsUserActivityRepository } from './logs.user.activity.repository';
import { LogsUserActivityService } from './logs.user.activity.service';


dotenv.config();

const elasticSearchProvider = {
  provide: ELASTIC_SEARCH_LOGS_CLIENT,
  useFactory: async () => {
    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    return client;
  },
};


@Module({
  imports: [
    forwardRef(() => DbModule),
    forwardRef(() => PipelineEntitysStagesModule),
    TypeOrmModule.forFeature([
      LogsUserActivityRepository,
    ]),
  ],
  controllers: [],
  providers: [
    LogsUserActivityService,
    elasticSearchProvider,
  ],
  exports: [
    LogsUserActivityService,
  ],
})

export class LogsUserActivityModule {
}
