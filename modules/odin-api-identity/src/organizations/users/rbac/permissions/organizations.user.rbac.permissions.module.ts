import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redis from 'redis';
import { OrganizationUsersModule } from '../../organizations.users.module';
import { OrganizationsUsersRbacPermissionsRepository } from '../permissions/organizations.users.rbac.permissions.repository';
import { OrganizationsUsersRbacPermissionsController } from './organizations.users.rbac.permissions.controller';
import { OrganizationsUsersRbacPermissionsService } from './organizations.users.rbac.permissions.service';

const redisProvider = {
    provide: 'REDIS_CLIENT',
    useFactory: async () => {
        const client = await redis.createClient({
            host: process.env.REDIS_ENDPOINT || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            expire: 30,
        });
        console.log('redis client connected');
        client.on('error', (error) => {
            console.error(error);
            process.exit(1);
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
            OrganizationsUsersRbacPermissionsRepository,
        ]),
        forwardRef(() => OrganizationUsersModule),
    ],
    controllers: [
        OrganizationsUsersRbacPermissionsController,
    ],
    providers: [
        OrganizationsUsersRbacPermissionsService,
        redisProvider,
    ],
    exports: [
        OrganizationsUsersRbacPermissionsService,
    ],
})
export class OrganizationsUserRbacPermissionsModule {
}
