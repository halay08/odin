import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redis from 'redis';
import { OrganizationUsersModule } from 'src/organizations/users/organizations.users.module';
import { OrganizationsUserRbacPermissionsModule } from 'src/organizations/users/rbac/permissions/organizations.user.rbac.permissions.module';
import { OrganizationsUsersRbacPermissionsRepository } from 'src/organizations/users/rbac/permissions/organizations.users.rbac.permissions.repository';
import { OrganizationsSchemasRbacPermissionsController } from './organizations.schemas.rbac.permissions.controller';
import { OrganizationsSchemasRbacPermissionsService } from './organizations.schemas.rbac.permissions.service';

const { SCHEMA_MODULE } = SchemaModuleTypeEnums;

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
        RabbitMessageQueueModule.forRoot(),
        TypeOrmModule.forFeature([
            OrganizationsUsersRbacPermissionsRepository,
        ]),
        OrganizationsUserRbacPermissionsModule,
        forwardRef(() => OrganizationUsersModule),
    ],
    controllers: [
        OrganizationsSchemasRbacPermissionsController,
    ],
    providers: [
        OrganizationsSchemasRbacPermissionsService,
        redisProvider,
    ],
    exports: [
        OrganizationsSchemasRbacPermissionsService,
    ],
})
export class OrganizationsSchemasRbacPermissionsModule {
}
