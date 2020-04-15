import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redis from 'redis';
import { REDIS_CLIENT } from '../../utilities/Constants';
import { OrganizationsAppsController } from './organizations.apps.controller';
import { OrganizationsAppsRepository } from './organizations.apps.repository';
import { OrganizationsAppsService } from './organizations.apps.service';
import { OrganizationsAppsServiceRpc } from './organizations.apps.service.rpc';

const redisProviders = {
    provide: REDIS_CLIENT,
    useFactory: async () => {
        const client = await redis.createClient({
            host: process.env.REDIS_ENDPOINT || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            expire: 10,
        });
        client.on('error', (error) => {
            console.error(error);
        });
        client.on('drain', (e) => {
            client.quit();
        });
        return client;
    },
};

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrganizationsAppsRepository,
        ]),
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        OrganizationsAppsController,
    ],
    providers: [
        OrganizationsAppsService,
        OrganizationsAppsServiceRpc,
        redisProviders,
    ],
    exports: [
        OrganizationsAppsService,
    ],

})
export class OrganizationsAppsModule {
}
