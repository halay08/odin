import { OrganizationUserRbacRoleEntity } from "@d19n/models/dist/identity/organization/user/rbac/role/organization.user.rbac.role.entity";
import { 
  ASSIGN_PERMISSIONS_TO_ROLE_SUCCESS,
  ASSIGN_USERS_TO_ROLE_SUCCESS,
  GET_ROLES_DATA_ERROR, 
  GET_ROLES_DATA_REQUEST, 
  GET_ROLES_DATA_SUCCESS, 
  GET_ROLES_LINKS_ERROR, 
  GET_ROLES_LINKS_REQUEST, 
  GET_ROLES_LINKS_SUCCESS, 
  GET_ROLE_BY_ID_ERROR, 
  GET_ROLE_BY_ID_REQUEST, 
  GET_ROLE_BY_ID_SUCCESS, 
  SET_ASSIGN_ROLE_MODAL_VISIBLE } from "./constants";


export interface IdentityRbacRoleReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  list: OrganizationUserRbacRoleEntity[],
  rolesLinksList: OrganizationUserRbacRoleEntity[],
  shortList: {
    [key: string]: OrganizationUserRbacRoleEntity
  },
  assignModalVisible: boolean,
  
}

export const initialState: IdentityRbacRoleReducer = {
  isRequesting: false,
  isSuccessful: false,
  list: [],
  rolesLinksList: [],
  shortList: {},
  assignModalVisible: false
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all roles
    case GET_ROLES_DATA_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_ROLES_DATA_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_ROLES_DATA_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    case SET_ASSIGN_ROLE_MODAL_VISIBLE: {
      return {
        ...state,
        assignModalVisible: action.visible
      }
    }

    // Get a single role by id
    case GET_ROLE_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false
      }
    }
    case GET_ROLE_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_ROLE_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

      // Get all roles links
      case GET_ROLES_LINKS_REQUEST: {
        return {
          ...state,
          isRequesting: true,
          isSuccessful: false,
        }
      }
      case GET_ROLES_LINKS_SUCCESS: {
        return {
          ...state,
          isRequesting: false,
          isSuccessful: true,
          rolesLinksList: action.results,
        }
      }
      case GET_ROLES_LINKS_ERROR: {
        return {
          isRequesting: false,
          isSuccessful: false,
          rolesLinksList: [],
        }
      }

      case ASSIGN_PERMISSIONS_TO_ROLE_SUCCESS: {
        return {
          ...state,
          shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
        }
      }

      case ASSIGN_USERS_TO_ROLE_SUCCESS: {
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

