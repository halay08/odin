import { OrganizationAppEntity } from "@d19n/models/dist/identity/organization/app/organization.app.entity";
import { OrganizationUserGroupEntity } from "@d19n/models/dist/identity/organization/user/group/organization.user.group.entity";
import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { OrganizationUserRbacPermissionEntity } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity";
import { OrganizationUserRbacRoleEntity } from "@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity";
import { OrganizationUserTokenEntity } from "@d19n/models/dist/identity/organization/user/token/organization.user.token.entity";

export const getUserFromShortListByUserId = (
    shortList: { [key: string]: OrganizationUserEntity },
    userId: string | null | undefined,
  ): OrganizationUserEntity | undefined => {
    return userId ? shortList[userId] : undefined;
  };

export const getRoleFromShortListByUserId = (
    shortList: { [key: string]: OrganizationUserRbacRoleEntity },
    roleId: string | null | undefined,
  ): OrganizationUserRbacRoleEntity | undefined => {
    return roleId ? shortList[roleId] : undefined;
  };

export const getPermissionFromShortListByPermissionId = (
  shortList: { [key: string]: OrganizationUserRbacPermissionEntity },
  permissionId: string | null | undefined,
): OrganizationUserRbacPermissionEntity | undefined => {
  return permissionId ? shortList[permissionId] : undefined;
};

export const getGroupFromShortListByGroupId = (
  shortList: { [key: string]: OrganizationUserGroupEntity },
  groupId: string | null | undefined,
): OrganizationUserGroupEntity | undefined => {
  return groupId ? shortList[groupId] : undefined;
};

export const getTokenFromShortListByTokenId = (
  shortList: { [key: string]: OrganizationUserTokenEntity },
  tokenId: string | null | undefined,
): OrganizationUserTokenEntity | undefined => {
  return tokenId ? shortList[tokenId] : undefined;
};

export const getConnectedAppFromShortListByConnectedAppId = (
  shortList: { [key: string]: OrganizationAppEntity },
  connectedAppId: string | null | undefined,
): OrganizationAppEntity | undefined => {
  return connectedAppId ? shortList[connectedAppId] : undefined;
};