import { 
  ASSIGN_GROUPS_TO_USER_REQUEST, 
  ASSIGN_ROLES_TO_USER_REQUEST, 
  CREATE_USER_REQUEST, 
  DELETE_USER_REQUEST, 
  EDIT_USER_PASSWORD_REQUEST, 
  EDIT_USER_REQUEST, 
  GET_ORGANIZATION_BY_ID_DATA_REQUEST, 
  GET_USERS_DATA_REQUEST, 
  GET_USER_BY_ID_REQUEST, 
  SAVE_ORGANIZATION_DATA_REQUEST, 
  SET_ASSIGN_USER_MODAL_VISIBLE} from "./constants";
import { OrganizationUserCreate } from "@d19n/models/dist/identity/organization/user/organization.user.create";
import { OrganizationUserUpdate } from "@d19n/models/dist/identity/organization/user/organization.user.update";


export interface AssignRolesToUser {
  id: string,
  roleIds: string[]
}

export interface AssignGroupsToUser {
  id: string,
  groupIds: string[]
}

export interface CreateNewUser {
  body: OrganizationUserCreate
}

export interface DeleteUser {
  userId: string
}

export interface EditUser {
  userId: string,
  body: OrganizationUserUpdate
}

export interface EditUserPassword {
  userId: string,
  body: {
    email: string,
    password: string,
    confirmPassword: string
  }
}

export function getUsersDataRequest() {
  return {
    type: GET_USERS_DATA_REQUEST
  };
}

export function createUserRequest(params: CreateNewUser, cb = () => {
}) {
  return {
    type: CREATE_USER_REQUEST,
    params,
    cb,
  }
}

export function getUserByIdRequest(params: any, cb = () => {
}) {
  return {
    type: GET_USER_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function assignRolesToUserRequest(params: AssignRolesToUser) {
  return {
    type: ASSIGN_ROLES_TO_USER_REQUEST,
    params
  }
}

export function assignGroupsToUserRequest(params: AssignGroupsToUser) {
  return {
    type: ASSIGN_GROUPS_TO_USER_REQUEST,
    params
  }
}

export function deleteUserRequest(params: DeleteUser, cb = () => {
}) {
  return {
    type: DELETE_USER_REQUEST,
    params,
    cb,
  }
}

export function editUserRequest(params: EditUser, cb = () => {
}) {
  return {
    type: EDIT_USER_REQUEST,
    params,
    cb,
  }
}

export function editUserPasswordRequest(params: EditUserPassword, cb = () => {
}) {
  return {
    type: EDIT_USER_PASSWORD_REQUEST,
    params,
    cb,
  }
}

export function setAssignUserModalVisible(visible: boolean) {
  return {
    type: SET_ASSIGN_USER_MODAL_VISIBLE,
    visible
  }
}

export function getOrganizationByIdRequest(params: any, cb = () => {}) {
  return {
    type: GET_ORGANIZATION_BY_ID_DATA_REQUEST,
    params,
    cb
  }
}

export function saveOrganizationRequest(params: any, cb = () => {}) {
  return {
    type: SAVE_ORGANIZATION_DATA_REQUEST,
    params,
    cb
  }
}