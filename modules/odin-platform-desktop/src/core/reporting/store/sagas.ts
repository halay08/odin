import { call, put, takeLatest } from 'redux-saga/effects';
import { httpGet } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  GET_INVESTIGATION_OVERVIEW_ERROR,
  GET_INVESTIGATION_OVERVIEW_REQUEST,
  GET_INVESTIGATION_OVERVIEW_SUCCESS,
  GET_ORDERS_OVERVIEW_ERROR,
  GET_ORDERS_OVERVIEW_REQUEST,
  GET_ORDERS_OVERVIEW_SUCCESS,
  GET_PIPELINES_OVERVIEW_ERROR,
  GET_PIPELINES_OVERVIEW_REQUEST,
  GET_PIPELINES_OVERVIEW_SUCCESS,
  GET_TRANSACTION_OVERVIEW_ERROR,
  GET_TRANSACTION_OVERVIEW_REQUEST,
  GET_TRANSACTION_OVERVIEW_SUCCESS,
} from './constants';


function* getPipelinesOverview(params: { moduleName?: string, entityName?: string }) {
  const { moduleName, entityName } = params;
  try {
    let path = 'ConnectModule/v1.0/reporting/pipelines-overview';
    if(!!moduleName) {
      path = path + `?moduleName=${moduleName}`;
    }
    if(!!entityName) {
      path = path + `?entityName=${entityName}`;
    }

    const res = yield call(async () => await httpGet(path));

    yield put({ type: GET_PIPELINES_OVERVIEW_SUCCESS, results: res.data });
  } catch (e) {
    yield put({ type: GET_PIPELINES_OVERVIEW_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}


function* getOrdersOverview(action: { params: { orderStageKey: string } }) {
  const { orderStageKey } = action.params;

  try {
    let path = `ConnectModule/v1.0/reporting/orders-overview?orderStageKey=${orderStageKey}`;
    console.log('path', path);
    const res = yield call(async () => await httpGet(path));

    yield put({ type: GET_ORDERS_OVERVIEW_SUCCESS, results: res.data });
  } catch (e) {
    yield put({ type: GET_ORDERS_OVERVIEW_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}

function* getInvestigationsOverview() {
  try {
    let path = `ConnectModule/v1.0/reporting/needs-investigating`;
    const res = yield call(async () => await httpGet(path));

    yield put({ type: GET_INVESTIGATION_OVERVIEW_SUCCESS, results: res.data });
  } catch (e) {
    yield put({ type: GET_INVESTIGATION_OVERVIEW_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}

function* getTransactionOverview() {
  try {
    let path = `ConnectModule/v1.0/reporting/bill-runs`;
    const res = yield call(async () => await httpGet(path));

    yield put({ type: GET_TRANSACTION_OVERVIEW_SUCCESS, results: res.data });
  } catch (e) {
    yield put({ type: GET_TRANSACTION_OVERVIEW_ERROR });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error: e.response.data });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: e.response.data });
    }
  }
}


function* rootSaga() {
  yield takeLatest<any>(GET_PIPELINES_OVERVIEW_REQUEST, getPipelinesOverview);
  yield takeLatest<any>(GET_ORDERS_OVERVIEW_REQUEST, getOrdersOverview);
  yield takeLatest<any>(GET_INVESTIGATION_OVERVIEW_REQUEST, getInvestigationsOverview);
  yield takeLatest<any>(GET_TRANSACTION_OVERVIEW_REQUEST, getTransactionOverview);
}

export default rootSaga;
