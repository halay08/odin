import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost } from '../../../shared/http/requests';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { ICreateServiceAppointment } from './actions';
import {
  CANCEL_APPOINTMENT_RECORD_ERROR,
  CANCEL_APPOINTMENT_RECORD_REQUEST,
  CANCEL_APPOINTMENT_RECORD_SUCCESS,
  CREATE_APPOINTMENT_ERROR,
  CREATE_APPOINTMENT_REQUEST,
  CREATE_APPOINTMENT_SUCCESS,
  LOAD_AVAILABLE_APPOINTMENTS_ERROR,
  LOAD_AVAILABLE_APPOINTMENTS_REQUEST,
  LOAD_AVAILABLE_APPOINTMENTS_SUCCESS,
} from './constants';


function* loadAvailableAppointments(action: { params: { start: string, end: string } }) {
  const { start, end } = action.params;

  let path = 'FieldServiceModule/v1.0/ServiceAppointment/calendar?';
  path = path + `start=${start}`;
  path = path + `&end=${end}`;

  try {
    const res = yield call(async () => await httpGet(path));
    yield put({ type: LOAD_AVAILABLE_APPOINTMENTS_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: LOAD_AVAILABLE_APPOINTMENTS_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* createAppointment(action: { params: ICreateServiceAppointment, cb: any; }) {
  const { workOrderId, createUpdate } = action.params;
  try {
    let path = `FieldServiceModule/v1.0/ServiceAppointment/WorkOrder/${workOrderId}/reserve`;

    const res = yield call(async () => await httpPost(`${path}`, createUpdate));

    yield put({ type: CREATE_APPOINTMENT_SUCCESS, results: res.data.data });
    yield put({ type: DISPLAY_MESSAGE, message: { body: 'appointment created', type: 'success' } });
    yield call(action.cb, true);
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_APPOINTMENT_ERROR, error });
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}

function* cancelAppointment(action: { params: any}) {
  try {
    const url = `FieldServiceModule/v1.0/ServiceAppointment/db-associations/${action.params.id}`;
    const res = yield call(async () => await httpDelete(url, action.params.saveData));
    yield put({ type: DISPLAY_MESSAGE, message: { body: 'successfully cancelled appointment', type: 'success' } });
    yield put({ type: CANCEL_APPOINTMENT_RECORD_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CANCEL_APPOINTMENT_RECORD_ERROR, error });
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}

function* rootSaga() {
  yield takeLatest<any>(LOAD_AVAILABLE_APPOINTMENTS_REQUEST, loadAvailableAppointments);
  yield takeLatest<any>(CREATE_APPOINTMENT_REQUEST, createAppointment);
  yield takeLatest<any>(CANCEL_APPOINTMENT_RECORD_REQUEST, cancelAppointment);
}

export default rootSaga;
