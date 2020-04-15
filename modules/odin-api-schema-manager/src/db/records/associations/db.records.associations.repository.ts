import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DeleteResult, EntityRepository, Repository } from 'typeorm';
import { getEntityColumns } from '../../../common/TypeormHelpers';
import { IsJsonString } from '../../../helpers/ValidateDBRecordColumnValues';
import {
  IGetDbRecordAssociationChildRecordIds,
  IGetDbRecordAssociationParentRecordIds,
  IGetRelatedRecordsFiltered,
  IMethodOptions,
} from '../../interfaces/interfaces';


@EntityRepository(DbRecordAssociationEntity)
export class DbRecordsAssociationsRepository extends Repository<DbRecordAssociationEntity> {

  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getRelatedParentRecordIdsFiltered(
    organization: OrganizationEntity,
    params: IGetRelatedRecordsFiltered,
    options?: IMethodOptions,
  ) {
    const trace = await tracer.startSpan(
      'getRelatedParentRecordIdsFiltered',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    );

    const { recordId, entities, filters } = params;

    const { entityNames, colNames, colValues, schemaTypes } = this.parseParamsToQueryFilters(filters, entities);

    // TODO: If schemaAssociation.hasColumnMappings = true we want to only filter the db_records_associations_columns
    // otherwise we can get mixed results when contextually we only care about properties in that association

    const res = await this.query(`
      SELECT 
        DISTINCT(db_records_columns.record_id)
      FROM db_records_columns
               LEFT JOIN schemas_types on (schemas_types.id = db_records_columns.schema_type_id)
      WHERE EXISTS(
              SELECT
              FROM db_records_associations AS relation
                       LEFT JOIN schemas on (schemas.id = relation.parent_schema_id)
              WHERE relation.organization_id = '${organization.id}'
                AND relation.parent_record_id IN (db_records_columns.record_id)
                AND relation.child_record_id = '${recordId}'
                AND relation.deleted_at IS NULL
                AND schemas.entity_name IN (${entityNames})
          )
      AND db_records_columns.organization_id = '${organization.id}'
      AND db_records_columns.deleted_at IS NULL
      ${colNames ?
      `
       AND db_records_columns.column_name IN (${colNames})
       AND db_records_columns.value IN (${colValues})
      ` : ''}
      ${schemaTypes ?
      `
       AND schemas_types.name IN (${schemaTypes})
      ` : ''}
      UNION
      SELECT 
        DISTINCT(db_records_associations_columns.record_id)
      FROM db_records_associations_columns
              LEFT JOIN schemas_types on (schemas_types.id = db_records_associations_columns.schema_type_id)
      WHERE EXISTS(
              SELECT
              FROM db_records_associations AS relation
                       LEFT JOIN schemas on (schemas.id = relation.parent_schema_id)
              WHERE relation.organization_id = '${organization.id}'
                AND relation.parent_record_id IN (db_records_associations_columns.record_id)
                AND relation.child_record_id = '${recordId}'
                AND relation.deleted_at IS NULL
                AND schemas.entity_name IN (${entityNames})
                AND (
                      relation.id = db_records_associations_columns.db_record_association_id
                      OR relation.related_association_id = db_records_associations_columns.db_record_association_id
                  )
          )
      AND db_records_associations_columns.organization_id = '${organization.id}'
      AND db_records_associations_columns.deleted_at IS NULL
       ${colNames ?
      `
       AND db_records_associations_columns.column_name IN (${colNames})
       AND db_records_associations_columns.value IN (${colValues})
      ` : ''}
        ${schemaTypes ?
      `
       AND schemas_types.name IN (${schemaTypes})
      ` : ''}
     `);


    // which means the same child_record might have the value match for a different relationship
    trace.finish();

    return res ? res.map(elem => elem.record_id) : [];
  }


  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  public async getRelatedChildRecordIdsFiltered(
    organization: OrganizationEntity,
    params: IGetRelatedRecordsFiltered,
    options?: IMethodOptions,
  ) {

    const trace = await tracer.startSpan(
      'getRelatedChildRecordIdsFiltered',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    );

    const { recordId, entities, filters } = params;

    const { entityNames, colNames, colValues, schemaTypes } = this.parseParamsToQueryFilters(filters, entities);

    // TODO: If schemaAssociation.hasColumnMappings = true we want to only filter the db_records_associations_columns
    // otherwise we can get mixed results when contextually we only care about properties in that association

    const res = await this.query(`
    SELECT 
      DISTINCT(db_records_columns.record_id)
    FROM db_records_columns
          LEFT JOIN schemas_types on (schemas_types.id = db_records_columns.schema_type_id)
    WHERE EXISTS (
      SELECT FROM db_records_associations AS relation
          LEFT JOIN schemas on (schemas.id = relation.child_schema_id)
      WHERE relation.organization_id = '${organization.id}'
      AND relation.parent_record_id = '${recordId}'
      AND relation.child_record_id IN (db_records_columns.record_id)
      AND relation.deleted_at IS NULL
      AND schemas.entity_name IN (${entityNames})
    )
    AND db_records_columns.organization_id = '${organization.id}'
    AND db_records_columns.deleted_at IS NULL
    ${colNames ?
      `
     AND db_records_columns.column_name IN (${colNames})
     AND db_records_columns.value IN (${colValues})
    ` : ''}
    ${schemaTypes ?
      `
     AND schemas_types.name IN (${schemaTypes})
    ` : ''}
    UNION
    SELECT 
      DISTINCT(db_records_associations_columns.record_id)
    FROM db_records_associations_columns
         LEFT JOIN schemas_types on (schemas_types.id = db_records_associations_columns.schema_type_id)
    WHERE EXISTS (
      SELECT FROM db_records_associations AS relation
         LEFT JOIN schemas on (schemas.id = relation.child_schema_id)
      WHERE relation.organization_id = '${organization.id}'
      AND relation.parent_record_id = '${recordId}'
      AND relation.child_record_id IN (db_records_associations_columns.record_id)
      AND relation.deleted_at IS NULL
      AND schemas.entity_name IN (${entityNames})
      AND (
        relation.id = db_records_associations_columns.db_record_association_id 
        OR relation.related_association_id = db_records_associations_columns.db_record_association_id
      )
    )
    AND db_records_associations_columns.organization_id = '${organization.id}'
    AND db_records_associations_columns.deleted_at IS NULL
     ${colNames ?
      `
     AND db_records_associations_columns.column_name IN (${colNames})
     AND db_records_associations_columns.value IN (${colValues})
    ` : ''}
      ${schemaTypes ?
      `
     AND schemas_types.name IN (${schemaTypes})
    ` : ''}
   `);

    trace.finish();

    console.log('res', res);

    return res ? res.map(elem => elem.record_id) : [];
  }


