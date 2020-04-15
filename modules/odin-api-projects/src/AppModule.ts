import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { schemaManagerModules } from '@d19n/schema-manager/dist/modules';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { FeatureComponentsModule } from './featurecomponents/feature.components.module';
import { FeatureModelsModule } from './featuremodels/feature.models.module';
import { FeaturesModule } from './features/features.module';
import { GisFtthClosuresModule } from './gis/ftth/closures/gis.ftth.closures.module';
import { GisFtthModule } from './gis/ftth/gis.ftth.module';
import { GisFtthPolygonsModule } from './gis/ftth/polygon/gis.ftth.polygons.module';
import { GisOsModule } from './gis/os/gis.os.module';
import { InitializeContoller } from './InitializeContoller';
import { InitializeService } from './InitializeService';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { MilestonesModule } from './milestones/milestones.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ProgramsModule } from './programs/programs.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';


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
            namingStrategy: new SnakeNamingStrategy(),
            entities: schemaManagerEntities,
            extra: { connectionLimit: 10 },
            logging: false,
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
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'cosmosDatabase',
            keepConnectionAlive: true,
            host: process.env.DB_GIS_HOSTNAME || 'localhost',
            port: Number.parseInt(process.env.DB_GIS_PORT) || 5432,
            username: process.env.DB_GIS_USERNAME || 'postgres',
            password: process.env.DB_GIS_PASSWORD || 'postgres',
            database: process.env.DB_GIS_NAME || 'cosmos',
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'myahDatabase',
            keepConnectionAlive: true,
            host: process.env.DB_MYAH_HOSTNAME || 'localhost',
            port: Number.parseInt(process.env.MYAH_DB_PORT) || 5432,
            username: process.env.DB_MYAH_USERNAME || 'posrgres',
            password: process.env.DB_MYAH_PASSWORD || 'postgres',
            database: process.env.DB_MYAH_NAME || 'myah',
        }),
        MonitoringModule,
        ProgramsModule,
        ProjectsModule,
        MilestonesModule,
        TasksModule,
        FeaturesModule,
        GisOsModule,
        GisFtthClosuresModule,
        GisFtthPolygonsModule,
        GisFtthModule,
        FeatureModelsModule,
        FeatureComponentsModule,
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
