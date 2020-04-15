import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost, httpPut } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  CREATE_CONNECTED_APP_ERROR,
  CREATE_CONNECTED_APP_REQUEST,
  CREATE_CONNECTED_APP_SUCCESS,
  DELETE_CONNECTED_APP_ERROR,
  DELETE_CONNECTED_APP_REQUEST, 
  DELETE_CONNECTED_APP_SUCCESS, 
  EDIT_CONNECTED_APP_ERROR, 
  EDIT_CONNECTED_APP_REQUEST, 
  EDIT_CONNECTED_APP_SUCCESS, 
  GET_CONNECTED_APPS_DATA_ERROR, 
  GET_CONNECTED_APPS_DATA_REQUEST, 
  GET_CONNECTED_APPS_DATA_SUCCESS, 
  GET_CONNECTED_APP_BY_ID_ERROR, 
  GET_CONNECTED_APP_BY_ID_REQUEST, 
  GET_CONNECTED_APP_BY_ID_SUCCESS} from './constants';
import history from '../../../shared/utilities/browserHisory';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { CreateNewConnectedApp, DeleteConnectedApp, EditConnectedApp } from './actions';

// @ts-ignore
function* getConnectedApp() {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/organizations/apps'));
    yield put({ type: GET_CONNECTED_APPS_DATA_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_CONNECTED_APPS_DATA_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}


// @ts-ignore
function* getConnectedAppById(params: any) {
  try {
    const res = yield call(
      async () => await httpGet(`IdentityModule/v1.0/organizations/apps/${params.params.connectedAppId}`),
    );
    yield put({
      type: GET_CONNECTED_APP_BY_ID_SUCCESS,
      results: res.data.data,
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_CONNECTED_APP_BY_ID_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* deleteConnectedApp(action: { type: any, take: any, params: DeleteConnectedApp, cb: any }) {
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/organizations/apps/${action.params.connectedAppId}`));
    yield history.goBack();
    yield put({ type: DELETE_CONNECTED_APP_SUCCESS, results: action.params.connectedAppId });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted connected app', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_CONNECTED_APP_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* createConnectedApp(action: { type: any, take: any, params: CreateNewConnectedApp, cb: any }) {

  try {
    const url = `IdentityModule/v1.0/organizations/apps`;
    const { body } = action.params;
    let res = yield call(async () => await httpPost(url, body));
    yield put({ type: CREATE_CONNECTED_APP_SUCCESS, results: res.data.data });
    history.push(`/IdentityManagerModule/ConnectedApps/${res.data.data.id}`);
    if(action.cb) {
      yield call(action.cb, { data: res.data.data })
    }
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully created connected app', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_CONNECTED_APP_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* editConnectedApp(action: { type: any, take: any, params: EditConnectedApp, cb: any }) {
  try {
    const res = yield call(async () => await httpPut(`IdentityModule/v1.0/organizations/apps/${action.params.connectedAppId}`, action.params.body));
    yield put({
      type: EDIT_CONNECTED_APP_SUCCESS,
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
    yield put({ type: EDIT_CONNECTED_APP_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest(GET_CONNECTED_APPS_DATA_REQUEST, getConnectedApp);
  yield takeLatest(GET_CONNECTED_APP_BY_ID_REQUEST, getConnectedAppById);
  yield takeLatest(DELETE_CONNECTED_APP_REQUEST, deleteConnectedApp);
  yield takeLatest(CREATE_CONNECTED_APP_REQUEST, createConnectedApp);
  yield takeLatest(EDIT_CONNECTED_APP_REQUEST, editConnectedApp);
}

export default rootSaga;
