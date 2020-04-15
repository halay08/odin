import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Client } from '@elastic/elasticsearch';
import { forwardRef, Module } from '@nestjs/common';
import dotenv from 'dotenv';
import { SchemasModule } from '../../schemas/schemas.module';
import { DbModule } from '../db.module';
import { DbSearchService } from './db.search.service';

dotenv.config();

const elasticSearchProvider = {
  provide: 'ELASTIC_SEARCH_CLIENT',
  useFactory: async () => {
    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    return client;
  },
};

@Module({
  imports: [
    forwardRef(() => DbModule),
    forwardRef(() => SchemasModule),
    RabbitMessageQueueModule.forRoot(),
  ],
  controllers: [],
  providers: [
    DbSearchService,
    elasticSearchProvider,
  ],
  exports: [
    DbSearchService,
  ],
})
export class DbSearchModule {
}
