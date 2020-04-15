import { SchemaColumnCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/column/dto/schema.column.create.update.dto';
import {
  CREATE_SCHEMA_COLUMN_PERMISSIONS_REQUEST,
  CREATE_SCHEMA_COLUMN_REQUEST,
  DELETE_SCHEMA_COLUMN_PERMISSIONS_REQUEST,
  DELETE_SCHEMA_COLUMN_REQUEST,
  GET_SCHEMA_COLUMN_REQUEST,
  REMOVE_SCHEMA_COLUMN_OPTION,
  UPDATE_SCHEMA_COLUMN_PROPERTIES,
  UPDATE_SCHEMA_COLUMN_REDUCER,
  UPDATE_SCHEMA_COLUMN_REQUEST,
} from './constants';

// Interfaces
export interface GetSchemaColumnById {

  schemaId: string,
  schemaColumnId: string,

}

export interface CreateSchemaColumn {

  schemaId: string,
  body: SchemaColumnCreateUpdateDto

}

export interface UpdateSchemaColumn {

  schemaId: string,
  schemaColumnId: string,
  body: SchemaColumnCreateUpdateDto

}

export interface DeleteSchemaColumn {

  schemaId: string,
  schemaColumnId: string,

}

export function updateSchemaColumnProperties(params: any) {
  return {
    type: UPDATE_SCHEMA_COLUMN_PROPERTIES,
    params,
  }
}

export function updateSchemaColumnReducer(params: any) {
  return {
    type: UPDATE_SCHEMA_COLUMN_REDUCER,
    params,
  }
}

export function removeSchemaColumnOption(params: any) {
  return {
    type: REMOVE_SCHEMA_COLUMN_OPTION,
    params,
  }
}

export function getSchemaColumnByIdRequest(params: GetSchemaColumnById, cb = () => {
}) {
  return {
    type: GET_SCHEMA_COLUMN_REQUEST,
    params,
    cb,
  }
}

export function createSchemaColumnRequest(params: CreateSchemaColumn, cb = () => {
}) {
  return {
    type: CREATE_SCHEMA_COLUMN_REQUEST,
    params,
    cb,
  }
}

export function updateSchemaColumnRequest(params: UpdateSchemaColumn, cb = () => {
}) {
  return {
    type: UPDATE_SCHEMA_COLUMN_REQUEST,
    params,
    cb,
  }
}

export function deleteSchemaColumnRequest(params: DeleteSchemaColumn, cb = () => {
}) {
  return {
    type: DELETE_SCHEMA_COLUMN_REQUEST,
    params,
    cb,
  }
}

export function createSchemaColumnPermissionsRequest(params: any, cb = () => {
}) {
  return {
    type: CREATE_SCHEMA_COLUMN_PERMISSIONS_REQUEST,
    params,
    cb,
  }
}

export function deleteSchemaColumnPermissionsRequest(params: any, cb = () => {
}) {
  return {
    type: DELETE_SCHEMA_COLUMN_PERMISSIONS_REQUEST,
    params,
    cb,
  }
}
