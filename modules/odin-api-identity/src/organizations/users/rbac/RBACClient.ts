import { ServiceClient }                        from '@d19n/client/dist/client/ServiceClient';
import { ServiceResponse }                      from '@d19n/client/dist/client/ServiceResponse';
import { SERVICE_NAME }                         from '@d19n/client/dist/helpers/Services';
import { Utilities }                            from '@d19n/client/dist/helpers/Utilities';
import { OrganizationUserRbacPermissionEntity } from '@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity';
import { OrganizationUserRbacRoleEntity }       from '@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity';
import { Observable }                           from 'rxjs';
import { RBACPermissionCreate }                 from './permissions/types/RBACPermissionCreate';
import { RBACRoleCreate }                       from './roles/types/RBACRoleCreate';

export class RBACClient {

    public static roleCreate(
        jwt: string,
        roleCreate: RBACRoleCreate
    ): Observable<ServiceResponse<OrganizationUserRbacRoleEntity>> {

        return ServiceClient.call<OrganizationUserRbacRoleEntity>({

            facility: 'http',
            service: 'identity/rbac/roles',
            method: 'post',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            headers: {

                Authorization: `Bearer ${jwt}`

            },
            body: roleCreate,

        });

    }

    public static roleAddPermission(
        jwt: string,
        roleId: string,
        permissionId: string
    ): Observable<ServiceResponse<OrganizationUserRbacRoleEntity>> {

        return ServiceClient.call<OrganizationUserRbacRoleEntity>({

            facility: 'http',
            service: `identity/rbac/roles/${roleId}/permissions/${permissionId}`,
            method: 'post',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            headers: {

                Authorization: `Bearer ${jwt}`

            }

        });

    }

    public static permissionCreate(
        jwt: string,
        permissionCreate: RBACPermissionCreate
    ): Observable<ServiceResponse<OrganizationUserRbacPermissionEntity>> {

        return ServiceClient.call<OrganizationUserRbacPermissionEntity>({

            facility: 'http',
            service: 'identity/rbac/permissions',
            method: 'post',
            baseUrl: Utilities.getBaseUrl(SERVICE_NAME.IDENTITY_MODULE),
            headers: {

                Authorization: `Bearer ${jwt}`

            },
            body: permissionCreate,

        });

    }

}
