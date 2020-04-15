export enum DbRecordAssociationConstants {
  GET_CHILD_RELATIONS = "GET_CHILD_RELATIONS",
  GET_PARENT_RELATIONS = "GET_PARENT_RELATIONS"
}

export const DbRecordAssociationLookupKeys = Object.keys(DbRecordAssociationConstants);

// enums for accessing association properties
export enum RelationTypeEnum {
  PARENT = 'parent',
  CHILD = 'child',
}

// enums for accessing association properties
export enum SchemaTypeEnum {
  PARENT_SCHEMA = 'parentSchema',
  CHILD_SCHEMA = 'childSchema',
}

export enum RecordTypeEnum {
  PARENT_RECORD = 'parentRecord',
  CHILD_RECORD = 'childRecord',
}


