import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { call, put, takeLatest } from 'redux-saga/effects';
import { httpDelete, httpGet, httpPost } from '../../../shared/http/requests';
import { DISPLAY_MESSAGE } from '../../../shared/system/messages/store/reducers';
import { ERROR_NOTIFICATION } from '../../../shared/system/notifications/store/reducers';
import { USER_LOGOUT_REQUEST } from '../../identity/store/constants';
import {
  CreatePipeline,
  CreatePipelineStage,
  DeletePipeline,
  DeletePipelineStage,
  IPipelineByStageId,
} from './actions';
import {
  CREATE_PIPELINE_ERROR,
  CREATE_PIPELINE_REQUEST,
  CREATE_PIPELINE_STAGE_ERROR,
  CREATE_PIPELINE_STAGE_REQUEST,
  CREATE_PIPELINE_STAGE_SUCCESS,
  CREATE_PIPELINE_SUCCESS,
  DELETE_PIPELINE_ERROR,
  DELETE_PIPELINE_REQUEST,
  DELETE_PIPELINE_STAGE_REQUEST,
  DELETE_PIPELINE_STAGE_SUCCESS,
  DELETE_PIPELINE_SUCCESS,
  GET_PIPELINE_BY_STAGE_ID_ERROR,
  GET_PIPELINE_BY_STAGE_ID_REQUEST,
  GET_PIPELINE_BY_STAGE_ID_SUCCESS,
  GET_PIPELINES_BY_MODULE_AND_ENTITY_ERROR,
  GET_PIPELINES_BY_MODULE_AND_ENTITY_REQUEST,
  GET_PIPELINES_BY_MODULE_AND_ENTITY_SUCCESS,
  GET_PIPELINES_BY_MODULE_ERROR,
  GET_PIPELINES_BY_MODULE_REQUEST,
  GET_PIPELINES_BY_MODULE_SUCCESS,
} from './constants';


function* getPipelineByStageId(action: { params: IPipelineByStageId, cb: any }) {

  const { schema, stageId } = action.params;
  try {
    const res = yield call(async () => await httpGet(`${schema.moduleName}/v1.0/stages/${stageId}`));
    yield put({ type: GET_PIPELINE_BY_STAGE_ID_SUCCESS, results: res.data.data.pipeline });

    if(action.cb) {
      yield call(action.cb, res.data.data.pipeline);
    }
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_PIPELINE_BY_STAGE_ID_ERROR, error });
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}

function* getByModule(action: { params: { schema: SchemaEntity } }) {

  const { moduleName } = action.params.schema;
  try {
    const res = yield call(async () => await httpGet(`${moduleName}/v1.0/pipelines/bymodule/${moduleName}`));
    yield put({ type: GET_PIPELINES_BY_MODULE_SUCCESS, results: res.data.data });
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_PIPELINES_BY_MODULE_ERROR, error });
    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}

function* getByModuleAndEntity(action: { params: { schema: SchemaEntity, }, cb: any }) {

  const { moduleName, entityName } = action.params.schema;
  try {
    const res = yield call(async () => await httpGet(`${moduleName}/v1.0/pipelines/bymodule/${moduleName}/${entityName}`));
    yield put({ type: GET_PIPELINES_BY_MODULE_AND_ENTITY_SUCCESS, results: res.data.data });
    if(action.cb) {
      yield call(action.cb, res.data.data);
    }
  } catch (e) {
    const error = e.response ? e.response.data : undefined;
    yield put({ type: GET_PIPELINES_BY_MODULE_AND_ENTITY_ERROR, error });
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
function* createPipeline(action: { params: CreatePipeline }) {

  const { body } = action.params;

  let url = `SchemaModule/v1.0/pipelines`;

  try {

    let res = yield call(async () => await httpPost(url, body));

    console.log('res', res);

    yield put({ type: CREATE_PIPELINE_SUCCESS, results: res.data.data });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully created pipeline', type: 'success' },
    });

  } catch (e) {

    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_PIPELINE_ERROR, error });

    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}


/**
 *
 * @param params
 */
function* deletePipeline(action: { params: DeletePipeline }) {

  const { pipelineId } = action.params;

  let url = `SchemaModule/v1.0/pipelines/${pipelineId}`;

  try {

    yield call(async () => await httpDelete(url));

    yield put({ type: DELETE_PIPELINE_SUCCESS });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted pipeline', type: 'success' },
    });

  } catch (e) {

    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_PIPELINE_ERROR, error });

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
function* createPipelineStage(action: { params: CreatePipelineStage }) {

  const { pipelineId, schema, body } = action.params;

  let url = `SchemaModule/v1.0/stages/${pipelineId}`;

  try {

    yield call(async () => await httpPost(url, body));

    const res = yield call(async () => await httpGet(`${schema?.moduleName}/v1.0/pipelines/bymodule/${schema?.moduleName}/${schema?.entityName}`));
    yield put({ type: GET_PIPELINES_BY_MODULE_AND_ENTITY_SUCCESS, results: res.data.data });

    yield put({ type: CREATE_PIPELINE_STAGE_SUCCESS });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully create pipeline stage', type: 'success' },
    });

  } catch (e) {

    const error = e.response ? e.response.data : undefined;
    yield put({ type: CREATE_PIPELINE_STAGE_ERROR, error });

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
function* deletePipelineStage(action: { params: DeletePipelineStage }) {

  const { schema, stageId } = action.params;

  let url = `SchemaModule/v1.0/stages/${stageId}`;

  try {

    yield call(async () => await httpDelete(url));

    const res = yield call(async () => await httpGet(`${schema?.moduleName}/v1.0/pipelines/bymodule/${schema?.moduleName}/${schema?.entityName}`));
    yield put({ type: GET_PIPELINES_BY_MODULE_AND_ENTITY_SUCCESS, results: res.data.data });

    yield put({ type: DELETE_PIPELINE_STAGE_SUCCESS });

    yield put({
      type: DISPLAY_MESSAGE,
      message: { body: 'successfully deleted pipeline stage', type: 'success' },
    });

  } catch (e) {

    const error = e.response ? e.response.data : undefined;
    yield put({ type: DELETE_PIPELINE_ERROR, error });

    if(!!error && e.response.data.statusCode === 401) {
      yield put({ type: USER_LOGOUT_REQUEST, error });
    } else {
      yield put({ type: ERROR_NOTIFICATION, error: !!error ? error : e });
    }
  }
}


function* rootSaga() {
  yield takeLatest<any>(GET_PIPELINE_BY_STAGE_ID_REQUEST, getPipelineByStageId);
  yield takeLatest<any>(GET_PIPELINES_BY_MODULE_REQUEST, getByModule);
  yield takeLatest<any>(GET_PIPELINES_BY_MODULE_AND_ENTITY_REQUEST, getByModuleAndEntity);
  yield takeLatest<any>(CREATE_PIPELINE_REQUEST, createPipeline);
  yield takeLatest<any>(DELETE_PIPELINE_REQUEST, deletePipeline);
  yield takeLatest<any>(CREATE_PIPELINE_STAGE_REQUEST, createPipelineStage);
  yield takeLatest<any>(DELETE_PIPELINE_STAGE_REQUEST, deletePipelineStage);
}

export default rootSaga;