  /**
   *
   * @param filters
   * @param entities
   * @param entityNames
   * @param colNames
   * @param colValues
   * @private
   */
  private parseParamsToQueryFilters(
    filters: string[],
    entities: string[],
  ): { entityNames: string[], colNames: string[], colValues: string[], schemaTypes: string[] } {

    const schemaTypes = [];
    const entityNames = [];
    const colNames = [];
    const colValues = [];

    // Parse filters
    let parsedFilters = filters;
    if(typeof filters === 'string') {

      if(!IsJsonString(filters)) {
        throw new ExceptionType(400, 'filters is not valid JSON');
      }

      parsedFilters = filters ? JSON.parse(filters) : [];

    }

    for(const filter of parsedFilters) {

      const split = filter.split(':');

      const queryProperty = split[0];
      const queryValue = split[1];

      if(queryProperty === 'SchemaType') {

        schemaTypes.push(`'${queryValue}'`);

      } else {

        colNames.push(`'${queryProperty}'`);
        colValues.push(`'${queryValue}'`);

      }

    }

    // Parse entities
    let parseEntities = entities;
    if(typeof entities === 'string') {

      if(!IsJsonString(entities)) {
        throw new ExceptionType(400, 'filters is not valid JSON');
      }

      parseEntities = entities ? JSON.parse(entities) : [];

    }

    for(const entity of parseEntities) {
      entityNames.push(`'${entity}'`);
    }


    return {
      entityNames: entityNames.length > 0 ? entityNames : null,
      colNames: colNames.length > 0 ? colNames : null,
      colValues: colValues.length > 0 ? colValues : null,
      schemaTypes: schemaTypes.length > 0 ? schemaTypes : null,
    };

  }

