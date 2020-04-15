import { call, put, takeEvery } from 'redux-saga/effects';
import { USER_LOGOUT_REQUEST } from '../../../identity/store/constants';
import { httpGet } from '../../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../../shared/system/notifications/store/reducers';
import {
  GET_DB_RECORD_AUDIT_LOGS_ERROR,
  GET_DB_RECORD_AUDIT_LOGS_REQUEST,
  GET_DB_RECORD_AUDIT_LOGS_SUCCESS,
} from './constants';


function* getRecordAuditLogs(action: { params: { schema: any; key: any; format: any; recordId: any; }; }) {
  const { recordId } = action.params;

  try {
    let path = `AuditModule/v1.0/UserActivity/search?terms=${recordId}&fields=recordId&schemas=logs_user_activity&page=0&size=100&sort=[${JSON.stringify(
      { createdAt: { order: 'desc' } })}]`;
    const res = yield call(async () => await httpGet(path));

    yield put({ type: GET_DB_RECORD_AUDIT_LOGS_SUCCESS, results: res.data });
  } catch (e) {
    yield put({ type: GET_DB_RECORD_AUDIT_LOGS_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}

function* rootSaga() {
  yield takeEvery<any>(GET_DB_RECORD_AUDIT_LOGS_REQUEST, getRecordAuditLogs);
}

export default rootSaga;
