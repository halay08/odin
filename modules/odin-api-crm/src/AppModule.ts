import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { schemaManagerModules } from '@d19n/schema-manager/dist/modules';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AccountsModule } from './accounts/accounts.module';
import { AddressesModule } from './addresses/addresses.module';
import { CheckoutModule } from './checkout/checkout.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { LeadsModule } from './leads/leads.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PremisesModule } from './premise/premises.module';
import { VisitsModule } from './visit/visits.module';

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
            name: 'odinDbConnection',
            keepConnectionAlive: true,
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_GIS_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        }),
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
        AccountsModule,
        AddressesModule,
        LeadsModule,
        CheckoutModule,
        PremisesModule,
        VisitsModule,
        MonitoringModule,
        DashboardsModule,
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
    exports: [],
})
export class AppModule {
}
