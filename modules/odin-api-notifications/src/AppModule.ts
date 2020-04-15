import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MonitoringModule } from './monitoring/monitoring.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { SendgridMailEventEntity } from './sendgrid/types/sendgrid.mail.event.entity';
import { TemplatesEmailEntity } from './templates/email/templates.email.entity';
import { TemplatesEmailModule } from './templates/email/templates.email.module';

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
                ...schemaManagerEntities,
                TemplatesEmailEntity,
                SendgridMailEventEntity,
            ],
        }),
        MonitoringModule,
        SendgridModule,
        TemplatesEmailModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
}
