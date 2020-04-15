import { OrganizationUserGroupEntity } from '../../../../identity/organization/user/group/organization.user.group.entity';
import { SchemaAssociationEntityTransform } from '../../../schema/association/transform/schema.association.entity.transform';
import { SchemaEntity } from '../../../schema/schema.entity';
import { DbRecordAssociationEntity } from '../association/db.record.association.entity';
import { DbRecordAssociationEntityTransform } from '../association/transform/db.record.association.entity.transform';
import { RelationTypeEnum } from '../association/types/db.record.association.constants';
import { DbRecordColumnEntityTransform } from '../column/transform/db.record.column.entity.transform';
import { DbRecordEntity } from '../db.record.entity';
import { DbRecordEntityTransformBase } from './db.record.entity.transform.base';

export class DbRecordEntityTransform extends DbRecordEntityTransformBase {

  public schemaId?: string | null;
  public schemaAssociationId?: string | null;
  public dbRecordAssociation?: DbRecordAssociationEntityTransform | null;
  public relationType?: RelationTypeEnum;
  public properties: { [key: string]: any };
  public groups?: OrganizationUserGroupEntity[];


  [key: string]: any;

  /**
   * Transform a dbRecord
   * @param dbRecord
   * @param schema
   * @param schemaAssociation
   * @param dbRecordAssociation
   */
  public static transform(
    dbRecord: DbRecordEntity,
    schema: SchemaEntity,
    schemaAssociation?: SchemaAssociationEntityTransform,
    dbRecordAssociation?: DbRecordAssociationEntity,
  ): DbRecordEntityTransform {

    let transformed = {
      id: dbRecord.id,
      entity: dbRecord.entity,
      type: dbRecord.type,
      schemaTypeId: dbRecord.schemaTypeId,
      schemaPosition: null,
      schemaId: null,
      schemaAssociationId: null,
      externalId: dbRecord.externalId,
      externalApp: dbRecord.externalApp,
      title: dbRecord.title,
      recordNumber: dbRecord.recordNumber,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
      deletedAt: dbRecord.deletedAt,
      stageUpdatedAt: dbRecord.stageUpdatedAt,
      createdBy: null,
      lastModifiedBy: null,
      ownedBy: null,
      stage: dbRecord.stage,
      properties: {},
      dbRecordAssociation: null,
      groups: dbRecord.groups,
      links: [],
    };

    if(!!dbRecord.lastModifiedBy) {

      transformed = Object.assign({}, transformed, {
        lastModifiedBy: {
          id: dbRecord.lastModifiedBy.id ? dbRecord.lastModifiedBy.id : null,
          fullName: dbRecord.lastModifiedBy.fullName,
        },
      })

    }

    if(dbRecord.childRelations || dbRecord.parentRelations) {

      const parent = dbRecord.parentRelations ? dbRecord.parentRelations.map(record => {
        return { ...record, relation: 'parent' }
      }) : []
      const child = dbRecord.childRelations ? dbRecord.childRelations.map(record => {
        return { ...record, relation: 'child' }
      }) : []

      transformed = Object.assign({}, transformed, {
        links: [ ...parent, ...child ],
      })

    }

    if(!!dbRecord.createdBy) {

      transformed = Object.assign({}, transformed, {
        createdBy: {
          id: dbRecord.createdBy.id ? dbRecord.createdBy.id : null,
          fullName: dbRecord.createdBy.fullName,
        },
      })

    }

    if(!!dbRecord.ownedBy) {

      transformed = Object.assign({}, transformed, {
        ownedBy: {
          id: dbRecord.ownedBy.id ? dbRecord.ownedBy.id : null,
          fullName: dbRecord.ownedBy.fullName,
        },
      })

    }

    if(!!dbRecord.columns) {

      // we want to filter the columns if the record has a schemaTypeId
      const filteredCols = dbRecord.schemaTypeId ? schema.columns.filter(elem => elem.schemaTypeId === dbRecord.schemaTypeId || !elem.schemaTypeId) : schema.columns;

      transformed = Object.assign({}, transformed, {
        properties: DbRecordColumnEntityTransform.transform(dbRecord.columns, filteredCols),
      })

    }

    if(!!schema) {

      transformed = Object.assign({}, transformed, {
        schemaId: schema.id,
        schemaPosition: schema.position,
      })

    }

    if(!!schemaAssociation) {

      transformed = Object.assign({}, transformed, {
        schemaAssociationId: schemaAssociation.id,
      })

    }

    if(!!dbRecordAssociation) {

      transformed = Object.assign({}, transformed, {
        dbRecordAssociation: DbRecordAssociationEntityTransform.transform(dbRecordAssociation),
      })

    }

    return transformed;

  }

}


