import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LogsUserActivityModule } from './logs/user-activity/logs.user.activity.module';
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
        MonitoringModule,
        LogsUserActivityModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
