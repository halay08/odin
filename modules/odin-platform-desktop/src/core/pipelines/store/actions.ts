import { PipelineCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/dto/pipeline.create.update.dto';
import { PipelineStageCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/stage/dto/pipeline.stage.create.update.dto';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import {
  CREATE_PIPELINE_REQUEST,
  CREATE_PIPELINE_STAGE_REQUEST,
  DELETE_PIPELINE_REQUEST,
  DELETE_PIPELINE_STAGE_REQUEST,
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

export interface DeletePipeline {
  pipelineId: string
}

export interface CreatePipeline {
  body: PipelineCreateUpdateDto
}


export interface CreatePipelineStage {
  pipelineId: string
  schema: SchemaEntity
  body: PipelineStageCreateUpdateDto
}

export interface DeletePipelineStage {
  pipelineId: string
  schema: SchemaEntity
  stageId: string
}

export function getPipelineByStageIdRequest(params: IPipelineByStageId, cb = () => {
}) {
  return {
    type: GET_PIPELINE_BY_STAGE_ID_REQUEST,
    params,
    cb,
  };
}

export function createPipelineRequest(params: CreatePipeline) {
  return {
    type: CREATE_PIPELINE_REQUEST,
    params,
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

export function deletePipelineByIdRequest(params: DeletePipeline) {
  return {
    type: DELETE_PIPELINE_REQUEST,
    params,
  }
}

// Pipeline Stages

export function createPipelineStageRequest(params: CreatePipelineStage) {
  return {
    type: CREATE_PIPELINE_STAGE_REQUEST,
    params,
  };
}

export function deletePipelineStageRequest(params: DeletePipelineStage) {
  return {
    type: DELETE_PIPELINE_STAGE_REQUEST,
    params,
  }
}
