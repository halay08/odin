import { OrganizationUserRbacPermissionEntity } from "@d19n/models/dist/identity/organization/user/rbac/permission/organization.user.rbac.permission.entity";
import { 
  ASSIGN_ROLES_TO_PERMISSION_SUCCESS,
  GET_PERMISSIONS_DATA_ERROR, 
  GET_PERMISSIONS_DATA_REQUEST, 
  GET_PERMISSIONS_DATA_SUCCESS, 
  GET_PERMISSION_BY_ID_ERROR, 
  GET_PERMISSION_BY_ID_REQUEST, 
  GET_PERMISSION_BY_ID_SUCCESS, 
  SET_ASSIGN_PERMISSIONS_MODAL_VISIBLE } from "./constants";


export interface IdentityRbacPermissionReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  list: OrganizationUserRbacPermissionEntity[],
  shortList: {
    [key: string]: OrganizationUserRbacPermissionEntity
  },
  assignModalVisible: boolean,
  
}

export const initialState: IdentityRbacPermissionReducer = {
  isRequesting: false,
  isSuccessful: false,
  list: [],
  shortList: {},
  assignModalVisible: false
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all permissions
    case GET_PERMISSIONS_DATA_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_PERMISSIONS_DATA_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_PERMISSIONS_DATA_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    case SET_ASSIGN_PERMISSIONS_MODAL_VISIBLE: {
      return {
        ...state,
        assignModalVisible: action.visible
      }
    }

    // Get a single permission by id
    case GET_PERMISSION_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false
      }
    }
    case GET_PERMISSION_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_PERMISSION_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case ASSIGN_ROLES_TO_PERMISSION_SUCCESS: {
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

