import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import {
  DB_RECORD_ASSOCIATIONS_ADD_TO_SELECTED,
  DB_RECORD_ASSOCIATIONS_CREATE_REQUEST,
  DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST,
  DELETE_DB_RECORD_ASSOCIATION_BY_ID_REQUEST,
  GET_DB_RECORD_ASSOCIATION_BY_ID_REQUEST,
  GET_DB_RECORD_ASSOCIATIONS_REQUEST,
  SEARCH_DB_RECORD_ASSOCIATIONS_REQUEST,
} from './constants';

export interface IGetRecordAssociations {
  recordId: string,
  schema: SchemaEntity,
  entities: string[],
  filters?: string[],
  key?: string,
}

export interface IDeleteRecordAssociation {
  schema: SchemaEntity,
  schemaAssociation: SchemaAssociationEntity,
  dbRecordAssociationId: string,
}

export interface ICreateOrUpdateRecordAssociation {
  recordId: string,
  schema: SchemaEntity,
  schemaAssociation: SchemaAssociationEntity,
  createUpdate: DbRecordAssociationCreateUpdateDto[]
}

export interface IGetRecordAssociationById {
  recordId: string,
  dbRecordAssociationId: string,
  schema: SchemaEntity,
}

export interface IUpdateRelatedRecordAssociation {
  recordId: string,
  dbRecordAssociationId: string,
  schema: SchemaEntity,
  schemaAssociation?: SchemaAssociationEntity,
  createUpdate: DbRecordAssociationCreateUpdateDto
}

export interface ISearchRecordAssociations {
  recordId: string,
  schema: SchemaEntity,
  schemaAssociation: SchemaAssociationEntity,
  recordType: string,
  searchQuery: SearchQueryType
}

export function searchRecordAssociationsRequest(params: ISearchRecordAssociations,
) {
  return {
    type: SEARCH_DB_RECORD_ASSOCIATIONS_REQUEST,
    params,
  }
}

export function updateOrCreateRecordAssociations(params: ICreateOrUpdateRecordAssociation, cb = () => {
}) {
  return {
    type: DB_RECORD_ASSOCIATIONS_CREATE_REQUEST, params, cb,
  }
}

export function updateRecordAssociationRequest(params: IUpdateRelatedRecordAssociation, cb = () => {
}) {
  return {
    type: DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST, params, cb,
  }
}

export function getRecordAssociationByIdRequest(params: IGetRecordAssociationById, cb = () => {
}) {
  return {
    type: GET_DB_RECORD_ASSOCIATION_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function getRecordAssociationsRequest(params: IGetRecordAssociations, cb = () => {
}) {
  return {
    type: GET_DB_RECORD_ASSOCIATIONS_REQUEST,
    params,
    cb,
  }
}

export function deleteRecordAssociationById(params: IDeleteRecordAssociation, cb?: () => {}) {
  return {
    type: DELETE_DB_RECORD_ASSOCIATION_BY_ID_REQUEST,
    params,
    cb,
  }
}

export const addIdToSelectedItems = (recordId: string) => {
  return {
    type: DB_RECORD_ASSOCIATIONS_ADD_TO_SELECTED,
    recordId,
  }
};



