import { Injectable }                               from '@nestjs/common';
import * as dotenv                                  from 'dotenv';
import { OrganizationUserRbacRoleEntity }           from "@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity";
import { OrganizationUserEntity }                   from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { ExceptionType }                            from "@d19n/common/dist/exceptions/types/ExceptionType";
import { OrganizationUserRbacPermissionEntity }     from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { OrganizationsUsersRbacPermissionsService } from './permissions/organizations.users.rbac.permissions.service';
import { OrganizationsUsersRbacRolesService }       from './roles/organizations.users.rbac.roles.service';
import { RBAC_DEFAULT_ROLES }                       from "./roles/types/RBACDefaultRoles";
import { ConstructRoleAndPermissions }              from "../../../helpers/ConstructRoleAndPermissions";
import { RBACCreate }                               from "./types/RBACCreate";

dotenv.config();

@Injectable()
export class OrganizationsUsersRbacService {

    public constructor(
        private rolesService: OrganizationsUsersRbacRolesService,
        private permissionsService: OrganizationsUsersRbacPermissionsService
    ) {

    }

    /**
     * Initialize an Admin user
     * @param principal
     */
    public async initializeAdmin(principal: OrganizationUserEntity) {
        console.log("intiazalize admin user", principal);
        try {
            for ( let roleCreate of RBAC_DEFAULT_ROLES ) {
                console.log(`Creating role "${roleCreate.name} with (${roleCreate.permissions.length}) permissions..`);
                const roleEntity: OrganizationUserRbacRoleEntity = await this.rolesService.createByPrincipal(principal, roleCreate);
                for ( let permissionCreate of roleCreate.permissions ) {
                    console.log(`Creating permission "${permissionCreate.name}"..`);
                    const permissionEntity = await this.permissionsService.create(principal, permissionCreate);
                    console.log(`Assigning permission "${permissionCreate.name}" to role "${roleEntity.name}..`);
                    await this.rolesService.addPermission(principal, roleEntity.id, permissionEntity.id);
                }
                console.log(`Assigning role "${roleCreate.name} to user "${principal.email}`);
                await this.rolesService.assignToOrganizationUserEntity(principal, roleEntity.id, principal.id);
            }
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

    /**
     * Initialize an Admin user
     * @param principal
     * @param body
     */
    public async createRoleAndPermissionsByPrincipal(
        principal: OrganizationUserEntity,
        body: RBACCreate
    ): Promise<OrganizationUserRbacRoleEntity> {
        return new Promise(async (resolve, reject) => {
            try {
                const rbacCreate = new ConstructRoleAndPermissions(body.name, body.permissionType).createAdmin();
                console.log(`Creating role "${rbacCreate.name} with (${rbacCreate.permissions.length}) permissions..`);
                const roleEntity: OrganizationUserRbacRoleEntity = await this.rolesService.createByPrincipal(principal, rbacCreate);
                for ( let permissionCreate of rbacCreate.permissions ) {
                    const permission: OrganizationUserRbacPermissionEntity = await this.permissionsService.getByOrganizationAndTypeAndName(principal.organization, permissionCreate.type, permissionCreate.name, { noErrors: true });
                    if ( !permission ) {
                        console.log(`Creating permission "${permissionCreate.name}"..`);
                        const permissionEntity: OrganizationUserRbacPermissionEntity = await this.permissionsService.create(principal, permissionCreate);
                        console.log(`Assigning permission "${permissionCreate.name}" to role "${roleEntity.name}..`);
                        await this.rolesService.addPermission(principal, roleEntity.id, permissionEntity.id);
                    }
                }

                console.log(`Assigning role "${rbacCreate.name} to user "${principal.email}`);
                await this.rolesService.assignToOrganizationUserEntity(principal, roleEntity.id, principal.id);

                const role: OrganizationUserRbacRoleEntity = await this.rolesService.getByOrganizationAndId(principal.organization, roleEntity.id);
                return resolve(role);
            } catch (e) {
                return reject(new ExceptionType(500, e.message));
            }
        });
    }
}
