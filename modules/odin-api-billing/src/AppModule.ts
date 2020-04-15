import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { schemaManagerModules } from '@d19n/schema-manager/dist/modules';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { DashboardsModule } from './dashboards/dashboards.module';
import { GocardlessModule } from './gocardless/gocardless.module';
import { GocardlessEventEntity } from './gocardless/webhook/events/types/gocardless.event.entity';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { InvoicesModule } from './invoices/invoices.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { PaymentMethodsModule } from './payment-methods/payment.methods.module';
import { TransactionsModule } from './transactions/transactions.module';

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
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            synchronize: false,
            keepConnectionAlive: true,
            namingStrategy: new SnakeNamingStrategy(),
            subscribers: [],
            entities: [
                GocardlessEventEntity,
                ...schemaManagerEntities,
            ],
        }),
        DashboardsModule,
        MonitoringModule,
        GocardlessModule,
        InvoicesModule,
        TransactionsModule,
        PaymentMethodsModule,
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
