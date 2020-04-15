import { RBACPermissionCreate }                   from './RBACPermissionCreate';
import { ORGANIZATION_USER_RBAC_PERMISSION_TYPE } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.type";


// Deafult Schema Permissions
export const RBAC_DEFAULT_PERMISSION_SCHEMAS_SEARCH: RBACPermissionCreate = {

    name: 'schemas.search',
    description: 'OrganizationUserEntity can search/list all schemas.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.SCHEMA

};

export const RBAC_DEFAULT_PERMISSION_SCHEMAS_GET: RBACPermissionCreate = {

    name: 'schemas.get',
    description: 'OrganizationUserEntity can view information about a schema.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.SCHEMA


};

export const RBAC_DEFAULT_PERMISSION_SCHEMAS_CREATE: RBACPermissionCreate = {

    name: 'schemas.create',
    description: 'OrganizationUserEntity can create new schemas.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.SCHEMA

};

export const RBAC_DEFAULT_PERMISSION_SCHEMAS_UPDATE: RBACPermissionCreate = {

    name: 'schemas.update',
    description: 'OrganizationUserEntity can update an existing schemas.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.SCHEMA

};

export const RBAC_DEFAULT_PERMISSION_SCHEMAS_DELETE: RBACPermissionCreate = {

    name: 'schemas.delete',
    description: 'OrganizationUserEntity can delete schemas.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.SCHEMA

};


// Deafult OrganizationUserEntity Permissions
export const RBAC_DEFAULT_PERMISSION_USERS_SEARCH: RBACPermissionCreate = {

    name: 'users.search',
    description: 'OrganizationUserEntity can search/list all users.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.USER

};

export const RBAC_DEFAULT_PERMISSION_USERS_GET: RBACPermissionCreate = {

    name: 'users.get',
    description: 'OrganizationUserEntity can view information about a user.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.USER


};

export const RBAC_DEFAULT_PERMISSION_USERS_CREATE: RBACPermissionCreate = {

    name: 'users.create',
    description: 'OrganizationUserEntity can create new users.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.USER

};

export const RBAC_DEFAULT_PERMISSION_USERS_UPDATE: RBACPermissionCreate = {

    name: 'users.update',
    description: 'OrganizationUserEntity can update an existing users.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.USER

};

export const RBAC_DEFAULT_PERMISSION_USERS_DELETE: RBACPermissionCreate = {

    name: 'users.delete',
    description: 'OrganizationUserEntity can delete users.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.USER

};


// Deafult Role Permissions
export const RBAC_DEFAULT_PERMISSION_ROLES_SEARCH: RBACPermissionCreate = {

    name: 'roles.search',
    description: 'OrganizationUserEntity can search/list all roles.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.ROLE

};

export const RBAC_DEFAULT_PERMISSION_ROLES_GET: RBACPermissionCreate = {

    name: 'roles.get',
    description: 'OrganizationUserEntity can view information about a role.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.ROLE


};

export const RBAC_DEFAULT_PERMISSION_ROLES_CREATE: RBACPermissionCreate = {

    name: 'roles.create',
    description: 'OrganizationUserEntity can create new roles.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.ROLE

};

export const RBAC_DEFAULT_PERMISSION_ROLES_UPDATE: RBACPermissionCreate = {

    name: 'roles.update',
    description: 'OrganizationUserEntity can update an existing roles.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.ROLE

};

export const RBAC_DEFAULT_PERMISSION_ROLES_DELETE: RBACPermissionCreate = {

    name: 'roles.delete',
    description: 'OrganizationUserEntity can delete roles.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.ROLE

};


// Deafult Permission Permissions
export const RBAC_DEFAULT_PERMISSION_PERMISSIONS_SEARCH: RBACPermissionCreate = {

    name: 'permissions.search',
    description: 'OrganizationUserEntity can search/list all permissions.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PERMISSION

};

export const RBAC_DEFAULT_PERMISSION_PERMISSIONS_GET: RBACPermissionCreate = {

    name: 'permissions.get',
    description: 'OrganizationUserEntity can view information about a permission.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PERMISSION


};

export const RBAC_DEFAULT_PERMISSION_PERMISSIONS_CREATE: RBACPermissionCreate = {

    name: 'permissions.create',
    description: 'OrganizationUserEntity can create new permissions.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PERMISSION

};

export const RBAC_DEFAULT_PERMISSION_PERMISSIONS_UPDATE: RBACPermissionCreate = {

    name: 'permissions.update',
    description: 'OrganizationUserEntity can update an existing permissions.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PERMISSION

};

export const RBAC_DEFAULT_PERMISSION_PERMISSIONS_DELETE: RBACPermissionCreate = {

    name: 'permissions.delete',
    description: 'OrganizationUserEntity can delete permissions.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PERMISSION

};


// Deafult Group Permissions
export const RBAC_DEFAULT_PERMISSION_GROUPS_SEARCH: RBACPermissionCreate = {

    name: 'groups.search',
    description: 'OrganizationUserEntity can search/list all groups.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.GROUP

};

export const RBAC_DEFAULT_PERMISSION_GROUPS_GET: RBACPermissionCreate = {

    name: 'groups.get',
    description: 'OrganizationUserEntity can view information about a group.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.GROUP


};

export const RBAC_DEFAULT_PERMISSION_GROUPS_CREATE: RBACPermissionCreate = {

    name: 'groups.create',
    description: 'OrganizationUserEntity can create new groups.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.GROUP

};

