import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { AwsS3Module } from '../files/awsS3/awsS3.module';
import { LogsUserActivityModule } from '../logs/user-activity/logs.user.activity.module';
import { PipelineEntitysStagesModule } from '../pipelines/stages/pipelines.stages.module';
import { SchemasModule } from '../schemas/schemas.module';
import { DbController } from './db.controller';
import { DbService } from './db.service';
import { DbServiceRabbitmqHandler } from './db.service.rabbitmq.handler';
import { DbServiceRabbitmqRpc } from './db.service.rabbitmq.rpc';
import { DbRecordAssociationsColumnsRepository } from './records/associations-columns/db.records.associations.columns.repository';
import { DbRecordsAssociationsController } from './records/associations/db.records.associations.controller';
import { DbRecordsAssociationsRabbitmqHandler } from './records/associations/db.records.associations.rabbitmq.handler';
import { DbRecordsAssociationsRepository } from './records/associations/db.records.associations.repository';
import { DbRecordsAssociationsService } from './records/associations/db.records.associations.service';
import { DbRecordsAssociationsServiceInternal } from './records/associations/db.records.associations.service.internal';
import { DbRecordsColumnsRepository } from './records/columns/db.records.columns.repository';
import { DbRecordsRabbitmqHandler } from './records/db.records.rabbitmq.handler';
import { DbRecordsRepository } from './records/db.records.repository';
import { DbRecordsService } from './records/db.records.service';
import { DbRecordsServiceInternal } from './records/db.records.service.internal';
import { DbRecordsPrincipalServiceInternal } from './records/db.records.service.internal.v2';
import { DbSearchModule } from './search/db.search.module';

dotenv.config();

@Module({
  imports: [
    forwardRef(() => DbSearchModule),
    forwardRef(() => LogsUserActivityModule),
    forwardRef(() => SchemasModule),
    forwardRef(() => AwsS3Module),
    PipelineEntitysStagesModule,
    TypeOrmModule.forFeature([
      DbRecordAssociationsColumnsRepository,
      DbRecordsAssociationsRepository,
    ]),
    RabbitMessageQueueModule.forRoot(),
  ],
  controllers: [
    DbController,
    DbRecordsAssociationsController,
  ],
  providers: [
    DbService,
    DbServiceRabbitmqHandler,
    DbServiceRabbitmqRpc,
    DbRecordsRepository,
    DbRecordsColumnsRepository,
    DbRecordsServiceInternal,
    DbRecordsPrincipalServiceInternal,
    DbRecordsService,
    DbRecordsRabbitmqHandler,
    DbRecordsAssociationsService,
    DbRecordsAssociationsServiceInternal,
    DbRecordsAssociationsRabbitmqHandler,
  ],
  exports: [
    DbService,
    DbRecordsService,
    DbRecordsAssociationsService,
  ],
})
export class DbModule {
}
