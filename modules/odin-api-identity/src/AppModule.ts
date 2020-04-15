import { OrganizationAppEntity } from '@d19n/models/dist/identity/organization/app/organization.app.entity';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserGroupEntity } from '@d19n/models/dist/identity/organization/user/group/organization.user.group.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { OrganizationUserRbacRoleEntity } from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { OrganizationUserTokenEntity } from '@d19n/models/dist/identity/organization/user/token/organization.user.token.entity';
import { schemaManagerEntities } from '@d19n/models/dist/schema-manager/entities';
import { PromModule } from '@digikare/nestjs-prom';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { MonitoringModule } from './monitoring/monitoring.module';
import { OrganizationsAppsModule } from './organizations/apps/organizations.apps.module';
import { OrganizationEntitysModule } from './organizations/organizations.module';
import { OrganizationsSchemasColumnsRbacPermissionsModule } from './organizations/schemas/rbac/columns/organizations.schemas.columns.rbac.permissions.module';
import { OrganizationsSchemasRbacPermissionsModule } from './organizations/schemas/rbac/permissions/organizations.schemas.rbac.permissions.module';
import { OrganizationUserEntityLoginHistoryEntity } from './organizations/users/authentication/organizations.users.authentication.login.history.entity';
import { OrganizationUsersModule } from './organizations/users/organizations.users.module';
import { OrganizationsUsersRbacModule } from './organizations/users/rbac/organizations.users.rbac.module';
import { OrganizationsUserRbacPermissionsModule } from './organizations/users/rbac/permissions/organizations.user.rbac.permissions.module';
import { OrganizationsUsersRbacRolesModule } from './organizations/users/rbac/roles/organizations.users.rbac.roles.module';
import { OrganizationsUsersTokensModule } from './organizations/users/tokens/organizations.users.tokens.module';

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
            keepConnectionAlive: true,
            namingStrategy: new SnakeNamingStrategy(),
            subscribers: [],
            entities: [
                OrganizationEntity,
                OrganizationAppEntity,
                OrganizationUserRbacPermissionEntity,
                OrganizationUserRbacRoleEntity,
                OrganizationUserEntity,
                OrganizationUserGroupEntity,
                OrganizationUserEntityLoginHistoryEntity,
                OrganizationUserTokenEntity,
                ...schemaManagerEntities,
            ],
        }),
        MonitoringModule,
        OrganizationEntitysModule,
        OrganizationsAppsModule,
        OrganizationsUsersRbacModule,
        OrganizationsUsersRbacRolesModule,
        OrganizationsUserRbacPermissionsModule,
        OrganizationUsersModule,
        OrganizationsUsersTokensModule,
        OrganizationsSchemasRbacPermissionsModule,
        OrganizationsSchemasColumnsRbacPermissionsModule,
    ],
    exports: [
        OrganizationEntitysModule,
        OrganizationsUsersRbacModule,
        OrganizationUsersModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: ControllerInterceptor,
        },
    ],

})
export class AppModule {
}
