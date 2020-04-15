import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
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


export interface SchemaAssociationReducer {
  isRequesting: boolean,
  isSuccessful: boolean,
  childAssociations: SchemaAssociationEntity[],
  parentAssociations: SchemaAssociationEntity[],

}

export const initialState: SchemaAssociationReducer = {
  isRequesting: false,
  isSuccessful: false,
  childAssociations: [],
  parentAssociations: [],
};


function reducer(state = initialState, action: any) {
  switch (action.type) {


    case GET_SCHEMA_ASSOCIATIONS_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }

    case GET_SCHEMA_ASSOCIATIONS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
        childAssociations: action.childAssociations,
        parentAssociations: action.parentAssociations,
      }
    }

    case GET_SCHEMA_ASSOCIATIONS_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case UPDATE_SCHEMA_ASSOCIATION_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }

    case UPDATE_SCHEMA_ASSOCIATION_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
      }
    }

    case UPDATE_SCHEMA_ASSOCIATION_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case CREATE_SCHEMA_ASSOCIATION_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }

    case CREATE_SCHEMA_ASSOCIATION_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
      }
    }

    case CREATE_SCHEMA_ASSOCIATION_ERROR: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: false,
      }
    }

    case DELETE_SCHEMA_ASSOCIATION_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        isSuccessful: false,
      }
    }

    case DELETE_SCHEMA_ASSOCIATION_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        isSuccessful: true,
      }
    }

    case DELETE_SCHEMA_ASSOCIATION_ERROR: {
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

