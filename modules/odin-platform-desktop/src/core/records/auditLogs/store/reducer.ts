import { SearchQueryType } from "@d19n/models/dist/search/search.query.type";
import { SchemaEntity } from "@d19n/models/dist/schema-manager/schema/schema.entity";
import { SearchPageableType } from "@d19n/models/dist/search/search.pageable.type";
import { ExceptionType } from "@d19n/common/dist/exceptions/types/ExceptionType";
import {
  GET_DB_RECORD_AUDIT_LOGS_ERROR,
  GET_DB_RECORD_AUDIT_LOGS_REQUEST,
  GET_DB_RECORD_AUDIT_LOGS_SUCCESS,
} from "./constants";
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import { DbRecordCreateUpdateDto } from "@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto";

export interface RecordAssociationsReducer {
  isRequesting: boolean,
  isCreating: boolean,
  isUpdating: boolean,
  isSearching: boolean,
  search: any,
  searchQuery: SearchQueryType | null,
  schema: SchemaEntity | null,
  format: null,
  list: DbRecordEntityTransform[],
  shortList: { [key: string]: any } | null,
  selected: { [key: string]: any } | null,
  createUpdate: DbRecordCreateUpdateDto[]
  pageable: SearchPageableType | null,
  errors: ExceptionType[]
}


export const initialState: RecordAssociationsReducer = {
  isRequesting: false,
  isCreating: false,
  isUpdating: false,
  isSearching: false,
  searchQuery: null,
  search: null,
  schema: null,
  selected: null,
  format: null,
  list: [],
  shortList: {},
  pageable: null,
  createUpdate: [],
  errors: [],
};

function reducer(state = initialState, action: any) {
  switch (action.type) {
    case GET_DB_RECORD_AUDIT_LOGS_REQUEST: {
      return {
        ...state,
        isRequesting: true,
        format: action.format,
      }
    }

    case GET_DB_RECORD_AUDIT_LOGS_SUCCESS: {
      return {
        ...state,
        isRequesting: false,
        list: action.results.data,
      }
    }

    case GET_DB_RECORD_AUDIT_LOGS_ERROR: {
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

