import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost, httpPut } from '../../../shared/http/requests';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import history from '../../../shared/utilities/browserHisory';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import { CreateSchemaColumn, DeleteSchemaColumn, GetSchemaColumnById, UpdateSchemaColumn } from './actions';
import {
  CREATE_SCHEMA_COLUMN_ERROR,
  CREATE_SCHEMA_COLUMN_PERMISSIONS_ERROR,
  CREATE_SCHEMA_COLUMN_PERMISSIONS_REQUEST,
  CREATE_SCHEMA_COLUMN_PERMISSIONS_SUCCESS,
  CREATE_SCHEMA_COLUMN_REQUEST,
  CREATE_SCHEMA_COLUMN_SUCCESS,
  DELETE_SCHEMA_COLUMN_ERROR,
  DELETE_SCHEMA_COLUMN_PERMISSIONS_ERROR,
  DELETE_SCHEMA_COLUMN_PERMISSIONS_REQUEST,
  DELETE_SCHEMA_COLUMN_PERMISSIONS_SUCCESS,
  DELETE_SCHEMA_COLUMN_REQUEST,
  DELETE_SCHEMA_COLUMN_SUCCESS,
  GET_SCHEMA_COLUMN_ERROR,
  GET_SCHEMA_COLUMN_REQUEST,
  GET_SCHEMA_COLUMN_SUCCESS,
  UPDATE_SCHEMA_COLUMN_ERROR,
  UPDATE_SCHEMA_COLUMN_REQUEST,
  UPDATE_SCHEMA_COLUMN_SUCCESS,
} from './constants';


function* getSchemaColumn(action: { type: any, take: any, params: GetSchemaColumnById, cb: any }) {
  try {

    const { schemaId, schemaColumnId } = action.params;

    const res = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/${schemaId}/columns/${schemaColumnId}`,
    ));

    yield put({ type: GET_SCHEMA_COLUMN_SUCCESS, results: res.data.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
  } catch (e) {

    yield put({ type: GET_SCHEMA_COLUMN_ERROR });
    const error = e.response ? e.response.data : undefined;

    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }

  }
}

/**
 *
 * @param action
 */
function* createColumn(action: { type: any, take: any, params: CreateSchemaColumn, cb: any }) {

  try {

    const { schemaId, body } = action.params;

    const url = `SchemaModule/v1.0/schemas/${schemaId}/columns`;
    const res = yield call(async () => await httpPost(url, body));

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

    history.push(`/SchemaModule/SchemaColumn/${schemaId}/${res.data.data.id}`)

    yield put({ type: CREATE_SCHEMA_COLUMN_SUCCESS, results: res.data.data });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Column successfuly created.', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_SCHEMA_COLUMN_ERROR, error });
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
function* updateColumn(action: { type: any, take: any, params: UpdateSchemaColumn, cb: any }) {

  try {

    const { schemaId, schemaColumnId, body } = action.params;

    const url = `SchemaModule/v1.0/schemas/${schemaId}/columns/${schemaColumnId}`;
    const res = yield call(async () => await httpPut(url, body));

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
   
    yield put({ type: UPDATE_SCHEMA_COLUMN_SUCCESS, results: res.data.data });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Column successfuly created.', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: UPDATE_SCHEMA_COLUMN_ERROR, error });
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
function* deleteColumn(action: { type: any, take: any, params: DeleteSchemaColumn, cb: any }) {

  try {

    const { schemaId, schemaColumnId } = action.params;

    let url = `SchemaModule/v1.0/schemas/${schemaId}/columns/${schemaColumnId}`;

    let res = yield call(async () => await httpDelete(url));

    yield put({ type: DELETE_SCHEMA_COLUMN_SUCCESS, results: res.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted record', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SCHEMA_COLUMN_ERROR, error });
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}


/**
 *
 * @param action
 */
function* batchCreatePermissions(action: { type: any, take: any, params: any, cb: any }) {

  try {

    const { schemaId, schemaColumnId } = action.params;

    const url = `IdentityModule/v1.0/rbac/permissions/schemas/columns/batch/${schemaId}/${schemaColumnId}`;

    const res = yield call(async () => await httpPost(url, {}));

    yield put({ type: CREATE_SCHEMA_COLUMN_PERMISSIONS_SUCCESS });
    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Permissions successfuly activated.', type: 'success' },
    });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

  } catch (e) {

    yield put({ type: CREATE_SCHEMA_COLUMN_PERMISSIONS_ERROR });
    const error = e.response ? e.response.data : undefined;
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}


/**
 *
 * @param action
 */
function* batchDeletePermissions(action: { type: any, take: any, params: any, cb: any }) {

  try {

    const { schemaId, schemaColumnId } = action.params;

    const url = `IdentityModule/v1.0/rbac/permissions/schemas/columns/batch/${schemaId}/${schemaColumnId}`

    const res = yield call(async () => await httpDelete(url));

    yield put({ type: DELETE_SCHEMA_COLUMN_PERMISSIONS_SUCCESS });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Permissions successfuly deleted.', type: 'success' },
    });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

  } catch (e) {

    yield put({ type: DELETE_SCHEMA_COLUMN_PERMISSIONS_ERROR });
    const error = e.response ? e.response.data : undefined;
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}

function* rootSaga() {

  yield takeLatest(GET_SCHEMA_COLUMN_REQUEST, getSchemaColumn);
  yield takeLatest(CREATE_SCHEMA_COLUMN_REQUEST, createColumn);
  yield takeLatest(UPDATE_SCHEMA_COLUMN_REQUEST, updateColumn);
  yield takeLatest(DELETE_SCHEMA_COLUMN_REQUEST, deleteColumn);
  yield takeLatest(CREATE_SCHEMA_COLUMN_PERMISSIONS_REQUEST, batchCreatePermissions);
  yield takeLatest(DELETE_SCHEMA_COLUMN_PERMISSIONS_REQUEST, batchDeletePermissions);

}

export default rootSaga;
