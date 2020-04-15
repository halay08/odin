import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost, httpPut } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { CreateNewUser, AssignGroupsToUser, AssignRolesToUser, DeleteUser, EditUser, EditUserPassword } from './actions';
import { 
  ASSIGN_GROUPS_TO_USER_ERROR,
  ASSIGN_GROUPS_TO_USER_REQUEST,
  ASSIGN_GROUPS_TO_USER_SUCCESS,
  ASSIGN_ROLES_TO_USER_ERROR, 
  ASSIGN_ROLES_TO_USER_REQUEST, 
  ASSIGN_ROLES_TO_USER_SUCCESS, 
  CREATE_USER_ERROR, 
  CREATE_USER_REQUEST, 
  CREATE_USER_SUCCESS, 
  DELETE_USER_REQUEST, 
  DELETE_USER_SUCCESS, 
  EDIT_USER_ERROR, 
  EDIT_USER_PASSWORD_ERROR, 
  EDIT_USER_PASSWORD_REQUEST, 
  EDIT_USER_REQUEST, 
  EDIT_USER_SUCCESS, 
  GET_ORGANIZATION_BY_ID_DATA_REQUEST, 
  GET_ORGANIZATION_BY_ID_DATA_SUCCESS, 
  GET_USERS_DATA_ERROR, 
  GET_USERS_DATA_REQUEST, 
  GET_USERS_DATA_SUCCESS, 
  GET_USER_BY_ID_ERROR, 
  GET_USER_BY_ID_REQUEST, 
  GET_USER_BY_ID_SUCCESS, 
  SAVE_ORGANIZATION_DATA_REQUEST,
  SAVE_ORGANIZATION_DATA_SUCCESS
} from "./constants";
import history from '../../../shared/utilities/browserHisory';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { SET_ASSIGN_ROLE_MODAL_VISIBLE } from '../../identityRoles/store/constants';
import { SET_ASSIGN_GROUPS_MODAL_VISIBLE } from '../../identityGroups/store/constants';


// @ts-ignore
function* getUsers() {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/users/byorg'));
    yield put({ type: GET_USERS_DATA_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_USERS_DATA_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* createUser(action: { type: any, take: any, params: CreateNewUser, cb: any }) {

  try {
    const url = `IdentityModule/v1.0/users`;
    const { body } = action.params;
    let res = yield call(async () => await httpPost(url, body));
    yield put({ type: CREATE_USER_SUCCESS, results: res.data.data });
    history.push(`/IdentityManagerModule/Users/${res.data.data.id}`);
    if(action.cb) {
      yield call(action.cb, { data: res.data.data })
    }
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully created user', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_USER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* getUserById(params: any) {
  try {
    const res = yield call(
      async () => await httpGet(`IdentityModule/v1.0/users/byorg/${params.params.userId}`),
    );
    yield put({
      type: GET_USER_BY_ID_SUCCESS,
      results: res.data.data,
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_USER_BY_ID_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* assignRolesToUser(action: { type: any, take: any, params: AssignRolesToUser, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/users/${action.params.id}/roles`, {roleIds: action.params.roleIds}));
    yield put({ type: ASSIGN_ROLES_TO_USER_SUCCESS, results: res.data.data });
    yield put({ type: SET_ASSIGN_ROLE_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: `roles successfully linked to ${res.data.data.firstname} ${res.data.data.lastname}`, type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_ROLES_TO_USER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* assignGroupsToUser(action: { type: any, take: any, params: AssignGroupsToUser, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/users/${action.params.id}/groups`, {groupIds: action.params.groupIds}));
    yield put({ type: ASSIGN_GROUPS_TO_USER_SUCCESS, results: res.data.data });
    yield put({ type: SET_ASSIGN_GROUPS_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: `groups successfully linked to ${res.data.data.firstname} ${res.data.data.lastname}`, type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_GROUPS_TO_USER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* deleteUser(action: { type: any, take: any, params: DeleteUser, cb: any }) {
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/users/${action.params.userId}`));
    yield history.goBack();
    yield put({ type: DELETE_USER_SUCCESS, results: action.params.userId });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted user', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_GROUPS_TO_USER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* editUser(action: { type: any, take: any, params: EditUser, cb: any }) {
  try {
    const res = yield call(async () => await httpPut(`IdentityModule/v1.0/users/${action.params.userId}`, action.params.body));
    yield put({
      type: EDIT_USER_SUCCESS,
      results: res.data.data,
    });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Record was successfuly updated.', type: 'success' },
    });
    if(action.cb) {
      yield call(action.cb, { data: res.data.data });
    }
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: EDIT_USER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* editPassword(action: { type: any, take: any, params: EditUserPassword, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/users/change-password`, action.params.body));
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Record was successfuly updated.', type: 'success' },
    });
    if(action.cb) {
      yield call(action.cb, { data: res.data.data });
    }
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: EDIT_USER_PASSWORD_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* getOrganizationData(action: any) {
  if (action.params === undefined) {
    return;
  }
  try {
    const res = yield call(async () => await httpGet(`IdentityModule/v1.0/organizations/getById/${action.params.id}`));

    yield put({ type: GET_ORGANIZATION_BY_ID_DATA_SUCCESS, results: res.data.data });
    yield call(action.cb, { results: res.data.data });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* saveOrganization(action: any) {
  if (action.params === undefined) {
    return;
  }
  try {
    const res = yield call(async () => await httpPut(`IdentityModule/v1.0/organizations/${action.params.id}`, action.params.data));
    yield put({ type: SAVE_ORGANIZATION_DATA_SUCCESS, results: res.data.data });
    yield call(action.cb, { results: res.data.data });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'organization successfully saved', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* rootSaga() {
  yield takeLatest(GET_USERS_DATA_REQUEST, getUsers);
  yield takeLatest(CREATE_USER_REQUEST, createUser);
  yield takeLatest(GET_USER_BY_ID_REQUEST, getUserById);
  yield takeLatest(ASSIGN_ROLES_TO_USER_REQUEST, assignRolesToUser);
  yield takeLatest(ASSIGN_GROUPS_TO_USER_REQUEST, assignGroupsToUser);
  yield takeLatest(DELETE_USER_REQUEST, deleteUser);
  yield takeLatest(EDIT_USER_REQUEST, editUser);
  yield takeLatest(EDIT_USER_PASSWORD_REQUEST, editPassword);
  yield takeLatest(GET_ORGANIZATION_BY_ID_DATA_REQUEST, getOrganizationData);
  yield takeLatest(SAVE_ORGANIZATION_DATA_REQUEST, saveOrganization);
}

export default rootSaga;
