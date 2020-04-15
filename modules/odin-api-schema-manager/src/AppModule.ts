import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { schemaManagerModules } from './modules';
import { MonitoringModule } from './monitoring/monitoring.module';

dotenv.config();

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
      logging: true,
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
    MonitoringModule,
    ...schemaManagerModules,
  ],
  controllers: [
    InitializeContoller,
  ],
  providers: [
    InitializeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ControllerInterceptor,
    },
  ],
})
export class AppModule {
}
