import moment from 'moment';
import { call, put, takeLatest } from 'redux-saga/effects';
import { httpGet, httpPost } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import history from '../../../shared/utilities/browserHisory';
import {
  FORGOT_PASSWORD_REQUEST,
  FORGOT_PASSWORD_SUCCESS,
  GET_USER_LIST_ERROR,
  GET_USER_LIST_REQUEST,
  GET_USER_LIST_SUCCESS,
  RESET_PASSWORD_REQUEST,
  UPDATE_USER_ROLES_AND_PERMISSIONS_ERROR,
  UPDATE_USER_ROLES_AND_PERMISSIONS_REQUEST,
  UPDATE_USER_ROLES_AND_PERMISSIONS_SUCCESS,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGOUT_ERROR,
  USER_LOGOUT_REQUEST,
  USER_LOGOUT_SUCCESS,
} from './constants';

function* loginUser(action: any) {
  try {
    const res = yield call(async () => await httpPost('IdentityModule/v1.0/users/login', action.payload));
    const tokenExpiresAt = moment().utc().add(res.data.expiresIn, 'seconds').toISOString();

    localStorage.setItem(`token`, res.data.token);
    localStorage.setItem(`tokenExpiresAt`, tokenExpiresAt);

    const user = yield call(async () => await httpGet('IdentityModule/v1.0/users/my'));

    yield put({ type: USER_LOGIN_SUCCESS, results: user.data.data });
    yield call(action.cb, true);
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: USER_LOGIN_ERROR, error });
    yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
  }
}

function* updateUserRolesAndPermissions(action: any) {
  try {
    const token = localStorage.getItem(`token`);

    if(token) {
      const user = yield call(async () => await httpGet('IdentityModule/v1.0/users/my'));
      yield put({ type: UPDATE_USER_ROLES_AND_PERMISSIONS_SUCCESS, results: user.data.data });
    } else {
      yield put({ type: USER_LOGOUT_SUCCESS });
    }

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: UPDATE_USER_ROLES_AND_PERMISSIONS_ERROR, error });
    yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
  }
}

function* logoutUser(action: any) {
  try {

    localStorage.removeItem(`token`);
    localStorage.removeItem(`tokenExpiresAt`);

    history.push('/login');

    yield put({ type: USER_LOGOUT_SUCCESS });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: USER_LOGOUT_ERROR, error });
    yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
  }
}

function* getUserList(action: any) {
  try {
    const res = yield call(async () => await httpGet('IdentityModule/v1.0/users/byorg'));

    yield put({ type: GET_USER_LIST_SUCCESS, results: res.data.data });
    yield call(action.cb, { results: res.data.data });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_USER_LIST_ERROR });
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* forgotPassword(action: any) {
  if(action.params === undefined) {
    return;
  }
  try {
    const res = yield call(async () => await httpPost(
      'IdentityModule/v1.0/users/forgot-password',
      { email: action.params.email },
    ));

    yield put({ type: FORGOT_PASSWORD_SUCCESS, results: res.data.data });
    yield call(action.cb, { results: res.data.data });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_USER_LIST_ERROR });
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* resetPassword(action: any) {
  if(action.params === undefined) {
    return;
  }
  try {
    const res = yield call(async () => await httpPost(
      `IdentityModule/v1.0/users/reset-password/${action.params.token}`,
      action.params.data,
    ));

    yield put({ type: FORGOT_PASSWORD_SUCCESS, results: res.data.data });
    yield call(action.cb, { results: res.data.data });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_USER_LIST_ERROR });
    yield put({ type: ERROR_NOTIFICATION, error });
  }
}

function* userLoginSaga() {
  yield takeLatest(USER_LOGIN_REQUEST, loginUser);
  yield takeLatest(USER_LOGOUT_REQUEST, logoutUser);
  yield takeLatest(GET_USER_LIST_REQUEST, getUserList);
  yield takeLatest(FORGOT_PASSWORD_REQUEST, forgotPassword);
  yield takeLatest(RESET_PASSWORD_REQUEST, resetPassword);
  yield takeLatest(UPDATE_USER_ROLES_AND_PERMISSIONS_REQUEST, updateUserRolesAndPermissions);
}

export default userLoginSaga;
