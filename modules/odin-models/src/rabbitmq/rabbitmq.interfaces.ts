import { OrganizationAppTypes } from '../identity/organization/app/organization.app.types';
import { OrganizationUserEntity } from '../identity/organization/user/organization.user.entity';
import { LogsConstants } from '../logs/logs.constants';
import { SendgridEmailEntity } from '../notifications/sendgrid/email/sendgrid.email.entity';
import { DbRecordAssociationEntity } from '../schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '../schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordCreateUpdateDto } from '../schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaColumnOptionRaw } from '../schema-manager/schema/column/option/interfaces/schema.column.option.raw.interface';
import { SchemaColumnEntity } from '../schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '../schema-manager/schema/schema.entity';

// Schema Manager DB Records
export interface IDbRecordUpdated {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  id: string,
  body: DbRecordCreateUpdateDto
}

export interface IDbRecordCreated {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  id: string,
  body: DbRecordCreateUpdateDto
}

export interface IDbRecordDeleted {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  id: string,
  affected: number,
}

export interface IDbRecordOwnerAssigned {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  owner: OrganizationUserEntity,
  id: string,
  schema: SchemaEntity,
}

export interface IDbRecordAssociationCreated {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  dbRecordAssociation: DbRecordAssociationEntity,
}

export interface IDbRecordAssociationUpdated {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  dbRecordAssociation: DbRecordAssociationEntity,
}

export interface ICreatedDbRecordAssociations {
  principal: OrganizationUserEntity,
  id: string,
  body: DbRecordAssociationCreateUpdateDto[]
}

export interface IDbRecordAssociationDeleted {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  dbRecordAssociation: DbRecordAssociationEntity,
  affected: number,
}

export interface IGetSchemaById {
  principal: OrganizationUserEntity,
  schemaId: string
}

// Schema Manager Schemas

export interface SchemaColumnCreated {
  event: LogsConstants,
  principal: OrganizationUserEntity,
  schema: SchemaEntity,
  schemaColumn: SchemaColumnEntity
}

export interface SchemaColumnUpdated {

  event: LogsConstants,
  principal: OrganizationUserEntity,
  schema: SchemaEntity,
  schemaColumn: SchemaColumnEntity

}

export interface SchemaColumnDeleted {

  event: LogsConstants,
  principal: OrganizationUserEntity,
  schema: SchemaEntity,
  schemaColumn: SchemaColumnEntity

}

export interface SchemaColumnOptionModified {
  principal: OrganizationUserEntity,
  schema: SchemaEntity,
  schemaColumn: SchemaColumnEntity,
  updateResults: SchemaColumnOptionRaw[],
  createResults: SchemaColumnOptionRaw[],
  deleteResults: SchemaColumnOptionRaw[]
}

// Identity Module
export interface IGetOrganizationAppByName {
  principal: OrganizationUserEntity,
  name: OrganizationAppTypes,
}

export interface IGetOrganizationUserById {
  principal: OrganizationUserEntity,
  id: string,
}

// Notification Module
export interface IGetEmailTemplateByLabel {
  principal: OrganizationUserEntity,
  label: OrganizationAppTypes,
}

export interface ISendDynamicEmail {
  principal: OrganizationUserEntity,
  body: SendgridEmailEntity,
}

// Field service Module
export interface ICancelWorkOrderById {
  principal: OrganizationUserEntity,
  workOrderId: string,
}

// Order Module
export interface ICreateOrderItems {
  principal: OrganizationUserEntity,
  orderId: string,
  body: DbRecordAssociationCreateUpdateDto[]
}

// Search

export interface IIndexDbRecords {
  principal: OrganizationUserEntity,
  body: {
    id: string,
    schemaId: string,
  }[]
}




