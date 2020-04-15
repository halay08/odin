import { SchemaAssociationEntityTransform } from '../association/transform/schema.association.entity.transform';
import { SchemaColumnEntityTransform } from '../column/transform/schema.column.entity.transform';
import { SchemaEntity } from '../schema.entity';
import { SchemaEntityTransformBase } from './schema.entity.transform.base';

export class SchemaEntityTransform extends SchemaEntityTransformBase {

  public associations?: SchemaAssociationEntityTransform[];
  public properties?: { [key: string]: any };

  /**
   * Transforms a schema
   * @param schema
   */
  public static transform(schema: SchemaEntity): SchemaEntityTransform {


    const transformed = {
      id: schema.id,
      name: schema.name,
      position: schema.position,
      moduleName: schema.moduleName,
      entityName: schema.entityName,
      searchUrl: schema.searchUrl,
      getUrl: schema.getUrl,
      postUrl: schema.postUrl,
      putUrl: schema.putUrl,
      deleteUrl: schema.deleteUrl,
      isHidden: schema.isHidden,
      hasTitle: schema.hasTitle,
      isTitleUnique: schema.isTitleUnique,
      isTitleRequired: schema.isTitleRequired,
      isSequential: schema.isSequential,
      upsertOnCreate: schema.upsertOnCreate,
      assignable: schema.assignable,
      queryable: schema.queryable,
      replicateable: schema.replicateable,
      retrievable: schema.retrievable,
      searchable: schema.searchable,
      triggerable: schema.triggerable,
      undeletable: schema.undeletable,
      updateable: schema.updateable,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      properties: SchemaColumnEntityTransform.transform(schema.columns),
      permissions: [],
    };

    // Add the parsed schema permissions
    if(schema.permissions && schema.permissions.length > 0) {
      const permissions = [];

      for(const permission of schema.permissions) {
        permissions.push(permission.name);
      }

      // @ts-ignore
      transformed.permissions = permissions;
    }

    return transformed;

  }

}
