import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import {
  CREATE_SCHEMA_COLUMN_ERROR,
  CREATE_SCHEMA_COLUMN_REQUEST,
  CREATE_SCHEMA_COLUMN_SUCCESS,
  DELETE_SCHEMA_COLUMN_ERROR,
  DELETE_SCHEMA_COLUMN_REQUEST,
  DELETE_SCHEMA_COLUMN_SUCCESS,
  GET_SCHEMA_COLUMN_ERROR,
  GET_SCHEMA_COLUMN_REQUEST,
  GET_SCHEMA_COLUMN_SUCCESS,
  REMOVE_SCHEMA_COLUMN_OPTION,
  UPDATE_SCHEMA_COLUMN_ERROR,
  UPDATE_SCHEMA_COLUMN_PROPERTIES,
  UPDATE_SCHEMA_COLUMN_REDUCER,
  UPDATE_SCHEMA_COLUMN_REQUEST,
  UPDATE_SCHEMA_COLUMN_SUCCESS,
} from './constants';


export interface SchemaColumnReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  selected: SchemaColumnEntity | undefined
}

export const initialState: SchemaColumnReducer = {
  isRequesting: false,
  isSuccessful: false,
  selected: undefined,
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    case UPDATE_SCHEMA_COLUMN_PROPERTIES: {
      return {
        ...state,
        selected: Object.assign({}, state.selected, action.params),
      }
    }

    case REMOVE_SCHEMA_COLUMN_OPTION: {

      const optionsCopy = state?.selected?.options;
      let newOptions: any[] = [];

      if(optionsCopy) {
        newOptions = optionsCopy.filter(elem => elem.value !== action.params.value)
      }

      return {
        ...state,
        selected: Object.assign({}, state.selected, { options: newOptions }),
      }
    }


    case UPDATE_SCHEMA_COLUMN_REDUCER: {
      return {
        ...state,
        ...action.params,
      }
    }

    case GET_SCHEMA_COLUMN_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case GET_SCHEMA_COLUMN_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        selected: action.results,
      }
    }
    case GET_SCHEMA_COLUMN_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case CREATE_SCHEMA_COLUMN_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case CREATE_SCHEMA_COLUMN_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        selected: action.results.data,
      }
    }
    case CREATE_SCHEMA_COLUMN_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        selected: undefined,
      }
    }

    case UPDATE_SCHEMA_COLUMN_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case UPDATE_SCHEMA_COLUMN_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        selected: action.results,
      }
    }
    case UPDATE_SCHEMA_COLUMN_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        selected: undefined,
      }
    }

    case DELETE_SCHEMA_COLUMN_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }
    case DELETE_SCHEMA_COLUMN_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        selected: action.results.data,
      }
    }
    case DELETE_SCHEMA_COLUMN_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
        selected: undefined,
      }
    }


    default:
      return state;
  }
}

export default reducer;

