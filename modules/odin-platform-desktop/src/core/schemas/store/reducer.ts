import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import {
  BATCH_CREATE_SCHEMA_PERMISSIONS_ERROR,
  BATCH_CREATE_SCHEMA_PERMISSIONS_REQUEST,
  BATCH_CREATE_SCHEMA_PERMISSIONS_SUCCESS,
  BATCH_DELETE_SCHEMA_PERMISSIONS_ERROR,
  BATCH_DELETE_SCHEMA_PERMISSIONS_REQUEST,
  BATCH_DELETE_SCHEMA_PERMISSIONS_SUCCESS,
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
} from './constants';


export interface SchemaReducerState {
  isRequesting: boolean,
  isSuccessful: boolean,
  format: 'transform' | undefined, // query format=transform | raw
  list: SchemaEntity[],
  shortList: {
    [key: string]: SchemaEntity
  }
}

export const initialState: SchemaReducerState = {
  isRequesting: false,
  isSuccessful: false,
  format: undefined, // query format=transform | raw
  list: [],
  shortList: {},
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    // Get all schemas
    case LIST_SCHEMAS_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case LIST_SCHEMAS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case LIST_SCHEMAS_ERROR: {
      return {
        isRequesting: false,
        isSuccessful: false,
        list: [],
      }
    }

    // Get a list of schemas by module
    case GET_SCHEMA_BY_MODULE_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        searchQuery: action.searchQuery,
      }
    }
    case GET_SCHEMA_BY_MODULE_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        list: action.results.data,
      }
    }
    case GET_SCHEMA_BY_MODULE_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        selected: undefined,
      }
    }

    // Get a single schema by module and entity
    case GET_SCHEMA_BY_MODULE_AND_ENTITY_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        searchQuery: action.searchQuery,
      }
    }
    case GET_SCHEMA_BY_MODULE_AND_ENTITY_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_SCHEMA_BY_MODULE_AND_ENTITY_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    // Get a single schema by id
    case GET_SCHEMA_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
        format: action.format,
      }
    }
    case GET_SCHEMA_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        shortList: Object.assign({}, state.shortList, { [action.results.id]: action.results }),
      }
    }
    case GET_SCHEMA_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case BATCH_CREATE_SCHEMA_PERMISSIONS_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case BATCH_CREATE_SCHEMA_PERMISSIONS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
      }
    }
    case BATCH_CREATE_SCHEMA_PERMISSIONS_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case BATCH_DELETE_SCHEMA_PERMISSIONS_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case BATCH_DELETE_SCHEMA_PERMISSIONS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
      }
    }
    case BATCH_DELETE_SCHEMA_PERMISSIONS_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }


    default:
      return state;
  }
}

export default reducer;

