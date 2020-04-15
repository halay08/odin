import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { DbRecordColumnEntity } from '@d19n/models/dist/schema-manager/db/record/column/db.record.column.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, DeleteResult } from 'typeorm';
import { getEntityColumns } from '../../../common/TypeormHelpers';

@Injectable()
export class DbRecordsColumnsRepository {

  private readonly connection: Connection

  constructor(@InjectConnection('default') connection: Connection) {

    this.connection = connection;

  }

  /**
   * This function finds a record by schema and property values
   * @param organization
   * @param schema
   * @param query
   * @param title
   */
  public async getDbRecordIdByOrganizationAndSchemaAndValues(
    organization: OrganizationEntity,
    schema: SchemaEntity,
    query: { id: string, value: string | number }[],
    schemaTypeId: string,
    title?: string,
  ): Promise<{ record_id: string }> {

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {
      if(query.length > 0) {

        const columnsWithValues: any[] = query.filter((elem: any) => ![
          'undefined',
          undefined,
          null,
          'null',
          '',
        ].includes(elem.value));

        // TODO: Replace this query with a SELECT record_id, count(*) FROM db_records_columns WHERE ... add filters
        //  HAVING COUNT(*) = query.length

        const queryTitle = this.connection.createQueryBuilder(DbRecordColumnEntity, 'dbRecordColumn', slaveQueryRunner);
        const queryCols = this.connection.createQueryBuilder(DbRecordColumnEntity, 'dbRecordColumn', slaveQueryRunner);

        const recordHasTitle = !!title && schema.hasTitle && schema.isTitleUnique;

        /**
         * Note: SELECT * and groupBy will not work. error that you need to include id in the group by will
         * be thrown.
         *
         * In order ot use groupBy any other column than the id, you will need to select and include them.
         */
        let matchedRecord = null;
        // add query if the title is present
        let recordIdsMatchingTitle;

        if(recordHasTitle) {

          queryTitle.select('dbRecordColumn.record_id');
          queryTitle.leftJoin('dbRecordColumn.record', 'dbRecord');
          queryTitle.where('dbRecordColumn.organization_id = :organizationId', { organizationId: organization.id });
          queryTitle.andWhere('dbRecordColumn.schema_id = :schemaId', { schemaId: schema.id });
          if(schemaTypeId) {
            queryTitle.andWhere('dbRecordColumn.schema_type_id = :schemaTypeId', { schemaTypeId })
          }
          queryTitle.andWhere('dbRecord.title = :title', { title });
          const resTitle = await queryTitle.getRawMany();

          // if there are multiple records with the same title
          // i.e the user sets isTitleUnique after records are already created
          recordIdsMatchingTitle = resTitle[0] ? resTitle.map(elem => elem.record_id) : undefined
        }

        if(!!columnsWithValues && columnsWithValues.length > 0) {
          queryCols.select('dbRecordColumn.record_id');
          queryCols.where('dbRecordColumn.organization_id = :organizationId', { organizationId: organization.id });

          // add where clause with all recordIds matching on title
          if(recordHasTitle && recordIdsMatchingTitle) {
            queryCols.andWhere('dbRecordColumn.record_id IN (:...recordIds)', { recordIds: recordIdsMatchingTitle });
          }

          // filter columns by schema_type_id if exists
          if(schemaTypeId) {
            // we want to query columns where the records are of the same type
            // this covers the scenario of a global schema column that is UNIQUE we need to filter out all records
            // that are not in this schema type.
            queryCols.andWhere('dbRecordColumn.schema_type_id = :schemaTypeId', { schemaTypeId })

          }
          queryCols.andWhere('dbRecordColumn.schema_id = :schemaId', { schemaId: schema.id });
          queryCols.andWhere(
            `dbRecordColumn.column_id IN (:...columnIds)`,
            { columnIds: columnsWithValues.map(elem => elem.id.toString()) },
          );
          queryCols.andWhere(
            `dbRecordColumn.value IN (:...values)`,
            { values: columnsWithValues.map(elem => elem.value.toString()) },
          );

          const resProperties = await queryCols.getRawMany();

          console.log('resProperties', resProperties);

          const count = {};
          const matchCount = query.length;

          // find the total match count
          for(const record of resProperties) {
            const record_id = record.record_id;
            // stop looping over the ids if we have a match
            if(!count[record_id]) {
              count[record_id] = 1;
            } else {
              count[record_id] += 1;
            }

            if(count[record_id] === matchCount) {
              matchedRecord = record;
            }
          }
        }

        return matchedRecord;
      } else {
        return undefined;
      }

    } catch (e) {

      console.error(e);
      throw new ExceptionType(500, e.message);

    } finally {

      await slaveQueryRunner.release();

    }
  }

