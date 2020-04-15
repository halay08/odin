import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Client } from '@elastic/elasticsearch';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbCacheModule } from '../cache/db.cache.module';
import { ELASTIC_SEARCH_CLIENT } from '../common/Constants';
import { LogsUserActivityModule } from '../logs/user-activity/logs.user.activity.module';
import { SchemasAssociationsController } from './associations/schemas.associations.controller';
import { SchemasAssociationsRepository } from './associations/schemas.associations.repository';
import { SchemasAssociationsService } from './associations/schemas.associations.service';
import { SchemasColumnsOptionsRepository } from './columns/options/schemas.columns.options.repository';
import { SchemasColumnsOptionsService } from './columns/options/schemas.columns.options.service';
import { SchemasColumnsController } from './columns/schemas.columns.controller';
import { SchemasColumnsRabbitmqServiceRpc } from './columns/schemas.columns.rabbitmq.service.rpc';
import { SchemasColumnsRepository } from './columns/schemas.columns.repository';
import { SchemasColumnsService } from './columns/schemas.columns.service';
import { SchemasColumnsValidatorsRepository } from './columns/validators/schemas.columns.validators.repository';
import { SchemasColumnsValidatorsService } from './columns/validators/schemas.columns.validators.service';
import { SchemasController } from './schemas.controller';
import { SchemasRabbitmqServiceRpc } from './schemas.rabbitmq.service.rpc';
import { SchemasRepository } from './schemas.repository';
import { SchemasService } from './schemas.service';
import { SchemasTypesController } from './types/schemas.types.controller';
import { SchemasTypesRepository } from './types/schemas.types.repository';
import { SchemasTypesService } from './types/schemas.types.service';


const elasticSearchProvider = {
  provide: ELASTIC_SEARCH_CLIENT,
  useFactory: async () => {
    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    return client;
  },
};


@Module({
  imports: [
    forwardRef(() => LogsUserActivityModule),
    DbCacheModule,
    TypeOrmModule.forFeature([
      SchemasRepository,
      SchemasTypesRepository,
      SchemasAssociationsRepository,
      SchemasColumnsRepository,
      SchemasColumnsOptionsRepository,
      SchemasColumnsValidatorsRepository,
    ]),
    RabbitMessageQueueModule.forRoot(),
  ],
  controllers: [
    SchemasController,
    SchemasTypesController,
    SchemasColumnsController,
    SchemasAssociationsController,
  ],
  providers: [
    SchemasService,
    SchemasTypesService,
    elasticSearchProvider,
    SchemasRabbitmqServiceRpc,
    SchemasAssociationsService,
    SchemasColumnsService,
    SchemasColumnsOptionsService,
    SchemasColumnsValidatorsService,
    SchemasColumnsRabbitmqServiceRpc,
  ],
  exports: [
    SchemasService,
    SchemasTypesService,
    SchemasAssociationsService,
    SchemasColumnsService,
    SchemasColumnsOptionsService,
    SchemasColumnsValidatorsService,
  ],
})
export class SchemasModule {
}
