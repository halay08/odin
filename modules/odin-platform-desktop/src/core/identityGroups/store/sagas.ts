import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { 
  ASSIGN_USERS_TO_GROUP_ERROR,
  ASSIGN_USERS_TO_GROUP_REQUEST,
  ASSIGN_USERS_TO_GROUP_SUCCESS,
  CREATE_GROUP_ERROR,
  CREATE_GROUP_REQUEST,
  CREATE_GROUP_SUCCESS,
  DELETE_GROUP_ERROR,
  DELETE_GROUP_REQUEST, 
  DELETE_GROUP_SUCCESS, 
  GET_GROUPS_DATA_ERROR, 
  GET_GROUPS_DATA_REQUEST, 
  GET_GROUPS_DATA_SUCCESS, 
  GET_GROUP_BY_ID_ERROR, 
  GET_GROUP_BY_ID_REQUEST, 
  GET_GROUP_BY_ID_SUCCESS} from './constants';
import history from '../../../shared/utilities/browserHisory';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { AssignUsersToGroup, CreateNewGroup, DeleteGroup } from './actions';
import { SET_ASSIGN_USER_MODAL_VISIBLE } from '../../identityUser/store/constants';

// @ts-ignore
function* getGroups() {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/rbac/groups'));
    yield put({ type: GET_GROUPS_DATA_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_GROUPS_DATA_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}


// @ts-ignore
function* getGroupById(params: any) {
  try {
    const res = yield call(
      async () => await httpGet(`IdentityModule/v1.0/rbac/groups/${params.params.groupId}`),
    );
    yield put({
      type: GET_GROUP_BY_ID_SUCCESS,
      results: res.data.data,
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_GROUP_BY_ID_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* deleteGroup(action: { type: any, take: any, params: DeleteGroup, cb: any }) {
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/rbac/groups/${action.params.groupId}`));
    yield history.goBack();
    yield put({ type: DELETE_GROUP_SUCCESS, results: action.params.groupId });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted group', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_GROUP_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* createGroup(action: { type: any, take: any, params: CreateNewGroup, cb: any }) {

  try {
    const url = `IdentityModule/v1.0/rbac/groups`;
    const { body } = action.params;
    let res = yield call(async () => await httpPost(url, body));
    yield put({ type: CREATE_GROUP_SUCCESS, results: res.data.data });
    history.push(`/IdentityManagerModule/Groups/${res.data.data.id}`);
    if(action.cb) {
      yield call(action.cb, { data: res.data.data })
    }
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully created group', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_GROUP_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* assignUsersToGroup(action: { type: any, take: any, params: AssignUsersToGroup, cb: any }) {
  try {
    const res = yield call(async () => await httpPost(`IdentityModule/v1.0/rbac/groups/${action.params.id}/users`, {userIds: action.params.userIds}));
    yield put({ type: ASSIGN_USERS_TO_GROUP_SUCCESS, results: res.data.data });
    yield put({ type: SET_ASSIGN_USER_MODAL_VISIBLE, visible: false });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: `users successfully linked to group`, type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ASSIGN_USERS_TO_GROUP_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest(GET_GROUPS_DATA_REQUEST, getGroups);
  yield takeLatest(GET_GROUP_BY_ID_REQUEST, getGroupById);
  yield takeLatest(DELETE_GROUP_REQUEST, deleteGroup);
  yield takeLatest(CREATE_GROUP_REQUEST, createGroup);
  yield takeLatest(ASSIGN_USERS_TO_GROUP_REQUEST, assignUsersToGroup);
}

export default rootSaga;