export const RBAC_DEFAULT_PERMISSION_GROUPS_UPDATE: RBACPermissionCreate = {

    name: 'groups.update',
    description: 'OrganizationUserEntity can update an existing groups.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.GROUP

};

export const RBAC_DEFAULT_PERMISSION_GROUPS_DELETE: RBACPermissionCreate = {

    name: 'groups.delete',
    description: 'OrganizationUserEntity can delete groups.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.GROUP

};


// Deafult PipelineEntity Permissions
export const RBAC_DEFAULT_PERMISSION_PIPELINES_SEARCH: RBACPermissionCreate = {

    name: 'pipelines.search',
    description: 'OrganizationUserEntity can search/list all pipelines.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_PIPELINES_GET: RBACPermissionCreate = {

    name: 'pipelines.get',
    description: 'OrganizationUserEntity can view information about a pipelines.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_PIPELINES_CREATE: RBACPermissionCreate = {

    name: 'pipelines.create',
    description: 'OrganizationUserEntity can create new pipelines.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_PIPELINES_UPDATE: RBACPermissionCreate = {

    name: 'pipelines.update',
    description: 'OrganizationUserEntity can update an existing pipelines.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_PIPELINES_DELETE: RBACPermissionCreate = {

    name: 'pipelines.delete',
    description: 'OrganizationUserEntity can delete pipelines.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};


// Deafult Token Permissions
export const RBAC_DEFAULT_PERMISSION_TOKEN_SEARCH: RBACPermissionCreate = {

    name: 'rbac.tokens.search',
    description: 'OrganizationUserEntity can search/list all tokens.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_TOKEN_GET: RBACPermissionCreate = {

    name: 'rbac.tokens.get',
    description: 'OrganizationUserEntity can view information about a tokens.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_TOKEN_CREATE: RBACPermissionCreate = {

    name: 'rbac.tokens.create',
    description: 'OrganizationUserEntity can create new tokens.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_TOKEN_UPDATE: RBACPermissionCreate = {

    name: 'rbac.tokens.update',
    description: 'OrganizationUserEntity can update an existing tokens.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};

export const RBAC_DEFAULT_PERMISSION_TOKEN_DELETE: RBACPermissionCreate = {

    name: 'rbac.tokens.delete',
    description: 'OrganizationUserEntity can delete tokens.',
    type: ORGANIZATION_USER_RBAC_PERMISSION_TYPE.PIPELINE

};


export const RBAC_DEFAULT_PERMISSIONS: Array<RBACPermissionCreate> = [

    RBAC_DEFAULT_PERMISSION_USERS_SEARCH,
    RBAC_DEFAULT_PERMISSION_USERS_GET,
    RBAC_DEFAULT_PERMISSION_USERS_CREATE,
    RBAC_DEFAULT_PERMISSION_USERS_UPDATE,
    RBAC_DEFAULT_PERMISSION_USERS_DELETE,
    RBAC_DEFAULT_PERMISSION_ROLES_SEARCH,
    RBAC_DEFAULT_PERMISSION_ROLES_GET,
    RBAC_DEFAULT_PERMISSION_ROLES_CREATE,
    RBAC_DEFAULT_PERMISSION_ROLES_UPDATE,
    RBAC_DEFAULT_PERMISSION_ROLES_DELETE,
    RBAC_DEFAULT_PERMISSION_PERMISSIONS_SEARCH,
    RBAC_DEFAULT_PERMISSION_PERMISSIONS_GET,
    RBAC_DEFAULT_PERMISSION_PERMISSIONS_CREATE,
    RBAC_DEFAULT_PERMISSION_PERMISSIONS_UPDATE,
    RBAC_DEFAULT_PERMISSION_PERMISSIONS_DELETE,
    RBAC_DEFAULT_PERMISSION_GROUPS_SEARCH,
    RBAC_DEFAULT_PERMISSION_GROUPS_GET,
    RBAC_DEFAULT_PERMISSION_GROUPS_CREATE,
    RBAC_DEFAULT_PERMISSION_GROUPS_UPDATE,
    RBAC_DEFAULT_PERMISSION_GROUPS_DELETE,
    RBAC_DEFAULT_PERMISSION_SCHEMAS_CREATE,
    RBAC_DEFAULT_PERMISSION_SCHEMAS_DELETE,
    RBAC_DEFAULT_PERMISSION_SCHEMAS_UPDATE,
    RBAC_DEFAULT_PERMISSION_SCHEMAS_GET,
    RBAC_DEFAULT_PERMISSION_SCHEMAS_SEARCH,
    RBAC_DEFAULT_PERMISSION_PIPELINES_CREATE,
    RBAC_DEFAULT_PERMISSION_PIPELINES_DELETE,
    RBAC_DEFAULT_PERMISSION_PIPELINES_UPDATE,
    RBAC_DEFAULT_PERMISSION_PIPELINES_GET,
    RBAC_DEFAULT_PERMISSION_PIPELINES_SEARCH,
    RBAC_DEFAULT_PERMISSION_TOKEN_CREATE,
    RBAC_DEFAULT_PERMISSION_TOKEN_DELETE,
    RBAC_DEFAULT_PERMISSION_TOKEN_UPDATE,
    RBAC_DEFAULT_PERMISSION_TOKEN_GET,
    RBAC_DEFAULT_PERMISSION_TOKEN_SEARCH,

];
