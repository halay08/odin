import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost, httpPut } from '../../../shared/http/requests';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  CreateSchemaAssociation,
  DeleteSchemaAssociation,
  GetAssociationBySchemaId,
  UpdateSchemaAssociation,
} from './actions';
import {
  CREATE_SCHEMA_ASSOCIATION_ERROR,
  CREATE_SCHEMA_ASSOCIATION_REQUEST,
  CREATE_SCHEMA_ASSOCIATION_SUCCESS,
  DELETE_SCHEMA_ASSOCIATION_ERROR,
  DELETE_SCHEMA_ASSOCIATION_REQUEST,
  DELETE_SCHEMA_ASSOCIATION_SUCCESS,
  GET_SCHEMA_ASSOCIATIONS_ERROR,
  GET_SCHEMA_ASSOCIATIONS_REQUEST,
  GET_SCHEMA_ASSOCIATIONS_SUCCESS,
  UPDATE_SCHEMA_ASSOCIATION_ERROR,
  UPDATE_SCHEMA_ASSOCIATION_REQUEST,
  UPDATE_SCHEMA_ASSOCIATION_SUCCESS,
} from './constants';


/**
 *
 * @param action
 */
function* getAssociations(action: { params: GetAssociationBySchemaId }) {

  const childUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_CHILD_RELATIONS/unique_associations`;
  const parentlUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_PARENT_RELATIONS/unique_associations`;

  try {

    const childRes = yield call(async () => await httpGet(childUrl));
    const parentRes = yield call(async () => await httpGet(parentlUrl));

    yield put({ type: GET_SCHEMA_ASSOCIATIONS_SUCCESS, childAssociations: childRes.data.data, parentAssociations: parentRes.data.data });

  } catch (e) {

    yield put({ type: GET_SCHEMA_ASSOCIATIONS_ERROR });
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
function* createSchemaAssociation(action: { params: CreateSchemaAssociation }) {


  const url = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations`;

  try {

    let res = yield call(async () => await httpPost(url, action.params.body));

    const childUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_CHILD_RELATIONS/unique_associations`;
    const parentlUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_PARENT_RELATIONS/unique_associations`;

    const childRes = yield call(async () => await httpGet(childUrl));
    const parentRes = yield call(async () => await httpGet(parentlUrl));

    yield put({ type: GET_SCHEMA_ASSOCIATIONS_SUCCESS, childAssociations: childRes.data.data, parentAssociations: parentRes.data.data });

    yield put({ type: CREATE_SCHEMA_ASSOCIATION_SUCCESS, results: res.data.data });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully edited data', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_SCHEMA_ASSOCIATION_ERROR, error });
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
function* updateSchemaAssociation(action: { type: any, take: any, params: UpdateSchemaAssociation, cb: any }) {
  if(action.params === undefined) {
    return;
  }
  const url = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/${action.params.associationId}`;
  try {

    let res = yield call(async () => await httpPut(url, action.params.body));

    const childUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_CHILD_RELATIONS/unique_associations`;
    const parentlUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_PARENT_RELATIONS/unique_associations`;

    const childRes = yield call(async () => await httpGet(childUrl));
    const parentRes = yield call(async () => await httpGet(parentlUrl));

    yield put({ type: GET_SCHEMA_ASSOCIATIONS_SUCCESS, childAssociations: childRes.data.data, parentAssociations: parentRes.data.data });

    yield put({ type: UPDATE_SCHEMA_ASSOCIATION_SUCCESS, results: res.data.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully edited data', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: UPDATE_SCHEMA_ASSOCIATION_ERROR, error });
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
function* deleteSchemaAssociation(action: { type: any, take: any, params: DeleteSchemaAssociation, cb: any }) {

  if(action.params === undefined) {
    return;
  }

  let url = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/${action.params.associationId}`;

  try {
    const res = yield call(async () => await httpDelete(url));

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted association', type: 'success' },
    });

    yield put({ type: DELETE_SCHEMA_ASSOCIATION_SUCCESS, results: res.data.data });

    const childUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_CHILD_RELATIONS/unique_associations`;
    const parentlUrl = `SchemaModule/v1.0/schemas/${action.params.schemaId}/associations/GET_PARENT_RELATIONS/unique_associations`;

    const childRes = yield call(async () => await httpGet(childUrl));
    const parentRes = yield call(async () => await httpGet(parentlUrl));

    yield put({ type: GET_SCHEMA_ASSOCIATIONS_SUCCESS, childAssociations: childRes.data.data, parentAssociations: parentRes.data.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

  } catch (e) {

    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SCHEMA_ASSOCIATION_ERROR, error });

    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}

function* rootSaga() {
  yield takeLatest<any>(GET_SCHEMA_ASSOCIATIONS_REQUEST, getAssociations);
  yield takeLatest<any>(CREATE_SCHEMA_ASSOCIATION_REQUEST, createSchemaAssociation);
  yield takeLatest<any>(UPDATE_SCHEMA_ASSOCIATION_REQUEST, updateSchemaAssociation);
  yield takeLatest<any>(DELETE_SCHEMA_ASSOCIATION_REQUEST, deleteSchemaAssociation);
}

export default rootSaga;