  /**
   * This function finds records by schema column and property value
   * @param organization
   * @param schemaColumnId
   * @param values
   */
  public async getDbRecordColumnsByOrganizationAndColumnAndValues(
    organization: OrganizationEntity,
    schemaColumnId: string,
    values: string[],
    schemaTypeId?: string,
  ): Promise<{ record_id: string }[]> {

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {

      if(values.length < 1) {
        throw new ExceptionType(400, 'missing values to query');
      }

      const queryCols = this.connection.createQueryBuilder(DbRecordColumnEntity, 'dbRecordColumn', slaveQueryRunner);
      queryCols.select('record_id');
      queryCols.where('dbRecordColumn.organization_id = :organizationId', { organizationId: organization.id });
      // filter columns by schema_type_id if exists
      if(schemaTypeId) {
        // we want to query columns where the records are of the same type
        // this covers the scenario of a global schema column that is UNIQUE we need to filter out all records
        // that are not in this schema type.
        queryCols.andWhere('dbRecordColumn.schema_type_id = :schemaTypeId', { schemaTypeId })
      }
      queryCols.andWhere('dbRecordColumn.column_id = :columnId', { columnId: schemaColumnId });
      queryCols.andWhere(`dbRecordColumn.value IN (:...values)`, { values: values.map(elem => elem.toString()) });

      return await queryCols.getRawMany();

    } catch (e) {

      console.error(e);
      throw new ExceptionType(500, e.message);

    } finally {

      await slaveQueryRunner.release();

    }
  }

  /**
   *
   * @param {OrganizationEntity} organization
   * @param record
   * @param relations
   */
  public async getColumnsByOrganizationAndRecord(
    organization: OrganizationEntity,
    record: DbRecordEntity,
    relations?: string[],
  ): Promise<DbRecordColumnEntity[]> {

    const slaveQueryRunner = this.connection.createQueryRunner('slave');

    try {

      const columns = await this.connection.query(`
      SELECT ${getEntityColumns(DbRecordColumnEntity, { tableName: 'col' })}
      FROM db_records_columns as col
      WHERE col.organization_id = '${organization.id}' 
      AND col.record_id = '${record.id}' 
      AND col.deleted_at IS NULL;`);

      const parsed: DbRecordColumnEntity[] = [];

      if(columns) {
        for(const col of columns) {
          const dbRecordColumn = new DbRecordColumnEntity();
          dbRecordColumn.id = col.col_id;

          const schemaColumn = new SchemaColumnEntity();
          schemaColumn.id = col.col_column_id;
          schemaColumn.name = col.col_column_name;
          dbRecordColumn.column = schemaColumn;
          dbRecordColumn.value = col.col_value;

          parsed.push(dbRecordColumn);
        }
      }

      return parsed;

    } catch (e) {

      console.error(e);
      throw new ExceptionType(500, e.message);

    } finally {

      await slaveQueryRunner.release();

    }
  }


  /**
   *
   * @param values
   */
  public async createColumn(values: string[]) {

    const creates = await this.connection.query(`
          INSERT INTO db_records_columns (record_id, organization_id, schema_id, column_id, column_name, schema_type_id, value, last_modified_by_id) 
          VALUES ${values} 
          ON CONFLICT (organization_id, record_id, column_id)
          DO NOTHING 
          RETURNING id, column_name, value;
        `);

    return creates;

  }

  /**
   *
   * @param values
   */
  public async updateColumn(values: string[]) {

    const updated = await this.connection.query(`
            UPDATE db_records_columns as t
            SET 
              value = c.value, 
              last_modified_by_id = c.last_modified_by_id::uuid, 
              updated_at = c.updated_at::timestamp
            FROM (VALUES ${values}) 
            AS c(id, value, last_modified_by_id, updated_at)
            WHERE c.id::uuid = t.id::uuid;
        `);

    return updated;

  }


  /**
   *
   * @param {OrganizationEntity} organization
   * @param record
   * @param relations
   */
  public async softDeleteColumnsByRecordId(
    organization: OrganizationEntity,
    recordId: string,
  ): Promise<DeleteResult> {
    try {

      return await this.connection.createQueryBuilder(DbRecordColumnEntity, 'dbRecordColumn')
        .softDelete()
        .from(DbRecordColumnEntity)
        .where('record_id = :recordId', { recordId })
        .execute();

    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }

}
