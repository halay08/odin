import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import {
  ADD_RECORD_TO_SHORT_LIST,
  CREATE_DB_RECORD_REQUEST,
  DELETE_DB_RECORD_BY_ID_REQUEST,
  GET_DB_RECORD_BY_ID_REQUEST,
  MERGE_DB_RECORD_REQUEST,
  RESET_DB_RECORDS_LIST,
  RESET_DB_RECORDS_SEARCH_QUERY,
  SEARCH_DB_RECORD_REQUEST,
  SET_DB_RECORD_SEARCH_QUERY,
  SET_DB_RECORD_STATE,
  TOGGLE_SEARCH_VISIBILITY,
  UPDATE_DB_RECORD_BY_ID_REQUEST,
} from './constants';
import { IRecordReducer } from './reducer';


// Action Interfaces
export interface ISearchRecords {
  // use the list key if you want to override the default key which is the schema.id
  listKey?: string,
  schema: SchemaEntity,
  searchQuery: SearchQueryType
}

export interface ICreateRecords {
  schema: SchemaEntity,
  createUpdate: DbRecordCreateUpdateDto[]
}

export interface IGetRecordById {
  schema: SchemaEntity,
  recordId: string
}

export interface IUpdateRecordById {
  schema: SchemaEntity,
  recordId: string,
  createUpdate: DbRecordCreateUpdateDto
}

export interface IDeleteRecordById {
  schema: SchemaEntity,
  recordId: string,
}

export interface IAddRecordToShortList {
  showPreview?: boolean
  record: DbRecordEntityTransform
}

export interface IMergeDbRecords {
  schema: SchemaEntity,
  masterRecordId: string,
  mergeRecordId: string,
  associations?: DbRecordAssociationCreateUpdateDto[],
  properties?: { [key: string]: any }
}

// Actions
export function setDbRecordSearchQuery(params: { searchQuery: SearchQueryType }) {
  return {
    type: SET_DB_RECORD_SEARCH_QUERY,
    params,
  }
}

export function searchRecordsRequest(params: ISearchRecords) {
  return {
    type: SEARCH_DB_RECORD_REQUEST,
    params,
  }
}

export function createRecordsRequest(params: ICreateRecords, cb = () => {
}) {
  return {
    type: CREATE_DB_RECORD_REQUEST,
    params,
    cb,
  }
}

export function getRecordByIdRequest(params: IGetRecordById, cb = () => {
}) {
  return {
    type: GET_DB_RECORD_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function updateRecordByIdRequest(params: IUpdateRecordById, cb = () => {
}) {
  return {
    type: UPDATE_DB_RECORD_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deleteRecordByIdRequest(params: IDeleteRecordById, cb = () => {
}) {
  return {
    type: DELETE_DB_RECORD_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function addRecordToShortList(params: IAddRecordToShortList) {
  return {
    type: ADD_RECORD_TO_SHORT_LIST,
    params,
  }
}

export function setDbRecordState(params: IRecordReducer) {
  return {
    type: SET_DB_RECORD_STATE,
    params,
  }
}

export function mergeDbRecordsRequest(params: IMergeDbRecords, cb = () => {
}) {
  return {
    type: MERGE_DB_RECORD_REQUEST,
    params,
    cb,
  }
}

export function resetRecordsSearchQuery(params: { schemaId: string }) {
  return {
    type: RESET_DB_RECORDS_SEARCH_QUERY,
    params,
  }
}

export function resetRecordsList() {
  return {
    type: RESET_DB_RECORDS_LIST,
  }
}

export function toggleSearchVisibility() {
  return {
    type: TOGGLE_SEARCH_VISIBILITY,
  }
}



