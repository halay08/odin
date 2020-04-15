import { OrganizationUserEntity } from "@d19n/models/dist/identity/organization/user/organization.user.entity";
import { 
  ASSIGN_GROUPS_TO_USER_SUCCESS, 
  ASSIGN_ROLES_TO_USER_SUCCESS, 
  EDIT_USER_SUCCESS, 
  GET_USERS_DATA_ERROR, 
  GET_USERS_DATA_REQUEST, 
  GET_USERS_DATA_SUCCESS,
  GET_USER_BY_ID_ERROR, 
  GET_USER_BY_ID_REQUEST, 
  GET_USER_BY_ID_SUCCESS,
  SET_ASSIGN_USER_MODAL_VISIBLE
} from "./constants";


export interface IdentityUserReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  list: OrganizationUserEntity[],
  shortList: {
    [key: string]: OrganizationUserEntity
  },
  assignModalVisible: boolean
}

export const initialState: IdentityUserReducer = {
  isRequesting: false,
  isSuccessful: false,
  list: [],
  shortList: {},
  assignModalVisible: false
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all users
    case GET_USERS_DATA_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_USERS_DATA_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_USERS_DATA_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    // Get a single user by id
    case GET_USER_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false
      }
    }
    case GET_USER_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_USER_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case ASSIGN_ROLES_TO_USER_SUCCESS: {
      return {
        ...state,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }

    case ASSIGN_GROUPS_TO_USER_SUCCESS: {
      return {
        ...state,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }

    case EDIT_USER_SUCCESS: {
      return {
        ...state,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }

    case SET_ASSIGN_USER_MODAL_VISIBLE: {
      return {
        ...state,
        assignModalVisible: action.visible
      }
    }

    default:
      return state;
  }
}

export default reducer;

