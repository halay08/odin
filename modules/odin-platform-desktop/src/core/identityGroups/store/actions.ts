import { 
  ASSIGN_USERS_TO_GROUP_REQUEST,
  CREATE_GROUP_REQUEST,
  DELETE_GROUP_REQUEST, 
  GET_GROUPS_DATA_REQUEST, 
  GET_GROUP_BY_ID_REQUEST, 
  SET_ASSIGN_GROUPS_MODAL_VISIBLE } from "./constants";

export interface DeleteGroup {
  groupId: string
}

export interface CreateNewGroup {
  body: {
    name: string,
    description: string
  }
}

export interface AssignUsersToGroup {
  id: string,
  userIds: string[]
}

export function getGroupsDataRequest() {
  return {
    type: GET_GROUPS_DATA_REQUEST
  };
}

export function setAssignGroupsModalVisible(visible: boolean) {
  return {
    type: SET_ASSIGN_GROUPS_MODAL_VISIBLE,
    visible
  }
}

export function getGroupByIdRequest(params: any, cb = () => {
}) {
  return {
    type: GET_GROUP_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deleteGroupRequest(params: DeleteGroup, cb = () => {
}) {
  return {
    type: DELETE_GROUP_REQUEST,
    params,
    cb,
  }
}

export function createGroupRequest(params: CreateNewGroup, cb = () => {
}) {
  return {
    type: CREATE_GROUP_REQUEST,
    params,
    cb,
  }
}

export function assignUsersToGroupRequest(params: AssignUsersToGroup) {
  return {
    type: ASSIGN_USERS_TO_GROUP_REQUEST,
    params
  }
}