  /**
   *
   * @param organization
   * @param parentRecordId
   * @param childRecordId
   */
  public async getByParentRecordIdAndChildRecordId(
    organization: OrganizationEntity,
    parentRecordId: string,
    childRecordId: string,
  ) {

    const res = await this.query(`
    SELECT ${getEntityColumns(DbRecordAssociationEntity)}
    FROM db_records_associations
    WHERE organization_id = '${organization.id}'
    AND parent_record_id = '${parentRecordId}'
    AND child_record_id = '${childRecordId}'
    AND deleted_at IS NULL;
    `);

    let dbRecordAssociation: DbRecordAssociationEntity = undefined;

    if(res[0]) {
      dbRecordAssociation = new DbRecordAssociationEntity();
      dbRecordAssociation.id = res[0].id;
      dbRecordAssociation.childRecordId = res[0].child_record_id;
      dbRecordAssociation.childSchemaId = res[0].child_schema_id;
      dbRecordAssociation.parentEntity = res[0].parent_entity;
      dbRecordAssociation.parentRecordId = res[0].parent_record_id;
      dbRecordAssociation.parentSchemaId = res[0].parent_schema_id;
      dbRecordAssociation.childEntity = res[0].child_entity;
      dbRecordAssociation.relatedAssociationId = res[0].related_association_id;

    }

    return dbRecordAssociation;

  }


  /**
   getManyDbRecordsByOrganizationsAndIds*
   * @param organization
   * @param id
   */
  public async getByOrganizationAndIdWithRelations(
    organization: OrganizationEntity,
    id: string,
    options?: { [key: string]: any },
  ): Promise<DbRecordAssociationEntity> {
    return this.findOne({
      where: { organization, id },
      relations: [
        'parentSchema',
        'childSchema',
        'parentRecord',
        'childRecord',
        'relatedAssociation',
      ],
      ...options,
    });
  }

  /**
   *
   * @param organization
   * @param id
   */
  public async getByOrganizationAndId(
    organization: OrganizationEntity,
    id: string,
  ): Promise<DbRecordAssociationEntity> {

    const res = await this.query(`
    SELECT ${getEntityColumns(DbRecordAssociationEntity)}
    FROM db_records_associations
    WHERE organization_id = '${organization.id}'
    AND id = '${id}'
    AND deleted_at IS NULL;
    `);

    let dbRecordAssociation: DbRecordAssociationEntity = undefined;

    if(res[0]) {
      dbRecordAssociation = new DbRecordAssociationEntity();
      dbRecordAssociation.id = res[0].id;
      dbRecordAssociation.childRecordId = res[0].child_record_id;
      dbRecordAssociation.childSchemaId = res[0].child_schema_id;
      dbRecordAssociation.parentEntity = res[0].parent_entity;
      dbRecordAssociation.parentRecordId = res[0].parent_record_id;
      dbRecordAssociation.parentSchemaId = res[0].parent_schema_id;
      dbRecordAssociation.childEntity = res[0].child_entity;
      dbRecordAssociation.relatedAssociationId = res[0].related_association_id;

    }

    return dbRecordAssociation;
  }

  /**
   *
   * @param organization
   * @param dbRecordAssociationId
   */
  public deleteByPrincipalAndAssociationId(
    organization: OrganizationEntity,
    dbRecordAssociationId: string,
  ): Promise<DeleteResult> {

    return this.createQueryBuilder()
      .softDelete()
      .from(DbRecordAssociationEntity)
      .where({ organization, id: dbRecordAssociationId })
      .execute();
  }


  /**
   *
   * @param organization
   * @param parentRecord
   * @param childRecord
   */
  public deleteByOrganizationAndSourceRecordAndTargetRecord(
    organization: OrganizationEntity,
    parentRecord: DbRecordEntity,
    childRecord: DbRecordEntity,
  ): Promise<DeleteResult> {

    return this.createQueryBuilder()
      .softDelete()
      .from(DbRecordAssociationEntity)
      .where({ organization, parentRecord, childRecord })
      .execute();
  }

