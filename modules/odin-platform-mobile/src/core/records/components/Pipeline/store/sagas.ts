import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { call, put, takeLatest } from 'redux-saga/effects';
import { USER_LOGOUT_REQUEST } from '../../../../identity/store/constants';
import { httpGet } from '../../../../../shared/http/requests';
import { ERROR_NOTIFICATION } from '../../../../../shared/system/notifications/store/reducers';
import { IPipelineByStageId } from './actions';
import {
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


function* rootSaga() {
  yield takeLatest<any>(GET_PIPELINE_BY_STAGE_ID_REQUEST, getPipelineByStageId);
  yield takeLatest<any>(GET_PIPELINES_BY_MODULE_REQUEST, getByModule);
  yield takeLatest<any>(GET_PIPELINES_BY_MODULE_AND_ENTITY_REQUEST, getByModuleAndEntity);
}

export default rootSaga;
