import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { AssignPermissionsToRole, AssignRoleToRole, AssignUsersToRole, CreateNewRole, DeleteRole } from './actions';
import { 
  ASSIGN_PERMISSIONS_TO_ROLE_ERROR,
  ASSIGN_PERMISSIONS_TO_ROLE_REQUEST,
  ASSIGN_PERMISSIONS_TO_ROLE_SUCCESS,
  ASSIGN_ROLE_TO_ROLE_REQUEST,
  ASSIGN_USERS_TO_ROLE_ERROR,
  ASSIGN_USERS_TO_ROLE_REQUEST,
  ASSIGN_USERS_TO_ROLE_SUCCESS,
  CREATE_ROLE_ERROR, 
  CREATE_ROLE_REQUEST, 
  CREATE_ROLE_SUCCESS, 
  DELETE_ROLE_ERROR, 
  DELETE_ROLE_LINK_REQUEST, 
  DELETE_ROLE_REQUEST, 
  DELETE_ROLE_SUCCESS, 
  GET_ROLES_DATA_ERROR, 
  GET_ROLES_DATA_REQUEST, 
  GET_ROLES_DATA_SUCCESS, 
  GET_ROLES_LINKS_ERROR, 
  GET_ROLES_LINKS_REQUEST, 
  GET_ROLES_LINKS_SUCCESS, 
  GET_ROLE_BY_ID_ERROR, 
  GET_ROLE_BY_ID_REQUEST, 
  GET_ROLE_BY_ID_SUCCESS, 
  SET_ASSIGN_ROLE_MODAL_VISIBLE } from './constants';
import history from '../../../shared/utilities/browserHisory';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { SET_ASSIGN_PERMISSIONS_MODAL_VISIBLE } from '../../identityPermissions/store/constants';
import { SET_ASSIGN_USER_MODAL_VISIBLE } from '../../identityUser/store/constants';

// @ts-ignore
function* getRoles() {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/rbac/roles'));
    yield put({ type: GET_ROLES_DATA_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_ROLES_DATA_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* createRole(action: { type: any, take: any, params: CreateNewRole, cb: any }) {

  try {
    const url = `IdentityModule/v1.0/rbac/roles`;
    const { body } = action.params;
    let res = yield call(async () => await httpPost(url, body));
    yield put({ type: CREATE_ROLE_SUCCESS, results: res.data.data });
    history.push(`/IdentityManagerModule/Roles/${res.data.data.id}`);
    if(action.cb) {
      yield call(action.cb, { data: res.data.data })
    }
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully created role', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_ROLE_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* getRoleById(params: any) {
  try {
    const res = yield call(
      async () => await httpGet(`IdentityModule/v1.0/rbac/roles/${params.params.roleId}`),
    );
    yield put({
      type: GET_ROLE_BY_ID_SUCCESS,
      results: res.data.data,
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_ROLE_BY_ID_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* deleteRole(action: { type: any, take: any, params: DeleteRole, cb: any }) {
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/rbac/roles/${action.params.roleId}`));
    yield history.goBack();
    yield put({ type: DELETE_ROLE_SUCCESS, results: action.params.roleId });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted role', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_ROLE_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* getRolesLinks(action: { type: any, take: any, params: any, cb: any }) {
  if (action.params === undefined) {
    return;
  }
  try {
    const res = yield call(async () => await httpGet(`IdentityModule/v1.0/rbac/roles/${action.params.roleId}/links`));

    yield put({ type: GET_ROLES_LINKS_SUCCESS, results: res.data.data });
    
    yield call(action.cb, { results: res.data.data });


  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_ROLES_LINKS_ERROR, error });
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* unassignRole(action: any) {
  if (action.params === undefined) {
    return;
  }
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/rbac/roles/${action.params.roleId}/links/${action.params.roleToLinkId}`));
    const linkRoles = yield call(async () => await httpGet(`IdentityModule/v1.0/rbac/roles/${action.params.roleId}/links`));
    yield put({ type: GET_ROLES_LINKS_SUCCESS, results: linkRoles.data.data });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'link successfully deleted', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

// @ts-ignore
function* assignPermissionsToRole(action: { type: any, take: any, params: AssignPermissionsToRole, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/rbac/roles/${action.params.id}/permissions`, {permissionIds: action.params.permissionIds}));
    yield put({ type: ASSIGN_PERMISSIONS_TO_ROLE_SUCCESS, results: res.data.data });
    yield put({ type: SET_ASSIGN_PERMISSIONS_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: `permissions successfully linked to role`, type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_PERMISSIONS_TO_ROLE_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* assignUsersToRole(action: { type: any, take: any, params: AssignUsersToRole, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/rbac/roles/${action.params.id}/users`, {userIds: action.params.userIds}));
    yield put({ type: ASSIGN_USERS_TO_ROLE_SUCCESS, results: res.data.data });
    yield put({ type: SET_ASSIGN_USER_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: `permissions successfully linked to role`, type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_USERS_TO_ROLE_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* assignRoleToRole(action: { type: any, take: any, params: AssignRoleToRole, cb: any }) {
  if (action.params === undefined) {
    return;
  }
  try {
    yield call(async () => await httpPost(`IdentityModule/v1.0/rbac/roles/${action.params.roleId}/links`, {roleIds: action.params.roleIds}));
    const linkRoles = yield call(async () => await httpGet(`IdentityModule/v1.0/rbac/roles/${action.params.roleId}/links`));
    yield put({ type: GET_ROLES_LINKS_SUCCESS, results: linkRoles.data.data });
    yield put({ type: SET_ASSIGN_ROLE_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'role successfully linked', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* rootSaga() {
  yield takeLatest(GET_ROLES_DATA_REQUEST, getRoles);
  yield takeLatest(CREATE_ROLE_REQUEST, createRole);
  yield takeLatest(GET_ROLE_BY_ID_REQUEST, getRoleById);
  yield takeLatest(DELETE_ROLE_REQUEST, deleteRole);
  yield takeLatest(GET_ROLES_LINKS_REQUEST, getRolesLinks);
  yield takeLatest(ASSIGN_PERMISSIONS_TO_ROLE_REQUEST, assignPermissionsToRole);
  yield takeLatest(ASSIGN_USERS_TO_ROLE_REQUEST, assignUsersToRole);
  yield takeLatest(ASSIGN_ROLE_TO_ROLE_REQUEST, assignRoleToRole);
  yield takeLatest(DELETE_ROLE_LINK_REQUEST, unassignRole)
}

export default rootSaga;
