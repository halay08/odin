import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import {
  GET_PIPELINE_BY_STAGE_ID_REQUEST,
  GET_PIPELINES_BY_MODULE_AND_ENTITY_REQUEST,
  GET_PIPELINES_BY_MODULE_REQUEST,
  SET_PIPELINE_REDUCER_STATE,
} from './constants';
import { PipelineReducerState } from './reducer';

export interface IPipelineByStageId {
  schema: SchemaEntity;
  stageId: string;
}

export function getPipelineByStageIdRequest(params: IPipelineByStageId, cb = () => {}) {
  return {
    type: GET_PIPELINE_BY_STAGE_ID_REQUEST,
    params,
    cb,
  };
}

export function getPipelinesByModule(params: { schema: SchemaEntity }) {
  return {
    type: GET_PIPELINES_BY_MODULE_REQUEST,
    params,
  };
}

export function setPipelineReducerState(params: PipelineReducerState) {
  return {
    type: SET_PIPELINE_REDUCER_STATE,
    params,
  };
}


export function getPipelinesByModuleAndEntity(params: { schema: SchemaEntity }) {
  return {
    type: GET_PIPELINES_BY_MODULE_AND_ENTITY_REQUEST,
    params,
  };
}
