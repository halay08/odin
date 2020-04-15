import { RabbitMessageQueueModule } from '@d19n/client/dist/rabbitmq/rabbitmq.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redis from 'redis';
import { OrganizationEntitysModule } from '../organizations.module';
import { OrganizationUserEntityLoginHistoryRepository } from './authentication/organizations.users.authentication.login.history.repository';
import { OrganizationUserEntityLoginHistoryService } from './authentication/organizations.users.authentication.login.history.service';
import { OrganizationsUsersGroupsController } from './groups/organizations.users.groups.controller';
import { OrganizationsUsersGroupsRepository } from './groups/organizations.users.groups.repository';
import { OrganizationsUsersGroupsService } from './groups/organizations.users.groups.service';
import { OrganizationUserEntitysController } from './organizations.users.controller';
import { OrganizationUserEntityRepository } from './organizations.users.repository';
import { OrganizationUsersService } from './organizations.users.service';
import { OrganizationsUsersServiceRpc } from './organizations.users.service.rpc';
import { OrganizationsUsersRbacModule } from './rbac/organizations.users.rbac.module';
import { OrganizationsUsersRbacRolesModule } from './rbac/roles/organizations.users.rbac.roles.module';


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
        OrganizationEntitysModule,
        forwardRef(() => OrganizationsUsersRbacRolesModule),
        forwardRef(() => OrganizationsUsersRbacModule),
        TypeOrmModule.forFeature([
            OrganizationUserEntityRepository,
            OrganizationUserEntityLoginHistoryRepository,
            OrganizationsUsersGroupsRepository,
        ]),
        RabbitMessageQueueModule.forRoot(),
    ],
    controllers: [
        OrganizationUserEntitysController,
        OrganizationsUsersGroupsController,
    ],
    providers: [
        OrganizationUsersService,
        OrganizationUserEntityLoginHistoryService,
        OrganizationsUsersGroupsService,
        OrganizationsUsersServiceRpc,
        redisProvider,
    ],
    exports: [
        OrganizationUsersService,
    ],

})
export class OrganizationUsersModule {

}
