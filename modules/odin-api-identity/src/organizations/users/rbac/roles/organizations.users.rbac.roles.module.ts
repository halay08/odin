import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redis from 'redis';
import { OrganizationUsersModule } from '../../organizations.users.module';
import { OrganizationsUserRbacPermissionsModule } from '../permissions/organizations.user.rbac.permissions.module';
import { OrganizationsUsersRbacPermissionsRepository } from '../permissions/organizations.users.rbac.permissions.repository';
import { OrganizationsUsersRbacRolesController } from './organizations.users.rbac.roles.controller';
import { OrganizationsUsersRbacRolesRepository } from './organizations.users.rbac.roles.repository';
import { OrganizationsUsersRbacRolesService } from './organizations.users.rbac.roles.service';

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
        TypeOrmModule.forRoot({
            type: 'postgres',
            name: 'odinDbConnection',
            keepConnectionAlive: true,
            host: process.env.DB_HOSTNAME,
            port: Number.parseInt(process.env.DB_ONE_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        }),
        TypeOrmModule.forFeature([
            OrganizationsUsersRbacRolesRepository,
            OrganizationsUsersRbacPermissionsRepository,
        ]),
        OrganizationsUserRbacPermissionsModule,
        forwardRef(() => OrganizationUsersModule),
    ],
    controllers: [
        OrganizationsUsersRbacRolesController,
    ],
    providers: [
        OrganizationsUsersRbacRolesService,
        redisProvider,
    ],
    exports: [
        OrganizationsUsersRbacRolesService,
    ],
})
export class OrganizationsUsersRbacRolesModule {
}
