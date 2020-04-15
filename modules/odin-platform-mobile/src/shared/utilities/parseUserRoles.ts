import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";

export function parseUserRoles(authUser: OrganizationUserEntity) {
  let roles = [];
  let permissions = [];

  for(const role of authUser.roles) {
    roles.push(role.name);

    if(!!role.permissions) {
      for (const permission of role.permissions) {
        permissions.push(permission.name);
      }
    }
  }
  return {roles,permissions};
}
