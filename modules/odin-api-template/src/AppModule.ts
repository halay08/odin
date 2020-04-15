import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { DbModule } from '@d19n/schema-manager/dist/db/db.module';
import { DbRecordsAssociationsModule } from '@d19n/schema-manager/dist/db/records/associations/db.records.associations.module';
import { LogsUserActivityModule } from '@d19n/schema-manager/dist/logs/user-activity/logs.user.activity.module';
import { PipelineEntitysModule } from '@d19n/schema-manager/dist/pipelines/pipelines.module';
import { SchemasAssociationsModule } from '@d19n/schema-manager/dist/schemas/associations/schemas.associations.module';
import { SchemasColumnsModule } from '@d19n/schema-manager/dist/schemas/columns/schemas.columns.module';
import { SchemasModule } from '@d19n/schema-manager/dist/schemas/schemas.module';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { MonitoringModule } from './monitoring/monitoring.module';


dotenv.config();

@Module({
    imports: [
        MonitoringModule,
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            keepConnectionAlive: true,
            namingStrategy: new SnakeNamingStrategy(),
            subscribers: [],
            entities: schemaManagerEntities,
        }),
        SchemasModule,
        SchemasColumnsModule,
        SchemasAssociationsModule,
        PipelineEntitysModule,
        DbRecordsAssociationsModule,
        DbModule,
        LogsUserActivityModule,
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
    exports: [],
})
export class AppModule {
}
