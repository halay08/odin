import { OrganizationUserEntity } from '../organization.user.entity';
import { OrganizationUserRbacPermissionEntity } from '../rbac/permission/organization.user.rbac.permission.entity';

export const hasPermission = (principal: OrganizationUserEntity, permissionName: string): boolean => {
  for(const role of principal.roles) {
    if(role) {
      // @ts-ignore
      const hasPermission = !!role.permissions.find((permission: OrganizationUserRbacPermissionEntity) => permission.name === permissionName);
      if(hasPermission) {
        return true;
      }
    }
  }
 
  return false;
};
