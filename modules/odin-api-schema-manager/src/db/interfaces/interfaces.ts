import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationEntityTransform } from '@d19n/models/dist/schema-manager/schema/association/transform/schema.association.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';

export interface IMethodOptions {
  tracerParent?: any,
  withDeleted?: boolean
}

export interface IGetDbRecordAssociationBySchema {
  recordId: string,
  findInSchema: string,
  findInChildSchema: string
}

export interface IGetRelatedRecordsFiltered {
  recordId: string,
  entities: string[],
  filters?: string[],
}

export interface IGetDbRecordAssociation {
  recordId: string,
  entities?: string[],
  dbRecordAssociationId?: string,
  filters?: string[],
  associations?: SchemaAssociationEntity[],
}


export interface IGetDbRecordByExternalIdParams {
  externalId: string,
}

export interface IGetDbRecordByIdParams {
  recordId: string,
}

export interface IGetDbRecordAssociationChildRecordIds {
  recordId: string,
  recordIds?: string[],
  childSchemaId: string,
  relatedAssociationId: string,
}

export interface IGetDbRecordAssociationParentRecordIds {
  recordId: string,
  recordIds?: string[],
  parentSchemaId: string,
  relatedAssociationId: string,
}

export interface IUpdateDbRecordAssociation {
  dbRecordAssociationId: string,
  recordId: string,
  body: DbRecordAssociationCreateUpdateDto,
}


export interface IGetRecordsWithColumnMappingParams {
  recordId: string,
  relatedRecords: DbRecordEntity[],
  schema: SchemaEntity,
  schemaAssociation: SchemaAssociationEntityTransform,
}

export interface IListRecordsFromNestedAssociation {
  recordId: string,
  findInSchema: string,
  findInChildSchema: string
}

export interface IGetSchemaByIdParams {
  schemaId: string,
}

export interface IGetManyRecordsByIdsParams {
  recordIds: string[],
}

export interface ICreateDbRecordAssociations {
  recordId: string,
  body: DbRecordAssociationCreateUpdateDto[],
}

export interface IAddAssociationColumnParams {
  dbRecordAssociation: DbRecordAssociationEntity,
  transformed: DbRecordEntityTransform,
  record: DbRecordEntity,
}

export interface IGetDbRecordAssociation {
  recordId: string,
  entities?: string[],
  dbRecordAssociationId?: string,
  filters?: string[],
}

export interface IGetDbRecordAssociationByContext {
  sourceRecordId: string,
  targetRecord: DbRecordEntity,
  isParentCtx: boolean,
}

export interface IMergeColumnsWithAssociationMappingParams {
  dbRecordAssociation: DbRecordAssociationEntity,
  record: DbRecordEntity,
  transformed: DbRecordEntityTransform,
}
