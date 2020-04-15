import { call, put, takeLatest } from 'redux-saga/effects';
import { httpPost } from '../../../../shared/http/requests';
import { DISPLAY_MESSAGE } from '../../../../shared/system/messages/store/reducers';
import { ERROR_NOTIFICATION } from '../../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../../identity/store/constants';
import {
  SEND_CONFIRMATION_EMAIL_ERROR,
  SEND_CONFIRMATION_EMAIL_REQUEST,
  SEND_CONFIRMATION_EMAIL_SUCCESS,
} from './constants';


function* sendConfirmationEmail(action: { path: string, body: string, }) {
  const { path, body } = action;
  try {
    const res = yield call(async () => await httpPost(`${path}`, body));
    yield put({ type: DISPLAY_MESSAGE, message: { body: 'confirmation email sent', type: 'success' } });
    yield put({ type: SEND_CONFIRMATION_EMAIL_SUCCESS, results: res.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: SEND_CONFIRMATION_EMAIL_ERROR, error });
    if(e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error });
    }
  }
}

function* rootSaga() {
  yield takeLatest<any>(SEND_CONFIRMATION_EMAIL_REQUEST, sendConfirmationEmail);
}

export default rootSaga;
