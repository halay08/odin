import { OrganizationUserEntity } from '../organization.user.entity';
import { OrganizationUserRbacRoleEntity } from '../rbac/role/organization.user.rbac.role.entity';

export const hasRole = (principal: OrganizationUserEntity, roleName: string): boolean => {
  return !!principal.roles.find((elem: OrganizationUserRbacRoleEntity) => elem.name === roleName)
};