  /**
   *
   * @param organization
   * @param parentRecord
   * @param id
   */
  public deleteByPrincipalAndId(
    organization: OrganizationEntity,
    parentRecord: DbRecordEntity,
    id: string,
  ): Promise<DeleteResult> {

    return this.createQueryBuilder()
      .softDelete()
      .from(DbRecordAssociationEntity)
      .where({ organization, parentRecord, id })
      .execute();
  }

  // ODN-595 refactor
  /**
   * Returns all child record ids from a parent recordId and child schema id
   * @param organization
   * @param params
   * @param options
   */
  public async getChildRecordIdsByOrganizationRecordIdAndChildSchemaId(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationChildRecordIds,
    options?: IMethodOptions,
  ): Promise<any> {

    const { recordId, recordIds, childSchemaId } = params;

    const q = this.createQueryBuilder();
    q.select('child_record_id');
    q.where('organization_id = :organizationId', { organizationId: organization.id });
    // add find all ids IN the array of ids if recordIds param exists
    if(recordIds) {
      q.andWhere('parent_record_id IN (:...recordIds)', { recordIds: recordIds.map(elem => elem.toString()) });
    } else {
      q.andWhere('parent_record_id = :recordId::uuid', { recordId: recordId.toString() });
    }
    q.andWhere('child_schema_id = :childSchemaId::uuid', { childSchemaId: childSchemaId.toString() });
    q.limit(50);
    // to handle soft delete querying
    if(options) {
      if(!options['withDeleted']) {
        q.andWhere('deleted_at IS NULL', undefined);
      } else {
        q.withDeleted();
      }
    } else {
      q.andWhere('deleted_at IS NULL', undefined);
    }

    const res = await q.getRawMany();

    const resIds: string[] = [];

    if(res && res.length > 0) {
      res.map(elem => {
        resIds.push(elem.child_record_id);
      })
    }

    return resIds;
  }

  /**
   * Returns all parent record ids from a child recordId and parent schema id
   * @param organization
   * @param params
   * @param options
   */
  public async getParentRecordIdsByOrganizationRecordIdAndParentSchemaId(
    organization: OrganizationEntity,
    params: IGetDbRecordAssociationParentRecordIds,
    options?: IMethodOptions,
  ): Promise<any> {

    const { recordId, recordIds, parentSchemaId, relatedAssociationId } = params;

    const q = this.createQueryBuilder();
    q.select('parent_record_id');
    q.where('organization_id = :organizationId', { organizationId: organization.id });
    // add find all ids IN the array of ids if recordIds param exists
    if(recordIds) {
      q.andWhere('child_record_id IN (:...recordIds)', { recordIds: recordIds.map(elem => elem.toString()) });
    } else {
      q.andWhere('child_record_id = :recordId::uuid', { recordId: recordId.toString() });
    }
    q.andWhere('parent_schema_id = :parentSchemaId::uuid', { parentSchemaId: parentSchemaId.toString() });
    q.limit(50);
    // handle querying only associations related to the record & another association
    // example: PriceBook > Product has distinct properties for the product.
    // We want to only see parent relationships that are related to the product and related association
    if(relatedAssociationId) {
      // we check for a match on the id and related_association_id because the root relationship is the id of the
      // parent i.e: PriceBook > Product the db_record_association.id of the association is the
      // related_association_id of all future association created between the Product from the PriceBook. only
      // required when traversing up the tree
      q.andWhere(`:relatedAssociationId IN (id, related_association_id)`, { relatedAssociationId });
    }
    // to handle soft delete querying
    if(options) {

      if(!options['withDeleted']) {

        q.andWhere('deleted_at IS NULL', undefined);

      } else {

        q.withDeleted();

      }

    } else {
      q.andWhere('deleted_at IS NULL', undefined);
    }

    const res = await q.getRawMany();

    const resIds: string[] = [];

    if(res && res.length > 0) {
      res.map(elem => {
        resIds.push(elem.parent_record_id);
      })
    }

    return resIds;

  }

}
