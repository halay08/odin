import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { MonitoringModule } from './monitoring/monitoring.module';
import { QueryEntity } from './queries/queries.entity';
import { QueriesModule } from './queries/queries.module';
import { ReportingModule } from './reporting/reporting.module';
import { ScriptsModule } from './scripts/scripts.module';

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
            name: 'myahDatabase',
            keepConnectionAlive: true,
            host: process.env.DB_MYAH_HOSTNAME,
            port: Number.parseInt(process.env.DB_MYAH_PORT) || 5432,
            username: process.env.DB_MYAH_USERNAME,
            password: process.env.DB_MYAH_PASSWORD,
            database: process.env.DB_MYAH_NAME,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'cosmosDatabase',
            keepConnectionAlive: true,
            host: process.env.DB_GIS_HOSTNAME || 'localhost',
            port: Number.parseInt(process.env.DB_GIS_PORT) || 5432,
            username: process.env.DB_GIS_USERNAME || 'postgres',
            password: process.env.DB_GIS_PASSWORD || 'postgres',
            database: process.env.DB_GIS_NAME || 'odin',
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'odinDb',
            keepConnectionAlive: true,
            host: process.env.DB_HOSTNAME || 'localhost',
            port: Number.parseInt(process.env.DB_GIS_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'odin',
            namingStrategy: new SnakeNamingStrategy(),
            entities: [
                ...schemaManagerEntities,
                QueryEntity,
            ],
        }),
        MonitoringModule,
        ReportingModule,
        QueriesModule,
        ScriptsModule,
    ],
})
export class AppModule {
}
