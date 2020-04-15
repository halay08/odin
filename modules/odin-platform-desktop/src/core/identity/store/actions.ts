import { IdentityOrganizationUserLogin } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.login';
import {
  FORGOT_PASSWORD_REQUEST,
  GET_USER_LIST_REQUEST,
  RESET_PASSWORD_REQUEST,
  USER_LOGIN_CANCEL_REQUESTS,
  USER_LOGIN_REQUEST,
  USER_LOGOUT_REQUEST,
  UPDATE_USER_ROLES_AND_PERMISSIONS_REQUEST,
} from './constants';

export function listUsers(cb = () => {
}) {
  return {
    type: GET_USER_LIST_REQUEST,
    cb,
  }
}

export function loginRequest(payload: IdentityOrganizationUserLogin, cb = () => {
}) {
  return {
    type: USER_LOGIN_REQUEST,
    payload,
    cb,
  }
}

export function loginCancelRequest() {
  return {
    type: USER_LOGIN_CANCEL_REQUESTS,
  }
}

export function logoutRequest() {
  return {
    type: USER_LOGOUT_REQUEST,
  }
}

export function updateUserRolesAndPermissionsRequest() {
  return {
    type: UPDATE_USER_ROLES_AND_PERMISSIONS_REQUEST,
  }
}

export function forgotPasswordRequest(params: string, cb = () => {}) {
  return {
    type: FORGOT_PASSWORD_REQUEST,
    params,
    cb
  }
}

export function resetPasswordRequest(params: any, cb = () => {}) {
  return {
    type: RESET_PASSWORD_REQUEST,
    params,
    cb
  }
}
