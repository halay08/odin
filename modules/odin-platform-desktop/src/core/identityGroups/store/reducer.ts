import { OrganizationUserGroupEntity } from "@d19n/models/dist/identity/organization/user/group/organization.user.group.entity";
import { 
  ASSIGN_USERS_TO_GROUP_SUCCESS,
  GET_GROUPS_DATA_ERROR, 
  GET_GROUPS_DATA_REQUEST, 
  GET_GROUPS_DATA_SUCCESS, 
  GET_GROUP_BY_ID_ERROR, 
  GET_GROUP_BY_ID_REQUEST, 
  GET_GROUP_BY_ID_SUCCESS, 
  SET_ASSIGN_GROUPS_MODAL_VISIBLE } from "./constants";


export interface IdentityGroupsReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  list: OrganizationUserGroupEntity[],
  shortList: {
    [key: string]: OrganizationUserGroupEntity
  },
  assignModalVisible: boolean,
  
}

export const initialState: IdentityGroupsReducer = {
  isRequesting: false,
  isSuccessful: false,
  list: [],
  shortList: {},
  assignModalVisible: false
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all groups
    case GET_GROUPS_DATA_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_GROUPS_DATA_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_GROUPS_DATA_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    case SET_ASSIGN_GROUPS_MODAL_VISIBLE: {
      return {
        ...state,
        assignModalVisible: action.visible
      }
    }

    // Get a single group by id
    case GET_GROUP_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false
      }
    }
    case GET_GROUP_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_GROUP_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case ASSIGN_USERS_TO_GROUP_SUCCESS: {
      return {
        ...state,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }

    default:
      return state;
  }
}

export default reducer;

