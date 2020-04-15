import { call, put, takeLatest } from 'redux-saga/effects';
import { httpGet, httpPatch, httpPost } from '../../../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../../../../core/identity/store/constants';
import {
  GET_PREMISE_BY_UDPRN_AND_UMPRN_ERROR,
  GET_PREMISE_BY_UDPRN_AND_UMPRN_REQUEST,
  GET_PREMISE_BY_UDPRN_AND_UMPRN_SUCCESS,
  LOG_PREMISE_VISIT_ERROR,
  LOG_PREMISE_VISIT_REQUEST,
  LOG_PREMISE_VISIT_SUCCESS,
  UPDATE_PREMISES_SALES_STATUS_ERROR,
  UPDATE_PREMISES_SALES_STATUS_REQUEST,
  UPDATE_PREMISES_SALES_STATUS_SUCCESS,
} from './constants';


function* logVisit(action: { params: { schema: any; createUpdate: any; }; cb: any; }) {

  const { schema, createUpdate } = action.params;
  const { UDPRN, UMPRN } = createUpdate.properties;
  try {
    const res = yield call(async () => await httpPost(
      `${schema.moduleName}/v1.0/premises/${UDPRN}/${UMPRN}/visit`,
      createUpdate,
    ));
    yield put({ type: LOG_PREMISE_VISIT_SUCCESS, results: res.data.data });
    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
  } catch (e) {
    yield put({ type: LOG_PREMISE_VISIT_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}

function* getByUdprnAndUmprn(action: { params: { udprn: any; umprn: any; }; cb: any; }) {
  const { udprn, umprn } = action.params;
  try {
    const res = yield call(async () => await httpGet(`CrmModule/v1.0/premises/${udprn}/${umprn}`));
    yield put({ type: GET_PREMISE_BY_UDPRN_AND_UMPRN_SUCCESS, results: res.data.data });
    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
  } catch (e) {
    yield put({ type: GET_PREMISE_BY_UDPRN_AND_UMPRN_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}

function* updatePremiseSalesStatus(action: { params: { createUpdate: any; }; cb: any; }) {

  const { createUpdate } = action.params;
  try {
    const res = yield call(async () => await httpPatch(
      `CrmModule/v1.0/premises/ops`,
      createUpdate,
    ));
    yield put({ type: UPDATE_PREMISES_SALES_STATUS_SUCCESS, results: res.data });
    yield call(action.cb, true);
  } catch (e) {
    yield put({ type: UPDATE_PREMISES_SALES_STATUS_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}


function* rootSaga() {
  yield takeLatest<any>(LOG_PREMISE_VISIT_REQUEST, logVisit);
  yield takeLatest<any>(GET_PREMISE_BY_UDPRN_AND_UMPRN_REQUEST, getByUdprnAndUmprn);
  yield takeLatest<any>(UPDATE_PREMISES_SALES_STATUS_REQUEST, updatePremiseSalesStatus);
}

export default rootSaga;
