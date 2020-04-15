import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { AssignRolesToPermission, CreateNewPermission, DeletePermission } from './actions';
import { 
  ASSIGN_ROLES_TO_PERMISSION_ERROR,
  ASSIGN_ROLES_TO_PERMISSION_REQUEST,
  ASSIGN_ROLES_TO_PERMISSION_SUCCESS,
  CREATE_PERMISSION_ERROR,
  CREATE_PERMISSION_REQUEST,
  CREATE_PERMISSION_SUCCESS,
  DELETE_PERMISSION_ERROR,
  DELETE_PERMISSION_REQUEST,
  DELETE_PERMISSION_SUCCESS,
  GET_PERMISSIONS_DATA_ERROR, 
  GET_PERMISSIONS_DATA_REQUEST, 
  GET_PERMISSIONS_DATA_SUCCESS, 
  GET_PERMISSION_BY_ID_ERROR, 
  GET_PERMISSION_BY_ID_REQUEST,
  GET_PERMISSION_BY_ID_SUCCESS} from './constants';
import history from '../../../shared/utilities/browserHisory';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { SET_ASSIGN_ROLE_MODAL_VISIBLE } from '../../identityRoles/store/constants';

// @ts-ignore
function* getPermissions() {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/rbac/permissions'));
    yield put({ type: GET_PERMISSIONS_DATA_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_PERMISSIONS_DATA_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* createPermission(action: { type: any, take: any, params: CreateNewPermission, cb: any }) {

  try {
    const url = `IdentityModule/v1.0/rbac/permissions`;
    const { body } = action.params;
    let res = yield call(async () => await httpPost(url, body));
    yield put({ type: CREATE_PERMISSION_SUCCESS, results: res.data.data });
    history.push(`/IdentityManagerModule/Permissions/${res.data.data.id}`);
    if(action.cb) {
      yield call(action.cb, { data: res.data.data })
    }
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully created permission', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_PERMISSION_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* getPermissionById(params: any) {
  try {
    const res = yield call(
      async () => await httpGet(`IdentityModule/v1.0/rbac/permissions/${params.params.permissionId}`),
    );
    yield put({
      type: GET_PERMISSION_BY_ID_SUCCESS,
      results: res.data.data,
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_PERMISSION_BY_ID_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* deletePermission(action: { type: any, take: any, params: DeletePermission, cb: any }) {
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/rbac/permissions/${action.params.permissionId}`));
    yield history.goBack();
    yield put({ type: DELETE_PERMISSION_SUCCESS, results: action.params.permissionId });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted role', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_PERMISSION_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* assignRolesToPermission(action: { type: any, take: any, params: AssignRolesToPermission, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/rbac/permissions/${action.params.id}/roles`, {roleIds: action.params.permissionIds}));
    yield put({ type: ASSIGN_ROLES_TO_PERMISSION_SUCCESS, results: res.data.data });
    yield put({ type: SET_ASSIGN_ROLE_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: `roles successfully linked to permission`, type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_ROLES_TO_PERMISSION_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest(GET_PERMISSIONS_DATA_REQUEST, getPermissions);
  yield takeLatest(CREATE_PERMISSION_REQUEST, createPermission);
  yield takeLatest(GET_PERMISSION_BY_ID_REQUEST, getPermissionById);
  yield takeLatest(DELETE_PERMISSION_REQUEST, deletePermission);
  yield takeLatest(ASSIGN_ROLES_TO_PERMISSION_REQUEST, assignRolesToPermission);
}

export default rootSaga;
