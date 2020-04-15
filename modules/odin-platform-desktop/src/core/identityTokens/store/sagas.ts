import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  CREATE_TOKEN_ERROR,
  CREATE_TOKEN_REQUEST,
  CREATE_TOKEN_SUCCESS,
  DELETE_TOKEN_ERROR,
  DELETE_TOKEN_REQUEST, 
  DELETE_TOKEN_SUCCESS, 
  GET_TOKENS_DATA_ERROR, 
  GET_TOKENS_DATA_REQUEST, 
  GET_TOKENS_DATA_SUCCESS, 
  GET_TOKEN_BY_ID_ERROR, 
  GET_TOKEN_BY_ID_REQUEST, 
  GET_TOKEN_BY_ID_SUCCESS} from './constants';
import history from '../../../shared/utilities/browserHisory';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { CreateNewToken, DeleteToken } from './actions';

// @ts-ignore
function* getToken() {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/tokens'));
    yield put({ type: GET_TOKENS_DATA_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_TOKENS_DATA_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}


// @ts-ignore
function* getTokenById(params: any) {
  try {
    const res = yield call(
      async () => await httpGet(`IdentityModule/v1.0/tokens/${params.params.tokenId}`),
    );
    yield put({
      type: GET_TOKEN_BY_ID_SUCCESS,
      results: res.data.data,
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_TOKEN_BY_ID_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

// @ts-ignore
function* deleteToken(action: { type: any, take: any, params: DeleteToken, cb: any }) {
  try {
    yield call(async () => await httpDelete(`IdentityModule/v1.0/tokens/${action.params.tokenId}`));
    yield history.goBack();
    yield put({ type: DELETE_TOKEN_SUCCESS, results: action.params.tokenId });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted token', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_TOKEN_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

//@ts-ignore
function* createToken(action: { type: any, take: any, params: CreateNewToken, cb: any }) {

  try {
    const url = `IdentityModule/v1.0/tokens`;
    const { body } = action.params;
    let res = yield call(async () => await httpPost(url, body));
    yield put({ type: CREATE_TOKEN_SUCCESS, results: res.data.data });
    if(action.cb) {
      yield call(action.cb, { data: res.data.data })
    }
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_TOKEN_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest(GET_TOKENS_DATA_REQUEST, getToken);
  yield takeLatest(GET_TOKEN_BY_ID_REQUEST, getTokenById);
  yield takeLatest(DELETE_TOKEN_REQUEST, deleteToken);
  yield takeLatest(CREATE_TOKEN_REQUEST, createToken);
}

export default rootSaga;
