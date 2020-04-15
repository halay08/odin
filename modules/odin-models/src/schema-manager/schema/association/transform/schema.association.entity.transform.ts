import { RelationTypeEnum } from '../../../db/record/association/types/db.record.association.constants';
import { SchemaEntityTransform } from '../../transform/schema.entity.transform';
import { SchemaAssociationEntity } from '../schema.association.entity';
import { SchemaAssociationEntityTransformBase } from './schema.association.entity.transform.base';

export class SchemaAssociationEntityTransform extends SchemaAssociationEntityTransformBase {

  public relationType?: RelationTypeEnum;
  public childSchema?: SchemaEntityTransform;
  public parentSchema?: SchemaEntityTransform;

  public static transform(schemaAssociation: SchemaAssociationEntity): SchemaAssociationEntityTransform {
    return {
      id: schemaAssociation.id,
      label: schemaAssociation.label,
      type: schemaAssociation.type,
      position: schemaAssociation.position,
      parentActions: schemaAssociation.parentActions,
      childActions: schemaAssociation.childActions,
      hasColumnMappings: schemaAssociation.hasColumnMappings,
      cascadeDeleteChildRecord: schemaAssociation.cascadeDeleteChildRecord,
      findInSchema: schemaAssociation.findInSchema,
      findInChildSchema: schemaAssociation.findInChildSchema,
      getUrl: schemaAssociation.getUrl,
      postUrl: schemaAssociation.postUrl,
      putUrl: schemaAssociation.putUrl,
      deleteUrl: schemaAssociation.deleteUrl,
      createdAt: schemaAssociation.createdAt,
      updatedAt: schemaAssociation.updatedAt,
    };
  }
}
