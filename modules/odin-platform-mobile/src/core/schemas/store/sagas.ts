import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost, httpPut } from '../../../shared/http/requests';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import history from '../../../shared/utilities/browserHisory';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  CreateSchema,
  CreateSchemaType,
  DeleteSchemaType,
  ISchemaById,
  ISchemaByModule,
  ISchemaByModuleAndEntity,
} from './actions';
import {
  BATCH_CREATE_SCHEMA_PERMISSIONS_ERROR,
  BATCH_CREATE_SCHEMA_PERMISSIONS_REQUEST,
  BATCH_CREATE_SCHEMA_PERMISSIONS_SUCCESS,
  BATCH_DELETE_SCHEMA_PERMISSIONS_ERROR,
  BATCH_DELETE_SCHEMA_PERMISSIONS_REQUEST,
  BATCH_DELETE_SCHEMA_PERMISSIONS_SUCCESS,
  CREATE_SCHEMA_ERROR,
  CREATE_SCHEMA_REQUEST,
  CREATE_SCHEMA_SUCCESS,
  CREATE_SCHEMA_TYPE_ERROR,
  CREATE_SCHEMA_TYPE_REQUEST,
  CREATE_SCHEMA_TYPE_SUCCESS,
  DELETE_SCHEMA_BY_ID_ERROR,
  DELETE_SCHEMA_BY_ID_REQUEST,
  DELETE_SCHEMA_BY_ID_SUCCESS,
  DELETE_SCHEMA_TYPE_REQUEST,
  DELETE_SCHEMA_TYPE_SUCCESS,
  GET_SCHEMA_BY_ID_ERROR,
  GET_SCHEMA_BY_ID_REQUEST,
  GET_SCHEMA_BY_ID_SUCCESS,
  GET_SCHEMA_BY_MODULE_AND_ENTITY_ERROR,
  GET_SCHEMA_BY_MODULE_AND_ENTITY_REQUEST,
  GET_SCHEMA_BY_MODULE_AND_ENTITY_SUCCESS,
  GET_SCHEMA_BY_MODULE_ERROR,
  GET_SCHEMA_BY_MODULE_REQUEST,
  GET_SCHEMA_BY_MODULE_SUCCESS,
  LIST_SCHEMAS_ERROR,
  LIST_SCHEMAS_REQUEST,
  LIST_SCHEMAS_SUCCESS,
  UPDATE_SCHEMA_BY_ID_ERROR,
  UPDATE_SCHEMA_BY_ID_REQUEST,
} from './constants';


/**
 *
 */
