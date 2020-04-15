import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SearchPageType } from '@d19n/models/dist/search/search.page.type';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import { updateObject } from '../../../shared/utilities/reducerHelpers';
import {
  DB_RECORD_ASSOCIATIONS_ADD_TO_SELECTED,
  DB_RECORD_ASSOCIATIONS_CREATE_ERROR,
  DB_RECORD_ASSOCIATIONS_CREATE_REQUEST,
  DB_RECORD_ASSOCIATIONS_CREATE_SUCCESS,
  DB_RECORD_ASSOCIATIONS_UPDATE_ERROR,
  DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST,
  DB_RECORD_ASSOCIATIONS_UPDATE_SUCCESS,
  DELETE_DB_RECORD_ASSOCIATION_BY_ID_ERROR,
  DELETE_DB_RECORD_ASSOCIATION_BY_ID_REQUEST,
  DELETE_DB_RECORD_ASSOCIATION_BY_ID_SUCCESS,
  GET_DB_RECORD_ASSOCIATION_BY_ID_ERROR,
  GET_DB_RECORD_ASSOCIATION_BY_ID_REQUEST,
  GET_DB_RECORD_ASSOCIATION_BY_ID_SUCCESS,
  GET_DB_RECORD_ASSOCIATIONS_ERROR,
  GET_DB_RECORD_ASSOCIATIONS_REQUEST,
  GET_DB_RECORD_ASSOCIATIONS_SUCCESS,
  SEARCH_DB_RECORD_ASSOCIATIONS_ERROR,
  SEARCH_DB_RECORD_ASSOCIATIONS_REQUEST,
  SEARCH_DB_RECORD_ASSOCIATIONS_SUCCESS,
} from './constants';

export interface IRecordAssociationsReducer {
  isRequesting: boolean,
  isCreating: boolean,
  isDeleting: boolean,
  isUpdating: boolean,
  isSearching: boolean,
  search: any,
  searchQuery: SearchQueryType,
  format: 'transformLevel1 | transformLevel2' | null,
  list: DbRecordAssociationRecordsTransform[],
  shortList: { [schemaId: string]: DbRecordAssociationRecordsTransform },
  selected: DbRecordEntityTransform | undefined,
  createUpdate: DbRecordCreateUpdateDto[]
  pageable: SearchPageType | null,
  selectedItems: string[],
  errors: ExceptionType[]
}


export const initialState: IRecordAssociationsReducer = {
  isRequesting: false,
  isCreating: false,
  isDeleting: false,
  isUpdating: false,
  isSearching: false,
  searchQuery: {
    terms: '',
    pageable: {
      size: 50,
      page: 1,
    },
    sort: [
      { 'createdAt': { 'order': 'desc' } },
    ],
  },
  search: null,
  format: null,
  list: [],
  selectedItems: [],
  selected: undefined,
  shortList: {},
  pageable: null,
  createUpdate: [],
  errors: [],
};

function reducer(state = initialState, action: any) {
  switch (action.type) {

    case SEARCH_DB_RECORD_ASSOCIATIONS_REQUEST: {
      return {
        ...state,
        searchQuery: updateObject(state.searchQuery, action.params.searchQuery),
        isSearching: true,
      }
    }
    case SEARCH_DB_RECORD_ASSOCIATIONS_SUCCESS: {
      return {
        ...state,
        search: action.results.search,
        pageable: action.results.pageable,
        list: action.results.data,
        isSearching: false,
      }
    }
    case SEARCH_DB_RECORD_ASSOCIATIONS_ERROR: {
      return {
        ...initialState,
      }
    }

    // Get records
    case GET_DB_RECORD_ASSOCIATION_BY_ID_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        format: action.format,
      }
    }
    case GET_DB_RECORD_ASSOCIATION_BY_ID_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        shortList: Object.assign(
          {},
          state.shortList,
          { [`${action.results.dbRecordAssociation.id}_${action.results.id}`]: action.results },
        ),
      }
    }

    case GET_DB_RECORD_ASSOCIATION_BY_ID_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    // Update related record
    case DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST: {
      return {
        ...state,
        ...action.params,
        isUpdating: true,
      }
    }
    case DB_RECORD_ASSOCIATIONS_UPDATE_SUCCESS: {
      return {
        ...state,
        isUpdating: false,
      }
    }
    case DB_RECORD_ASSOCIATIONS_UPDATE_ERROR: {
      return {
        ...state,
        isUpdating: false,
        errors: [],
      }
    }

    // Get records
    case GET_DB_RECORD_ASSOCIATIONS_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        format: action.format,
      }
    }
    case GET_DB_RECORD_ASSOCIATIONS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        shortList: Object.assign(
          {},
          state.shortList,
          { [action.key ? `${action.recordId}_${action.key}` : `${action.recordId}`]: action.results },
        ),
      }
    }
    case GET_DB_RECORD_ASSOCIATIONS_ERROR: {
      return {
        ...state,
        isRequesting: false,
      }
    }

    // create
    case DB_RECORD_ASSOCIATIONS_CREATE_REQUEST: {
      return {
        ...state,
        ...action.params,
        isCreating: true,
      }
    }
    case DB_RECORD_ASSOCIATIONS_CREATE_SUCCESS: {
      return {
        ...state,
        isCreating: false,
        errors: [],
      }
    }
    case DB_RECORD_ASSOCIATIONS_CREATE_ERROR: {
      return {
        ...state,
        isCreating: false,
        errors: action.errors,
      }
    }

    // delete
    case DELETE_DB_RECORD_ASSOCIATION_BY_ID_REQUEST: {
      return {
        ...state,
        isDeleting: true,
      }
    }
    case DELETE_DB_RECORD_ASSOCIATION_BY_ID_SUCCESS: {
      return {
        ...state,
        isDeleting: false,
      }
    }
    case DELETE_DB_RECORD_ASSOCIATION_BY_ID_ERROR: {
      return {
        ...state,
        isDeleting: false,
        errors: action.errors,
      }
    }

    case DB_RECORD_ASSOCIATIONS_ADD_TO_SELECTED: {

      if(state.selectedItems.includes(action.recordId)) {
        return {
          ...state,
          selectedItems: state.selectedItems.filter((key) => key !== action.recordId),
        }
      } else {
        return {
          ...state,
          selectedItems: [ ...state.selectedItems, action.recordId ],
        }
      }
    }

    default:
      return state;
  }
}

export default reducer;

