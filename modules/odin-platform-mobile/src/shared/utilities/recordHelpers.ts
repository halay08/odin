import { DbRecordAssociationEntityTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.entity.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


export const getRecordListFromShortListById = (
  shortList: { [schemaId: string]: DbRecordEntityTransform[] },
  schemaId: string,
): DbRecordEntityTransform[] => {
  return shortList[schemaId];
};


export const getRecordFromShortListById = (
  shortList: { [recordId: string]: DbRecordEntityTransform },
  recordId: string | null | undefined,
): DbRecordEntityTransform => {
  // @ts-ignore
  return shortList[recordId];
};

export const getRecordRelatedFromShortListById = (
  shortList: { [recordId: string]: any },
  dbRecordAssociationId: string,
  recordId: string,
): DbRecordEntityTransform => {
  return shortList[`${dbRecordAssociationId}_${recordId}`];
};


export const splitModuleAndEntityName = (entity: string) => {

  let moduleName;
  let entityName;
  if(entity) {
    const split = entity.split(':');
    moduleName = split[0];
    entityName = split[1];
  }

  return { moduleName, entityName };
};

export const getModuleAndEntityNameFromRecord = (record: DbRecordEntityTransform) => {

  const split = record.entity.split(':');
  const moduleName = split[0];
  const entityName = split[1];

  return { moduleName, entityName };
};

export const getTabKeyFromBrowserPath = (urlHash: string, tabPane: string, defaultKey?: string) => {
  if(urlHash) {
    if(urlHash.indexOf(tabPane) > -1) {
      return urlHash;
    }
  }

  return defaultKey;
};


export const getBrowserPath = (record: DbRecordEntityTransform) => {
  if(record) {
    return `/${getModuleAndEntityNameFromRecord(record).moduleName}/${getModuleAndEntityNameFromRecord(
      record).entityName}/${record.id}`;
  } else {
    return '';
  }
};


export const getRelatedRecordBrowserPath = (
  record: DbRecordEntityTransform,
  dbRecordAssociation: DbRecordAssociationEntityTransform | null | undefined,
) => {
  return `/${getModuleAndEntityNameFromRecord(record).moduleName}/related/${getModuleAndEntityNameFromRecord(
    record).entityName}/${dbRecordAssociation?.id}/${record.id}`;
}


export const parseParams = (querystring: string) => {

  // parse query string
  const params = new URLSearchParams(querystring);

  const obj = {};

  // iterate over all keys
  // @ts-ignore
  for(const key of params.keys()) {
    if(params.getAll(key).length > 1) {
      // @ts-ignore
      obj[key] = params.getAll(key);
    } else {
      // @ts-ignore
      obj[key] = params.get(key);
    }
  }

  return obj;
};


export const getAllSchemaAssociationEntities = (
  associations: SchemaAssociationEntity[],
  hidden: string[] | undefined,
): string[] => {

  const entityNames = [];
  for(const elem of associations) {
    if(elem.childSchema) {
      if(hidden && !hidden.includes(elem.childSchema.entityName)) {
        entityNames.push(elem.childSchema.entityName);
      } else if(!hidden) {
        entityNames.push(elem.childSchema.entityName);
      }
    } else if(elem.parentSchema) {
      if(hidden && !hidden.includes(elem.parentSchema.entityName)) {
        entityNames.push(elem.parentSchema.entityName);
      } else if(!hidden) {
        entityNames.push(elem.parentSchema.entityName);
      }
    }
  }

  return entityNames;
};


export const getAllSchemaAssociationSchemas = (
  associations?: SchemaAssociationEntity[],
  hidden?: string[] | undefined,
  excludeParentRelations?: boolean,
  excludeChildRelations?: boolean,
): SchemaEntity[] => {

  const schemas: SchemaEntity[] = [];
  const uniqueSchemas = [];

  if(associations) {
    for(const elem of associations) {

      if(elem.childSchema && !excludeChildRelations) {
        if(hidden && !hidden.includes(elem.childSchema.entityName)) {
          schemas.push(elem.childSchema);
        } else if(!hidden) {
          schemas.push(elem.childSchema);
        }
      } else if(elem.parentSchema && !excludeParentRelations) {
        if(hidden && !hidden.includes(elem.parentSchema.entityName)) {
          schemas.push(elem.parentSchema);
        } else if(!hidden) {
          schemas.push(elem.parentSchema);
        }
      }
    }
    // Filter unique schemas
    const flags: { [key: string]: boolean } = {};

    for(const schema of schemas) {
      if(!flags[schema.entityName]) {
        flags[schema.entityName] = true;
        uniqueSchemas.push(schema);
      }
    }
  }

  return uniqueSchemas;

};

