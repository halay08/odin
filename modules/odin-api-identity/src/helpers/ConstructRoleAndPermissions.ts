import { RBACPermissionCreate } from "../organizations/users/rbac/permissions/types/RBACPermissionCreate";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type";

export class ConstructRoleAndPermissions {

    constructor(
        private readonly name: string,
        private readonly permissionType: ORGANIZATION_USER_RBAC_PERMISSION_TYPE
    ) {
        this.name = name;
        this.permissionType = permissionType;
    }

    public createAdmin() {
        try {
            const RBAC_SEARCH: RBACPermissionCreate = {
                name: `${this.name}.search`,
                description: `OrganizationUserEntity can search/list all ${this.name}.`,
                type: this.permissionType
            };

            const RBAC_GET: RBACPermissionCreate = {
                name: `${this.name}.get`,
                description: `OrganizationUserEntity can view all ${this.name}.`,
                type: this.permissionType
            };
            const RBAC_CREATE: RBACPermissionCreate = {
                name: `${this.name}.create`,
                description: `OrganizationUserEntity can create ${this.name}.`,
                type: this.permissionType
            };
            const RBAC_UPDATE: RBACPermissionCreate = {
                name: `${this.name}.update`,
                description: `OrganizationUserEntity can update ${this.name}.`,
                type: this.permissionType
            };
            const RBAC_DELETE: RBACPermissionCreate = {
                name: `${this.name}.delete`,
                description: `OrganizationUserEntity can delete ${this.name}.`,
                type: this.permissionType
            };

            return {
                name: `${this.name}.admin`,
                description: 'OrganizationUserEntity has full control over roles',
                permissions: [
                    RBAC_SEARCH,
                    RBAC_GET,
                    RBAC_CREATE,
                    RBAC_UPDATE,
                    RBAC_DELETE
                ]
            };
        } catch (e) {
            throw new ExceptionType(500, e.message);
        }
    }

}
