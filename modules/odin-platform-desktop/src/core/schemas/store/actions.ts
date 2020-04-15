import { SchemaCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/dto/schema.create.update.dto';
import { SchemaTypeCreateDto } from '@d19n/models/dist/schema-manager/schema/types/dto/schema.type.create.dto';
import {
  BATCH_CREATE_SCHEMA_PERMISSIONS_REQUEST,
  BATCH_DELETE_SCHEMA_PERMISSIONS_REQUEST,
  CREATE_SCHEMA_REQUEST,
  CREATE_SCHEMA_TYPE_REQUEST,
  DELETE_SCHEMA_BY_ID_REQUEST,
  DELETE_SCHEMA_TYPE_REQUEST,
  GET_SCHEMA_BY_ID_REQUEST,
  GET_SCHEMA_BY_MODULE_AND_ENTITY_REQUEST,
  GET_SCHEMA_BY_MODULE_REQUEST,
  LIST_SCHEMAS_REQUEST,
  UPDATE_SCHEMA_BY_ID_REQUEST,
} from './constants';
import { SchemaReducerState } from './reducer';

// Interfaces
export interface ISchemaById {
  schemaId: string,
  format?: string,
}

export interface ISchemaByModule {
  moduleName: string,
}

export interface ISchemaByModuleAndEntity {
  moduleName: string,
  entityName: string,
  withAssociations?: boolean,
}

export interface CreateSchema {

  body: SchemaCreateUpdateDto

}

export interface CreateSchemaType {

  schemaId: string,
  body: SchemaTypeCreateDto

}

export interface DeleteSchemaType {

  schemaId: string,
  schemaTypeId: string

}


// Actions

export function udpateSchemaReducerState(params: SchemaReducerState) {
  return {
    type: LIST_SCHEMAS_REQUEST,
  }
}

export function listSchemasRequest() {
  return {
    type: LIST_SCHEMAS_REQUEST,
  }
}

export function getSchemasByModuleRequest(params: ISchemaByModule) {
  return {
    type: GET_SCHEMA_BY_MODULE_REQUEST,
    params,
  }
}

export function getSchemaByModuleAndEntityRequest(params: ISchemaByModuleAndEntity, cb = () => {
}) {
  return {
    type: GET_SCHEMA_BY_MODULE_AND_ENTITY_REQUEST,
    params,
    cb,
  }
}

export function getSchemaByIdRequest(params: ISchemaById, cb = () => {
}) {
  return {
    type: GET_SCHEMA_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function createSchemaRequest(params: CreateSchema, cb = () => {
}) {
  return {
    type: CREATE_SCHEMA_REQUEST,
    params,
    cb,
  }
}


export function updateSchemaRequest(params: any, cb = () => {
}) {
  return {
    type: UPDATE_SCHEMA_BY_ID_REQUEST,
    params,
    cb,
  }
}

export function deleteSchemaById(params: any) {
  return {
    type: DELETE_SCHEMA_BY_ID_REQUEST,
    params,
  }
}

export function batchCreatePermissionsBySchemaId(params: any, cb = () => {
}) {
  return {
    type: BATCH_CREATE_SCHEMA_PERMISSIONS_REQUEST,
    params,
    cb,
  }
}

export function batchDeletePermissionsBySchemaId(params: any, cb = () => {
}) {
  return {
    type: BATCH_DELETE_SCHEMA_PERMISSIONS_REQUEST,
    params,
    cb,
  }
}


// Schema Types
export function createSchemaTypeRequest(params: CreateSchemaType) {
  return {
    type: CREATE_SCHEMA_TYPE_REQUEST,
    params,
  }
}

export function deleteSchemaTypeRequest(params: DeleteSchemaType) {
  return {
    type: DELETE_SCHEMA_TYPE_REQUEST,
    params,
  }
}
