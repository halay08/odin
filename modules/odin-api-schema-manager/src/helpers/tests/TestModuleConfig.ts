import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { Client } from '@elastic/elasticsearch';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import redis from 'redis';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ELASTIC_SEARCH_CLIENT } from '../../common/Constants';

dotenv.config();

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: async () => {
    const client = await redis.createClient({
      host: process.env.REDIS_ENDPOINT || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      expire: 60,
    });
    console.log('redis client connected');
    client.on('error', (error) => {
      console.error(error);
      process.exit(1);
    });
    client.on('drain', (e) => {
      client.quit();
    });
    return client;
  },
};

const elasticSearchProvider = {
  provide: ELASTIC_SEARCH_CLIENT,
  useFactory: async () => {
    const client: Client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    return client;
  },
};

export class TestModuleConfig {

  private readonly imports: any[];
  private readonly providers: any[];
  private readonly entities: any[];

  constructor(imports: any[], providers: any[], entities?: any[]) {
    this.imports = imports;
    this.providers = providers;
    this.entities = entities;
  }

  /**
   * Initialize a new test module
   */
  public initialize() {

    return Test.createTestingModule({
      imports: [
        ...this.imports,
        // LogsUserActivityModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOSTNAME,
          port: Number.parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          keepConnectionAlive: true,
          namingStrategy: new SnakeNamingStrategy(),
          subscribers: [],
          entities: [
            ...this.entities,
            ...schemaManagerEntities,
          ],
        }),
        RabbitMessageQueueModule.forRoot(),
      ],
      providers: [
        ...this.providers,
        elasticSearchProvider,
        redisProvider,
      ],
    }).compile();

  }
}
