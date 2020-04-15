import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { DbRecordAssociationColumnEntity } from '@d19n/models/dist/schema-manager/db/record/association-column/db.record.association.column.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { DeleteResult, EntityRepository, Repository } from 'typeorm';
import { getEntityColumns } from '../../../common/TypeormHelpers';

@EntityRepository(DbRecordAssociationColumnEntity)
export class DbRecordAssociationsColumnsRepository extends Repository<DbRecordAssociationColumnEntity> {

  /**
   *
   * @param {OrganizationEntity} organization
   * @param record
   * @param relations
   */
  public async checkIfRelatedColumnsExists(
    organization: OrganizationEntity,
    recordId: string,
    dbRecordAssociationId: string,
  ): Promise<boolean> {
    try {

      const res = await this.query(`
      SELECT id 
      FROM db_records_associations_columns 
      WHERE organization_id = '${organization.id}'
      AND db_record_association_id = '${dbRecordAssociationId}'
      AND record_id = '${recordId}'
      AND deleted_at IS NULL`);

      return res[0] ? true : false;

    } catch (e) {
      throw new ExceptionType(500, e.message);
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
    dbRecordAssociationId: string,
    recordId: string,
    relations?: string[],
  ): Promise<DbRecordAssociationColumnEntity[]> {
    try {

      const columns = await this.query(`
      SELECT ${getEntityColumns(DbRecordAssociationColumnEntity, { tableName: 'col' })}
      FROM db_records_associations_columns as col
      WHERE col.organization_id = '${organization.id}' 
      AND col.record_id = '${recordId}' 
      AND col.db_record_association_id = '${dbRecordAssociationId}' 
      AND col.deleted_at IS NULL;`);

      const parsed: DbRecordAssociationColumnEntity[] = [];

      if(columns) {
        for(const col of columns) {
          const dbRecordColumn = new DbRecordAssociationColumnEntity();
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
      throw new ExceptionType(500, e.message);
    }
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

      return await this.createQueryBuilder()
        .softDelete()
        .from(DbRecordAssociationColumnEntity)
        .where('organization_id = :organizationId', { organizationId: organization.id })
        .andWhere('record_id = :recordId', { recordId })
        .execute();

    } catch (e) {
      throw new ExceptionType(500, e.message);
    }
  }

}
