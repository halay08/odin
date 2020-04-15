import { call, put, takeLatest } from 'redux-saga/effects';
import { httpPost } from '../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { IOrderCheckout } from './actions';
import { ORDER_WORKFOLOW_CHECKOUT_ERROR, ORDER_WORKFOLOW_CHECKOUT_REQUEST, ORDER_WORKFOLOW_CHECKOUT_SUCCESS } from './constants';
import history from "../../../shared/utilities/browserHisory";

/**
 *
 * @param action
 */
 function* orderCheckout(action: { params: IOrderCheckout, cb: any }) {
  
  try {
    const res = yield call(async () => await httpPost(`OrderModule/v1.0/checkout`, action.params));

    yield put({
      type: ORDER_WORKFOLOW_CHECKOUT_SUCCESS, results: res.data.data,
    });
    action.cb(res.data.data);
    history.push(`/OrderModule/Order/${res.data.data.orderId}`)
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: ORDER_WORKFOLOW_CHECKOUT_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest<any>(ORDER_WORKFOLOW_CHECKOUT_REQUEST, orderCheckout);
}

export default rootSaga;
