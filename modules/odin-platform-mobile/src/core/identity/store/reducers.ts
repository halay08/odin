import { parseUserRoles } from '../../../shared/utilities/parseUserRoles';
import {
  GET_USER_LIST_ERROR,
  GET_USER_LIST_REQUEST,
  GET_USER_LIST_SUCCESS,
  UPDATE_USER_ROLES_AND_PERMISSIONS_SUCCESS,
  USER_LOGIN_CANCEL_REQUESTS,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_ERROR,
  USER_LOGOUT_REQUEST,
  USER_LOGOUT_SUCCESS,
} from './constants';

export const initialState = {
  isRequesting: false,
  user: null,
  list: [],
  roles: [],
  permissions: [],

};

function userReducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_USER_LIST_REQUEST: {
      return {
        ...state,
        isRequesting: true,
      }
    }
    case GET_USER_LIST_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        list: action.results,
      }
    }
    case GET_USER_LIST_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }


    case USER_LOGIN_REQUEST: {
      return {
        ...state,
        isRequesting: true,
      }
    }

    case USER_LOGIN_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        user: action.results,
        roles: parseUserRoles(action.results).roles,
        permissions: parseUserRoles(action.results).permissions,
      }
    }

    case UPDATE_USER_ROLES_AND_PERMISSIONS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        roles: parseUserRoles(action.results).roles,
        permissions: parseUserRoles(action.results).permissions,
        user: action.results,
      }
    }

    case USER_LOGIN_ERROR: {
      return {
        ...initialState,
      }
    }

    case USER_LOGIN_CANCEL_REQUESTS: {
      return {
        ...initialState,
      }
    }

    case USER_LOGOUT_REQUEST: {
      return {
        ...initialState,
      }
    }
    case USER_LOGOUT_SUCCESS: {
      return {
        ...initialState,
      }
    }
    case USER_LOGOUT_ERROR: {
      return {
        ...initialState,
      }
    }

    default:
      return state;
  }
}

export default userReducer;

