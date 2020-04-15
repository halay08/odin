import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { PipelineCreateUpdateDto } from '@d19n/models/dist/schema-manager/pipeline/dto/pipeline.create.update.dto';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
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
  SET_PIPELINE_REDUCER_STATE,
} from './constants';

export interface PipelineReducerState {
  isRequesting: boolean,
  isCreating: boolean,
  isUpdating: boolean,
  isSearching: boolean,
  schema: SchemaEntity | null,
  list: PipelineEntity[],
  shortList: { [key: string]: any } | null,
  selected: { [key: string]: any } | null,
  createUpdate: PipelineCreateUpdateDto[]
  errors: ExceptionType[]
}


export const initialState: PipelineReducerState = {
  isRequesting: false,
  isCreating: false,
  isUpdating: false,
  isSearching: false,
  schema: null,
  selected: null,
  list: [],
  shortList: {},
  createUpdate: [],
  errors: [],
};

function reducer(state = initialState, action: any) {
  switch (action.type) {

    case SET_PIPELINE_REDUCER_STATE: {
      return {
        ...state,
        ...action.params,
      }
    }

    case GET_PIPELINE_BY_STAGE_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
      }
    }
    case GET_PIPELINE_BY_STAGE_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        selected: action.results,
      }
    }
    case GET_PIPELINE_BY_STAGE_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    case GET_PIPELINES_BY_MODULE_REQUEST: {
      return {
        ...state,
        isRequesting: true,
      }
    }
    case GET_PIPELINES_BY_MODULE_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        list: action.results,
      }
    }
    case GET_PIPELINES_BY_MODULE_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    case GET_PIPELINES_BY_MODULE_AND_ENTITY_REQUEST: {
      return {
        ...state,
        isRequesting: true,
      }
    }
    case GET_PIPELINES_BY_MODULE_AND_ENTITY_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        list: action.results,
        selected: action.results[0],
      }
    }
    case GET_PIPELINES_BY_MODULE_AND_ENTITY_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    default:
      return state;
  }
}

export default reducer;
