import { forwardRef, Module } from '@nestjs/common';
import { OrganizationUsersModule } from '../organizations.users.module';
import { OrganizationsUsersRbacController } from './organizations.users.rbac.controller';
import { OrganizationsUsersRbacService } from './organizations.users.rbac.service';
import { OrganizationsUserRbacPermissionsModule } from './permissions/organizations.user.rbac.permissions.module';
import { OrganizationsUsersRbacRolesModule } from './roles/organizations.users.rbac.roles.module';

@Module({

    imports: [
        OrganizationsUsersRbacRolesModule,
        OrganizationsUserRbacPermissionsModule,
        forwardRef(() => OrganizationUsersModule),
    ],
    controllers: [
        OrganizationsUsersRbacController,
    ],
    providers: [
        OrganizationsUsersRbacService,
    ],
    exports: [
        OrganizationsUsersRbacService,
    ],
})
export class OrganizationsUsersRbacModule {
}
