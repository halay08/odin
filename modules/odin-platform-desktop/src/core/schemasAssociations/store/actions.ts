import { SchemaAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/schema/association/dto/schema.association.create.update.dto';
import {
  CREATE_SCHEMA_ASSOCIATION_REQUEST,
  DELETE_SCHEMA_ASSOCIATION_REQUEST,
  GET_SCHEMA_ASSOCIATIONS_REQUEST,
  UPDATE_SCHEMA_ASSOCIATION_REQUEST,
} from './constants';

// Interfaces
export interface GetAssociationBySchemaId {
  schemaId: string,
}

export interface CreateSchemaAssociation {
  schemaId: string,
  body: SchemaAssociationCreateUpdateDto
}

export interface UpdateSchemaAssociation {
  associationId: string,
  schemaId: string,
  body: SchemaAssociationCreateUpdateDto
}

export interface DeleteSchemaAssociation {
  associationId: string,
  schemaId: string,
}


export function getSchemaAssociationsRequest(params: GetAssociationBySchemaId, cb = () => {
}) {
  return {
    type: GET_SCHEMA_ASSOCIATIONS_REQUEST,
    params,
    cb,
  }
}

export function updateSchemaAssociationRequest(params: UpdateSchemaAssociation, cb = () => {
}) {
  return {
    type: UPDATE_SCHEMA_ASSOCIATION_REQUEST,
    params,
    cb,
  }
}

export function createSchemaAssociationRequest(params: CreateSchemaAssociation, cb = () => {
}) {
  return {
    type: CREATE_SCHEMA_ASSOCIATION_REQUEST,
    params,
    cb,
  }
}

export function deleteSchemaAssociationsRequest(params: DeleteSchemaAssociation, cb = () => {
}) {
  return {
    type: DELETE_SCHEMA_ASSOCIATION_REQUEST,
    params,
    cb,
  }
}
