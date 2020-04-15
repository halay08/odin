import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { OrganizationUserGroupEntity } from '@d19n/models/dist/identity/organization/user/group/organization.user.group.entity';
import { DbRecordColumnEntity } from '@d19n/models/dist/schema-manager/db/record/column/db.record.column.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, DeleteResult, In } from 'typeorm';
import { getEntityColumns } from '../../common/TypeormHelpers';

@Injectable()
export class DbRecordsRepository {


  private readonly connection: Connection

  constructor(@InjectConnection('default') connection: Connection) {

    this.connection = connection;

  }

  /**
   *
   * @param organization
   * @param recordIds
   */
  public async getManyByOrganizationAndIds(
    principal: OrganizationEntity|OrganizationUserEntity,
    recordIds: string[],
  ): Promise<DbRecordEntity[]> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
    }

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {

      const q = this.connection.createQueryBuilder(DbRecordEntity, 'dbRecord', slaveQueryRunner);
      q.select('dbRecord.id, dbRecord.schema_id');
      q.where('dbRecord.organization_id = :organizationId', { organizationId: organization.id });
      q.andWhere('dbRecord.id IN (:...values)', { values: recordIds });
      q.andWhere('dbRecord.deleted_at IS NULL')
      if(principal instanceof OrganizationUserEntity){
        if(principal.groups?.length){
          const groupsArray = principal.groups.map(group => group.id)
          const groupsString =groupsArray.join('\', \'')
          q.andWhere(`dbRecord.id NOT IN (select record_id
            FROM db_records_groups AS link
            GROUP BY record_id)
            OR dbRecord.id IN (select record_id
            FROM db_records_groups AS link
            WHERE link.group_id IN ('${groupsString}')
            GROUP BY record_id)`)
        } else {
          q.andWhere(`dbRecord.id NOT IN (select record_id
            FROM db_records_groups AS link
            GROUP BY record_id)`)
        }
      }

      const res = await q.getRawMany();

      return res;

    } finally {

      await slaveQueryRunner.release();

    }
  }


  /**
   * @param principal
   * @param recordId
   * @param relations
   */
  public async getDbRecordByOrganizationAndExternalId(
    principal: OrganizationEntity|OrganizationUserEntity,
    externalId: string,
  ): Promise<DbRecordEntity> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
    }

    let query = `SELECT 
    ${getEntityColumns(DbRecordEntity, { tableName: 'record' })},
    ${getEntityColumns(OrganizationUserEntity, { tableName: 'modifier' })},
    ${getEntityColumns(OrganizationUserEntity, { tableName: 'creator' })},
    ${getEntityColumns(OrganizationUserEntity, { tableName: 'owner' })},
    ${getEntityColumns(PipelineStageEntity, { tableName: 'stage' })},
    e.groups
    FROM db_records as record 
    LEFT JOIN organizations_users as modifier ON (modifier.id = record.last_modified_by_id) 
    LEFT JOIN organizations_users as creator ON (creator.id = record.created_by_id) 
    LEFT JOIN organizations_users as owner ON (owner.id = record.owned_by_id) 
    LEFT JOIN pipelines_stages as stage ON (stage.id = record.stage_id) 
    LEFT JOIN LATERAL (
      SELECT json_agg(json_build_object('id', oug.id, 'name', oug.name)) as groups
      from db_records_groups drg
      LEFT JOIN organizations_users_groups oug on drg.group_id = oug.id
      WHERE drg.record_id = record.id
      ) as e on true
    WHERE record.organization_id = '${organization.id}'   
    AND record.external_id = '${externalId}'
    AND record.deleted_at IS NULL`



    query= this.addCheckGroupsQuery({principal, query})

    const res = await this.connection.query(query);

    let dbRecord: DbRecordEntity = undefined;

    if(res[0]) {

      dbRecord = this.dbRecordEntityFromRawSQL(res[0]);

    }

    return dbRecord;
  }

  /**
   * @param organization
   * @param recordId
   * @param relations
   */
  public async getDbRecordByOrganizationAndId(
    principal: OrganizationEntity|OrganizationUserEntity,
    recordId: string,
  ): Promise<DbRecordEntity> {
    let organization=principal
    if(principal instanceof OrganizationUserEntity){
      organization = principal.organization
    }

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {
      let query =`SELECT
      ${this.DbRecordSelect()},
      record.id,
      b.columns,
      c.parent_relations,
      d.child_relations,
      e.groups
      FROM db_records as record
      LEFT JOIN organizations_users as modifier ON (modifier.id = record.last_modified_by_id)
      LEFT JOIN organizations_users as creator ON (creator.id = record.created_by_id)
      LEFT JOIN organizations_users as owner ON (owner.id = record.owned_by_id)
      LEFT JOIN pipelines_stages as stage ON (stage.id = record.stage_id)
      LEFT JOIN LATERAL(
        SELECT json_agg(
          json_build_object(
          'col_id', col.id,
          'col_column_id', col.column_id,
          'col_column_name', col.column_name,
          'col_value', col.value,
          'col_schema_type_id', col.schema_type_id
          )
      ) AS columns
        FROM db_records_columns as col
        WHERE col.organization_id = '${organization.id}'
        AND col.deleted_at IS NULL
        AND CASE WHEN
        record.schema_type_id IS NOT NULL
        THEN
        col.record_id = record.id
        AND (col.schema_type_id = record.schema_type_id OR col.schema_type_id IS NULL)
        ELSE
        col.schema_type_id IS NULL
        END
        AND col.record_id = record.id
      ) AS b ON true
      LEFT JOIN LATERAL(
        SELECT json_agg(
           json_build_object(
          'id', r.id,
          'title', r.title,
          'record_number', r.record_number, 
          'entity', r.entity,
          'type', r.type
          )
      ) AS parent_relations
        FROM db_records_associations as aso
        LEFT JOIN db_records r on (aso.parent_record_id = r.id)
        WHERE aso.organization_id = '${organization.id}'
        AND aso.deleted_at IS NULL
        AND aso.child_record_id = record.id
      ) AS c on true
      LEFT JOIN LATERAL(
        SELECT json_agg(
          json_build_object(
          'id', r.id,
          'title', r.title,
          'record_number', r.record_number, 
          'entity', r.entity,
          'type', r.type
          )
      ) AS child_relations
        FROM db_records_associations as aso
        LEFT JOIN db_records r on (aso.child_record_id = r.id)
        WHERE aso.organization_id = '${organization.id}'
        AND aso.deleted_at IS NULL
        AND aso.parent_record_id = record.id
      ) AS d on true
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('id', oug.id, 'name', oug.name)) as groups
        from db_records_groups drg
                 LEFT JOIN organizations_users_groups oug on drg.group_id = oug.id
        WHERE drg.record_id = record.id
        ) as e on true
      WHERE record.organization_id = '${organization.id}'
      AND record.id = '${recordId}'
      AND record.deleted_at IS NULL
      `
      query= this.addCheckGroupsQuery({principal, query})

      const res = await this.connection.query( query , null, slaveQueryRunner)

      let dbRecord: DbRecordEntity = undefined;

      if(res[0]) {

        dbRecord = this.dbRecordEntityFromRawSQL(res[0]);

      }

      return dbRecord;

    } finally {

      await slaveQueryRunner.release();

    }

  }


  /**
   * @param principal
   * @param recordId
   * @param relations
   */
  public async getDeletedDbRecordByOrganizationAndId(
    principal: OrganizationEntity|OrganizationUserEntity,
    recordId: string,
  ): Promise<DbRecordEntity> {

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {
      let organization=principal
      if(principal instanceof OrganizationUserEntity){
        organization = principal.organization
      }

      let query =`SELECT 
      ${this.DbRecordSelect()},
      json_agg(
        json_build_object(
          'col_id', b.col_id, 
          'col_column_id', b.col_column_id,
          'col_column_name', b.col_column_name,
          'col_value', b.col_value,
          'col_schema_type_id', b.col_schema_type_id
        )
      ) AS columns,
      CASE
        WHEN e.record_id IS NULL THEN NULL
        ELSE    json_agg(json_build_object('id', e.record_id, 'name', e.name)) END as groups
      FROM db_records as record 
      LEFT JOIN organizations_users as modifier ON (modifier.id = record.last_modified_by_id) 
      LEFT JOIN organizations_users as creator ON (creator.id = record.created_by_id) 
      LEFT JOIN organizations_users as owner ON (owner.id = record.owned_by_id) 
      LEFT JOIN pipelines_stages as stage ON (stage.id = record.stage_id) 
      LEFT JOIN LATERAL( 
        SELECT ${getEntityColumns(DbRecordColumnEntity, { tableName: 'col' })}
        FROM db_records_columns as col
        WHERE col.organization_id = '${organization.id}' 
        AND col.deleted_at IS NOT NULL
        AND CASE WHEN 
          record.schema_type_id IS NOT NULL
        THEN 
          col.record_id = record.id  
          AND (col.schema_type_id = record.schema_type_id OR col.schema_type_id IS NULL)
        ELSE
          col.schema_type_id IS NULL
        END
      ) AS b ON (b.col_record_id = record.id)
      LEFT JOIN LATERAL (SELECT drg.record_id as record_id, oug.name as name      
        from db_records_groups drg
        LEFT JOIN organizations_users_groups oug on drg.group_id = oug.id           
        ) AS e ON (e.record_id = record.id)
      WHERE record.organization_id = '${organization.id}'
      AND record.id = '${recordId}'
      AND record.deleted_at IS NOT NULL 
      `

      query= this.addCheckGroupsQuery({principal, query})

      query += `GROUP BY ${this.dbRecordGroupBy()}, e.record_id`

      const res = await this.connection.query(query, null, slaveQueryRunner);

      let dbRecord: DbRecordEntity = undefined;

      if(res[0]) {

        dbRecord = this.dbRecordEntityFromRawSQL(res[0]);

      }

      return dbRecord;

    } finally {

      await slaveQueryRunner.release();

    }

  }


  /**
   *
   * @param principal
   * @param recordIds
   * @param relations
   */
  public async getManyDbRecordsByOrganizationsAndIds(
    principal: OrganizationEntity|OrganizationUserEntity,
    recordIds: string[],
  ): Promise<DbRecordEntity[]> {

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {
      let organization=principal
      if(principal instanceof OrganizationUserEntity){
        organization = principal.organization
      }

      if(recordIds.length > 0) {

        let query = `SELECT 
        ${this.DbRecordSelect()},
        json_agg(
          json_build_object(
            'col_id', b.col_id, 
            'col_column_id', b.col_column_id,
            'col_column_name', b.col_column_name,
            'col_value', b.col_value,
            'col_schema_type_id', b.col_schema_type_id
          )
        ) AS columns,
        CASE
            WHEN e.record_id IS NULL THEN NULL
            ELSE    json_agg(json_build_object('id', e.record_id, 'name', e.name)) END as groups
        FROM db_records as record 
        LEFT JOIN organizations_users as modifier ON (modifier.id = record.last_modified_by_id) 
        LEFT JOIN organizations_users as creator ON (creator.id = record.created_by_id) 
        LEFT JOIN organizations_users as owner ON (owner.id = record.owned_by_id) 
        LEFT JOIN pipelines_stages as stage ON (stage.id = record.stage_id) 
        LEFT JOIN LATERAL( 
          SELECT ${getEntityColumns(DbRecordColumnEntity, { tableName: 'col' })}
          FROM db_records_columns as col
          WHERE col.organization_id = '${organization.id}' 
          AND col.deleted_at IS NULL
          AND CASE WHEN 
            record.schema_type_id IS NOT NULL
          THEN 
            col.record_id = record.id  
            AND (col.schema_type_id = record.schema_type_id OR col.schema_type_id IS NULL)
          ELSE
            col.schema_type_id IS NULL
          END
        ) AS b ON (b.col_record_id = record.id)
        LEFT JOIN LATERAL (SELECT drg.record_id as record_id, oug.name as name      
          from db_records_groups drg
          LEFT JOIN organizations_users_groups oug on drg.group_id = oug.id           
          ) AS e ON (e.record_id = record.id)
        WHERE record.organization_id = '${organization.id}'
        AND record.id IN (${recordIds.map(elem => `'${elem}'`).join()})
        AND record.deleted_at IS NULL
        `

        query= this.addCheckGroupsQuery({principal, query})

        query += `GROUP BY ${this.dbRecordGroupBy()}, e.record_id
        ORDER BY record.created_at DESC`

        const res = await this.connection.query(query, null, slaveQueryRunner);

        const dbRecords: DbRecordEntity[] = [];

        if(res[0]) {

          for(const rec of res) {

            const dbRecord = this.dbRecordEntityFromRawSQL(rec);
            dbRecords.push(dbRecord);

          }
        }

        return dbRecords;

      } else {
        return undefined;
      }

    } finally {

      await slaveQueryRunner.release();

    }
  }

  /**
   *
   * @param principal
   * @param schema
   * @param schemaTypeId
   * @param title
   */
  public async findBySchemaAndTitle(
    principal: OrganizationEntity|OrganizationUserEntity,
    schema: SchemaEntity,
    schemaTypeId: string,
    title: string,
  ) {

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {

      let organization=principal
      if(principal instanceof OrganizationUserEntity){
        organization = principal.organization
      }
      let query

      if(schemaTypeId) {
        query=`
        SELECT title, id, 
        e.groups
        FROM db_records
        LEFT JOIN LATERAL (
          SELECT json_agg(json_build_object('id', oug.id, 'name', oug.name)) as groups
          from db_records_groups drg
          LEFT JOIN organizations_users_groups oug on drg.group_id = oug.id
          WHERE drg.record_id = db_records.id
          ) as e on true
        WHERE organization_id = '${organization.id}'
        AND deleted_at IS NULL
        AND schema_id = '${schema.id}'
        AND schema_type_id = '${schemaTypeId}'
        AND title = '${title}'`
      } else {
        query=`
        SELECT title, id,
        e.groups
        FROM db_records
        LEFT JOIN LATERAL (
          SELECT json_agg(json_build_object('id', oug.id, 'name', oug.name)) as groups
          from db_records_groups drg
          LEFT JOIN organizations_users_groups oug on drg.group_id = oug.id
          WHERE drg.record_id = db_records.id
          ) as e on true
        WHERE organization_id = '${organization.id}'
        AND deleted_at IS NULL
        AND schema_id = '${schema.id}'
        AND title = '${title}'`
      }

      query= this.addCheckGroupsQuery({principal, query, recordName:'db_records'})

      return await this.connection.query(
        query, null, slaveQueryRunner)

    } finally {

      await slaveQueryRunner.release();

    }
  }

  /**
   * @param organization
   * @param id
   */
  public async softDelete(
    organization: OrganizationEntity,
    id: string,
  ): Promise<DeleteResult> {

    const masterQueryRunner = this.connection.createQueryRunner('master');

    try {

      return await this.connection
        .createQueryBuilder(masterQueryRunner)
        .softDelete()
        .from(DbRecordEntity)
        .where('organization_id = :organizationId', { organizationId: organization.id })
        .andWhere('id = :id', { id })
        .execute();

    } finally {

      await masterQueryRunner.release();

    }

  }

  /**
   *
   * @param organization
   * @param id
   */
  public async hardDelete(organization: OrganizationEntity, id: string) {
    const masterQueryRunner = this.connection.createQueryRunner('master');

    try {

      return await this.connection
        .createQueryBuilder(masterQueryRunner)
        .delete()
        .from(DbRecordEntity, 'dbRecord')
        .where('dbRecord.id = :id', { id })
        .andWhere('dbRecord.organization_id = :organizationId', { organizationId: organization.id })
        .execute();

    } finally {

      await masterQueryRunner.release();

    }
  }


  /**
   * Save records to the database
   * @param dbRecord
   */
  public async persist(dbRecord: DbRecordEntity): Promise<DbRecordEntity> {

    const masterQueryRunner = this.connection.createQueryRunner('master');

    try {

      delete dbRecord.childRelations;
      delete dbRecord.parentRelations;
      delete dbRecord.columns;
      

      return await this.connection.createEntityManager(masterQueryRunner).save(dbRecord);

    } finally {

      await masterQueryRunner.release();

    }
  }

  /**
   * Find user groups for dbRecord
   *
   * @public
   * @param {[]} linksArray
   * @return {*}  {Promise<OrganizationUserGroupEntity[]>}
   * @memberof DbRecordsRepository
   */
  public async findM2MLinks(linksArray: any[]): Promise<OrganizationUserGroupEntity[]> {
    const repository=this.connection.getRepository(OrganizationUserGroupEntity)
    const relations = await repository.find({where:{id:In(linksArray)}})
    return relations
  }


  /**
   * Constructs the SQL SELECT query when fetching data from the database
   * @constructor
   * @protected
   */
  protected DbRecordSelect() {

    const recordCols = getEntityColumns(
      DbRecordEntity,
      {
        tableName: 'record',
        columns: [
          'id',
          'external_id',
          'schema_id',
          'schema_type_id',
          'type',
          'entity',
          'record_number',
          'title',
          'created_at',
          'updated_at',
          'deleted_at',
          'stage_updated_at',
        ],
      },
    )

    const modifierCols = getEntityColumns(
      OrganizationUserEntity,
      { tableName: 'modifier', columns: [ 'id', 'firstname', 'lastname' ] },
    )

    const creatorCols = getEntityColumns(
      OrganizationUserEntity,
      { tableName: 'creator', columns: [ 'id', 'firstname', 'lastname' ] },
    )

    const ownerCols = getEntityColumns(
      OrganizationUserEntity,
      { tableName: 'owner', columns: [ 'id', 'firstname', 'lastname' ] },
    )

    const stageCols = getEntityColumns(
      PipelineStageEntity,
      { tableName: 'stage', columns: [ 'id', 'name', 'key', 'position', 'is_success', 'is_fail', 'is_default' ] },
    )

    return `${recordCols}, ${modifierCols}, ${creatorCols}, ${ownerCols}, ${stageCols}`
  }

  protected dbRecordGroupBy() {

    const recordGroupCols = 'record.id, record.external_id, record.schema_id, record.schema_type_id, record.type, record.entity, record.record_number, record.title, record.created_at, record.updated_at, record.stage_updated_at, record.deleted_at'
    const modifierGroupCols = 'modifier.id, modifier.firstname, modifier.lastname'
    const creatorGroupCols = 'creator.id, creator.firstname, creator.lastname'
    const ownerGroupCols = 'owner.id, owner.firstname, owner.lastname'
    const stageGroupCols = 'stage.id, stage.name, stage.key, stage.position, stage.is_success, stage.is_fail, stage.is_default'

    return `${recordGroupCols}, ${modifierGroupCols}, ${creatorGroupCols}, ${ownerGroupCols}, ${stageGroupCols}`
  }

  /**
   * constructs a dbRecord from raw sql
   * @param data
   * @private
   */
  private dbRecordEntityFromRawSQL(data: any) {

    const dbRecord = new DbRecordEntity();
    dbRecord.id = data.record_id;
    dbRecord.externalId = data.record_external_id;
    dbRecord.schemaId = data.record_schema_id;
    dbRecord.schemaTypeId = data.record_schema_type_id;
    dbRecord.type = data.record_type;
    dbRecord.entity = data.record_entity;
    dbRecord.recordNumber = data.record_record_number;
    dbRecord.title = data.record_title;
    dbRecord.createdAt = data.record_created_at;
    dbRecord.updatedAt = data.record_updated_at;
    dbRecord.deletedAt = data.record_deleted_at;
    dbRecord.stageUpdatedAt = data.record_stage_updated_at;
    dbRecord.childRelations = data.child_relations;
    dbRecord.parentRelations = data.parent_relations;
    dbRecord.groups = data.groups;

    let modifier: OrganizationUserEntity = undefined;
    if(data.modifier_id) {

      modifier = new OrganizationUserEntity();
      modifier.id = data.modifier_id;
      modifier.firstname = data.modifier_firstname;
      modifier.lastname = data.modifier_lastname;

    }

    dbRecord.lastModifiedBy = modifier;

    let creator: OrganizationUserEntity = undefined;
    if(data.creator_id) {

      creator = new OrganizationUserEntity();
      creator.id = data.creator_id;
      creator.firstname = data.creator_firstname;
      creator.lastname = data.creator_lastname;

    }

    dbRecord.createdBy = creator;

    let owner: OrganizationUserEntity = undefined;
    if(data.owner_id) {

      owner = new OrganizationUserEntity();
      owner.id = data.owner_id;
      owner.firstname = data.owner_firstname;
      owner.lastname = data.owner_lastname;

    }

    dbRecord.ownedBy = owner;


    let stage: PipelineStageEntity = undefined;
    if(data.stage_id) {

      stage = new PipelineStageEntity();
      stage.id = data.stage_id;
      stage.name = data.stage_name;
      stage.key = data.stage_key;
      stage.position = data.stage_position;
      stage.isSuccess = data.stage_is_success;
      stage.isFail = data.stage_is_fail;
      stage.isDefault = data.stage_is_default;

    }

    dbRecord.stage = stage;

    // set the default columns to an empty array
    dbRecord.columns;

    if(data.columns) {
      const parsedCols = [];

      for(const col of data.columns) {

        const dbRecordColumn = new DbRecordColumnEntity();
        dbRecordColumn.id = col.col_id;

        const schemaColumn = new SchemaColumnEntity();
        schemaColumn.id = col.col_column_id;
        schemaColumn.schemaTypeId = col.col_schema_type_id;
        schemaColumn.name = col.col_column_name;

        dbRecordColumn.column = schemaColumn;
        dbRecordColumn.value = col.col_value;

        parsedCols.push(dbRecordColumn);

      }

      dbRecord.columns = parsedCols;

    }

    return dbRecord;

  }



  /**
   * Add sql query to check dbRecord user groups to existing query
   *
   * @protected
   * @param {{principal: OrganizationUserEntity, query: string, recordName: string}} {principal, query, recordName='record'}
   * @return {*}  {string}
   * @memberof DbRecordsRepository
   */
  protected addCheckGroupsQuery({principal, query, recordName='record'}: {principal: OrganizationEntity|OrganizationUserEntity, query: string, recordName?: string}): string{
    if(principal instanceof OrganizationUserEntity){
      if(principal.groups?.length){
        const groupsArray = principal.groups.map(group => group.id)
        const groupsString =groupsArray.join('\', \'')
        query += ` AND (${recordName}.id NOT IN (select record_id
          FROM db_records_groups AS link
          GROUP BY record_id)
          OR ${recordName}.id IN (select record_id
          FROM db_records_groups AS link
          WHERE link.group_id IN ('${groupsString}')
          GROUP BY record_id))`
      } else {
        query += ` AND (${recordName}.id NOT IN (select record_id
          FROM db_records_groups AS link
          GROUP BY record_id))`
      }
    }
    return query
  }

}