function* listSchemas() {
  try {
    const res = yield call(async () => await httpGet(`SchemaModule/v1.0/schemas`));
    yield put({ type: LIST_SCHEMAS_SUCCESS, results: res.data });
  } catch (e) {
    yield put({ type: LIST_SCHEMAS_ERROR });

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
function* getSchemasByModule(action: { type: any, take: any, params: ISchemaByModule }) {
  try {
    const { moduleName } = action.params;

    const res = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/bymodule?moduleName=${moduleName}`,
    ));
    yield put({ type: GET_SCHEMA_BY_MODULE_SUCCESS, results: res.data });
  } catch (e) {

    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_SCHEMA_BY_MODULE_ERROR });
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
function* getByModuleAndEntity(action: { type: any, take: any, params: ISchemaByModuleAndEntity, cb: any }) {
  try {
    const { moduleName, entityName, withAssociations } = action.params;

    let path = `SchemaModule/v1.0/schemas/bymodule?moduleName=${moduleName}&entityName=${entityName}`;
    if(withAssociations) {
      path = path.concat(`&withAssociations=${withAssociations}`);
    }

    const res = yield call(async () => await httpGet(path));
    yield put({ type: GET_SCHEMA_BY_MODULE_AND_ENTITY_SUCCESS, results: res.data.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_SCHEMA_BY_MODULE_AND_ENTITY_ERROR });
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
function* getSchemaById(action: { type: any, take: any, params: ISchemaById, cb: any }) {
  try {

    const { schemaId } = action.params;

    const res = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/${schemaId}`,
    ));

    yield put({ type: GET_SCHEMA_BY_ID_SUCCESS, results: res.data.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

  } catch (e) {

    yield put({ type: GET_SCHEMA_BY_ID_ERROR });
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
function* createSchema(action: { type: any, take: any, params: CreateSchema, cb: any }) {
  try {

    const url = `SchemaModule/v1.0/schemas`;

    const { body } = action.params;

    let res = yield call(async () => await httpPost(url, body));

    yield put({ type: CREATE_SCHEMA_SUCCESS, results: res.data.data });

    history.push(`/SchemaModule/Schema/${res.data.data.id}`)

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully saved settings', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_SCHEMA_ERROR, error });
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
function* updateSchema(action: { type: any, take: any, params: any, cb: any }) {


  try {

    const { schemaId } = action.params;

    const url = `SchemaModule/v1.0/schemas/${schemaId}`;

    const res = yield call(async () => await httpPut(url, action.params.data));

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully saved settings', type: 'success' },
    });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: UPDATE_SCHEMA_BY_ID_ERROR, error });
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
function* deleteSchema(action: { type: any, take: any, params: any }) {
  const url = `SchemaModule/v1.0/schemas/${action.params.schemaId}`;
  try {
    yield call(async () => await httpDelete(url));

    yield history.goBack();

    yield put({ type: DELETE_SCHEMA_BY_ID_SUCCESS })

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted schema', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SCHEMA_BY_ID_ERROR, error });
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

    const { schemaId } = action.params;

    const url = `IdentityModule/v1.0/rbac/permissions/schemas/batch/${schemaId}`;

    const res = yield call(async () => await httpPost(url, {}));

    const getRes = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/${schemaId}`,
    ));

    yield put({ type: GET_SCHEMA_BY_ID_SUCCESS, results: getRes.data.data })

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Permissions successfuly activated.', type: 'success' },
    });

    yield put({ type: BATCH_CREATE_SCHEMA_PERMISSIONS_SUCCESS });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

  } catch (e) {

    yield put({ type: BATCH_CREATE_SCHEMA_PERMISSIONS_ERROR });
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

  const { schemaId } = action.params;

  const url = `IdentityModule/v1.0/rbac/permissions/schemas/batch/${schemaId}`;
  try {

    const res = yield call(async () => await httpDelete(url));

    const getRes = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/${schemaId}`,
    ));
    yield put({ type: GET_SCHEMA_BY_ID_SUCCESS, results: getRes.data.data })

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'Permissions successfuly deleted.', type: 'success' },
    });

    yield put({ type: BATCH_DELETE_SCHEMA_PERMISSIONS_SUCCESS });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
  } catch (e) {

    yield put({ type: BATCH_DELETE_SCHEMA_PERMISSIONS_ERROR });
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
function* createSchemaType(action: { type: any, take: any, params: CreateSchemaType, cb: any }) {
  try {

    const { body, schemaId } = action.params;

    const url = `SchemaModule/v1.0/schemas/${schemaId}/types`;

    let res = yield call(async () => await httpPost(url, body));

    yield put({ type: CREATE_SCHEMA_TYPE_SUCCESS, results: res.data.data });

    const getRes = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/${schemaId}`,
    ));

    yield put({ type: GET_SCHEMA_BY_ID_SUCCESS, results: getRes.data.data });

    if(action.cb) {
      yield call(action.cb, res.data.data);
    }

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully saved settings', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_SCHEMA_TYPE_ERROR, error });
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
function* deleteSchemaType(action: { type: any, take: any, params: DeleteSchemaType }) {
  try {

    const { schemaId, schemaTypeId } = action.params;

    const url = `SchemaModule/v1.0/schemas/${schemaId}/types/${schemaTypeId}`

    yield call(async () => await httpDelete(url));

    const getRes = yield call(async () => await httpGet(
      `SchemaModule/v1.0/schemas/${schemaId}`,
    ));

    yield put({ type: GET_SCHEMA_BY_ID_SUCCESS, results: getRes.data.data });

    yield put({ type: DELETE_SCHEMA_TYPE_SUCCESS })

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted schema', type: 'success' },
    });

  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_SCHEMA_BY_ID_ERROR, error });
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}


/**
 * Register all generators here
 */
function* rootSaga() {
  yield takeLatest(LIST_SCHEMAS_REQUEST, listSchemas);
  yield takeEvery(GET_SCHEMA_BY_ID_REQUEST, getSchemaById);
  yield takeLatest(GET_SCHEMA_BY_MODULE_REQUEST, getSchemasByModule);
  yield takeEvery(GET_SCHEMA_BY_MODULE_AND_ENTITY_REQUEST, getByModuleAndEntity);
  yield takeLatest(UPDATE_SCHEMA_BY_ID_REQUEST, updateSchema);
  yield takeLatest(DELETE_SCHEMA_BY_ID_REQUEST, deleteSchema);
  yield takeLatest(BATCH_CREATE_SCHEMA_PERMISSIONS_REQUEST, batchCreatePermissions);
  yield takeLatest(BATCH_DELETE_SCHEMA_PERMISSIONS_REQUEST, batchDeletePermissions);
  yield takeLatest(CREATE_SCHEMA_REQUEST, createSchema);
  yield takeLatest(CREATE_SCHEMA_TYPE_REQUEST, createSchemaType)
  yield takeLatest(DELETE_SCHEMA_TYPE_REQUEST, deleteSchemaType)
}

export default rootSaga;
