import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { DbSearchModule } from '@d19n/schema-manager/dist/db/search/db.search.module';
import { schemaManagerModules } from '@d19n/schema-manager/dist/modules';
import { PromModule } from '@digikare/nestjs-prom';
import { Client } from '@elastic/elasticsearch';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { MonitoringModule } from './monitoring/monitoring.module';
import { SearchIndexingRabbitmqHandler } from './search/search.indexing.rabbitmq.handler';


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
        PromModule.forRoot({
            defaultLabels: {
                app: process.env.MODULE_NAME,
                version: '0.0.0',
            },
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            keepConnectionAlive: true,
            namingStrategy: new SnakeNamingStrategy(),
            entities: schemaManagerEntities,
            extra: { connectionLimit: 10 },
            replication: {
                master: {
                    host: process.env.DB_HOSTNAME,
                    port: Number.parseInt(process.env.DB_PORT),
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                },
                slaves: [
                    {
                        host: process.env.DB_HOSTNAME_SLAVE || process.env.DB_HOSTNAME,
                        port: Number.parseInt(process.env.D_PORT_SLAVE || process.env.DB_PORT),
                        username: process.env.DB_USERNAME_SLAVE || process.env.DB_USERNAME,
                        password: process.env.DB_PASSWORD_SLAVE || process.env.DB_PASSWORD,
                        database: process.env.DB_NAME_SLAVE || process.env.DB_NAME,
                    },
                ],
            },
        }),
        RabbitMessageQueueModule.forRoot(),
        MonitoringModule,
        DbSearchModule,
        ...schemaManagerModules,
    ],
    controllers: [
        InitializeContoller,
    ],
    providers: [
        InitializeService,
        SearchIndexingRabbitmqHandler,
        elasticSearchProvider,
        {
            provide: APP_INTERCEPTOR,
            useClass: ControllerInterceptor,
        },
    ],
    exports: [],
})
export class AppModule {
}
