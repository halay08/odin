import { 
  ASSIGN_PERMISSIONS_TO_ROLE_REQUEST,
  ASSIGN_ROLE_TO_ROLE_REQUEST,
  ASSIGN_USERS_TO_ROLE_REQUEST,
  CREATE_ROLE_REQUEST, 
  DELETE_ROLE_LINK_REQUEST, 
  DELETE_ROLE_REQUEST, 
  GET_ROLES_DATA_REQUEST, 
  GET_ROLES_LINKS_REQUEST, 
  GET_ROLE_BY_ID_REQUEST, 
  SET_ASSIGN_ROLE_MODAL_VISIBLE } from "./constants";

export interface CreateNewRole {
  body: {
    name: string,
    description: string
  }
}

export interface AssignPermissionsToRole {
  id: string,
  permissionIds: string[]
}

export interface AssignUsersToRole {
  id: string,
  userIds: string[]
}

export interface AssignRoleToRole {
  roleId: string,
  roleIds: string[]
}
export interface DeleteRole {
  roleId: string
}

export function getRolesDataRequest() {
  return {
    type: GET_ROLES_DATA_REQUEST
  };
}

export function setAssignRolesModalVisible(visible: boolean) {
  return {
    type: SET_ASSIGN_ROLE_MODAL_VISIBLE,
    visible
  }
}

export function createRoleRequest(params: CreateNewRole, cb = () => {
}) {
  return {
    type: CREATE_ROLE_REQUEST,
    params,
    cb,
  }
}

export function getRoleByIdRequest(params: any, cb = () => {
}) {
  return {
    type: GET_ROLE_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deleteRoleRequest(params: DeleteRole, cb = () => {
}) {
  return {
    type: DELETE_ROLE_REQUEST,
    params,
    cb,
  }
}
export function getRolesLinksRequest(params: any, cb = () => {}) {
  return {
    type: GET_ROLES_LINKS_REQUEST,
    params,
    cb
  }
}

export function assignPermissionsToRoleRequest(params: AssignPermissionsToRole) {
  return {
    type: ASSIGN_PERMISSIONS_TO_ROLE_REQUEST,
    params
  }
}

export function assignUsersToRoleRequest(params: AssignUsersToRole) {
  return {
    type: ASSIGN_USERS_TO_ROLE_REQUEST,
    params
  }
}

export function assignRoleToRoleRequest(params: AssignRoleToRole) {
  return {
    type: ASSIGN_ROLE_TO_ROLE_REQUEST,
    params
  }
}

export function unassignRoleLinkRequest(params: any) {
  return {
    type: DELETE_ROLE_LINK_REQUEST,
    params
  }
}
