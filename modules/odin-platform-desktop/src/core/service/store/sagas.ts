import { all, call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  IDeleteSipwiseCustomer,
  IDeleteSipwiseCustomerContact,
  IDeleteSipwiseSubscriber,
  IGetSipwiseCustomerContact,
} from './actions';
import {
  DELETE_SIPWISE_CUSTOMER_CONTACT_ERROR,
  DELETE_SIPWISE_CUSTOMER_CONTACT_REQUEST,
  DELETE_SIPWISE_CUSTOMER_CONTACT_SUCCESS,
  DELETE_SIPWISE_CUSTOMER_REQUEST,
  DELETE_SIPWISE_SUBSCRIBER_ERROR,
  DELETE_SIPWISE_SUBSCRIBER_REQUEST,
  GET_SIPWISE_FULL_PROFILE_ERROR,
  GET_SIPWISE_FULL_PROFILE_REQUEST,
  GET_SIPWISE_FULL_PROFILE_SUCCESS,
} from './constants';


/**
 *
 * @param action
 */
function* getSipwiseFullProfile(action: { params: IGetSipwiseCustomerContact }): any {

  const { contact_id, recordId } = action.params;

  try {

    const [ customerContact, customer, subscriber ] = yield all([
      call(async () => await httpGet(`ServiceModule/v1.0/voice/sipwise/customercontacts/${contact_id}`)),
      call(async () => await httpGet(`ServiceModule/v1.0/voice/sipwise/customers/?contact_id=${contact_id}`)),
      call(async () => await httpGet(`ServiceModule/v1.0/voice/sipwise/subscribers/?contact_id=${contact_id}`)),
    ]);

    yield put({
      type: GET_SIPWISE_FULL_PROFILE_SUCCESS, results: {
        recordId,
        data: {
          customerContact: customerContact.data.data,
          customer: customer.data.data,
          subscriber: subscriber.data.data,
        },
      },
    });

    return;

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_SIPWISE_FULL_PROFILE_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}


/**
 *
 * @param action
 */
function* deleteSipwiseSubscriber(action: { params: IDeleteSipwiseSubscriber }) {
  try {

    const { recordId, contact_id, subscriberId } = action.params;

    const res = yield call(async () => await httpDelete(`ServiceModule/v1.0/voice/sipwise/subscribers/${subscriberId}`))

    yield put({
      type: DELETE_SIPWISE_CUSTOMER_CONTACT_SUCCESS, results: res.data.data,
    });

    yield put({
      type: GET_SIPWISE_FULL_PROFILE_REQUEST, params: { recordId, contact_id },
    })

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SIPWISE_SUBSCRIBER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}


/**
 *
 * @param action
 */
function* deleteSipwiseCustomer(action: { params: IDeleteSipwiseCustomer }) {
  try {

    const { recordId, contact_id, customerId } = action.params;

    const res = yield call(async () => await httpDelete(`ServiceModule/v1.0/voice/sipwise/customers/${customerId}`))

    yield put({
      type: DELETE_SIPWISE_CUSTOMER_CONTACT_SUCCESS, results: res.data.data,
    });

    yield put({
      type: GET_SIPWISE_FULL_PROFILE_REQUEST, params: { recordId, contact_id },
    })

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SIPWISE_SUBSCRIBER_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}


/**
 *
 * @param action
 */
function* deleteSipwiseCustomerContact(action: { params: IDeleteSipwiseCustomerContact }) {
  try {

    const { recordId, contact_id, customerContactId } = action.params;

    const res = yield call(async () => await httpDelete(`ServiceModule/v1.0/voice/sipwise/customercontacts/${customerContactId}`))

    yield put({
      type: DELETE_SIPWISE_CUSTOMER_CONTACT_SUCCESS, results: res.data.data,
    });

    yield put({
      type: GET_SIPWISE_FULL_PROFILE_REQUEST, params: { recordId, contact_id },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SIPWISE_CUSTOMER_CONTACT_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest<any>(GET_SIPWISE_FULL_PROFILE_REQUEST, getSipwiseFullProfile);
  yield takeLatest<any>(DELETE_SIPWISE_SUBSCRIBER_REQUEST, deleteSipwiseSubscriber);
  yield takeLatest<any>(DELETE_SIPWISE_CUSTOMER_REQUEST, deleteSipwiseCustomer);
  yield takeLatest<any>(DELETE_SIPWISE_CUSTOMER_CONTACT_REQUEST, deleteSipwiseCustomerContact);

}

export default rootSaga;
