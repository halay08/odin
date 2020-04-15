import { 
  ASSIGN_ROLES_TO_PERMISSION_REQUEST,
  CREATE_PERMISSION_REQUEST,
  DELETE_PERMISSION_REQUEST,
  GET_PERMISSIONS_DATA_REQUEST, 
  GET_PERMISSION_BY_ID_REQUEST, 
  SET_ASSIGN_PERMISSIONS_MODAL_VISIBLE } from "./constants";

export interface CreateNewPermission {
  body: {
    name: string,
    description: string,
    type: string
  }
}

export interface DeletePermission {
  permissionId: string
}

export interface AssignRolesToPermission {
  id: string,
  permissionIds: string[]
}

export function getPermissionsDataRequest() {
  return {
    type: GET_PERMISSIONS_DATA_REQUEST
  };
}

export function setAssignPermissionsModalVisible(visible: boolean) {
  return {
    type: SET_ASSIGN_PERMISSIONS_MODAL_VISIBLE,
    visible
  }
}

export function createPermissionRequest(params: CreateNewPermission, cb = () => {
}) {
  return {
    type: CREATE_PERMISSION_REQUEST,
    params,
    cb,
  }
}

export function getPermissionByIdRequest(params: any, cb = () => {
}) {
  return {
    type: GET_PERMISSION_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deletePermissionRequest(params: DeletePermission, cb = () => {
}) {
  return {
    type: DELETE_PERMISSION_REQUEST,
    params,
    cb,
  }
}

export function assignRolesToPermissionRequest(params: AssignRolesToPermission) {
  return {
    type: ASSIGN_ROLES_TO_PERMISSION_REQUEST,
    params
  }
}
