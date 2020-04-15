import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { DbRecordAssociationColumnEntity } from '@d19n/models/dist/schema-manager/db/record/association-column/db.record.association.column.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Injectable } from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { LogsUserActivityService } from '../../../logs/user-activity/logs.user.activity.service';
import { SchemasColumnsService } from '../../../schemas/columns/schemas.columns.service';
import { IMethodOptions } from '../../interfaces/interfaces';
import { DbRecordAssociationsColumnsRepository } from './db.records.associations.columns.repository';
import { DbRecordsAssociationsColumnsServiceHelpers } from './db.records.associations.columns.service.helpers';

@Injectable()
export class DbRecordsAssociationsColumnsService {

  private dbRecordAssociationsColumnsRepository: DbRecordAssociationsColumnsRepository;
  protected logsUserActivityService: LogsUserActivityService;
  protected schemasColumnsService: SchemasColumnsService;

  private dbRecordsAssociationsColumnsHelpers: DbRecordsAssociationsColumnsServiceHelpers;

  public constructor(
    dbRecordAssociationsColumnsRepository: DbRecordAssociationsColumnsRepository,
    logsUserActivityService: LogsUserActivityService,
    schemasColumnsService: SchemasColumnsService,
  ) {

    this.dbRecordAssociationsColumnsRepository = dbRecordAssociationsColumnsRepository;
    this.logsUserActivityService = logsUserActivityService;
    this.schemasColumnsService = schemasColumnsService;

    this.dbRecordsAssociationsColumnsHelpers = new DbRecordsAssociationsColumnsServiceHelpers();

  }

  /**
   *
   * @param organization
   * @param record
   * @param dbRecordAssociation
   * @protected
   */
  protected async hasRelatedColumns(
    organization: OrganizationEntity,
    record: DbRecordEntity,
    dbRecordAssociation: DbRecordAssociationEntity,
  ): Promise<boolean> {
    try {

      if(record && dbRecordAssociation) {

        return this.dbRecordAssociationsColumnsRepository.checkIfRelatedColumnsExists(
          organization,
          record.id,
          dbRecordAssociation.id,
        );

      } else {

        return false;

      }

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   *
   * @param principal
   * @param dbRecordAssociation
   * @param record
   * @param schema
   * @param body
   */
  protected async updateOrCreateDbRecordAssociationColumns(
    principal: OrganizationUserEntity,
    dbRecordAssociation: DbRecordAssociationEntity,
    record: DbRecordEntity,
    schema: SchemaEntity,
    body: DbRecordAssociationCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<DbRecordAssociationColumnEntity[]> {
    try {

      const trace = tracer.startSpan(
        'constructColumnsToCreate',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      // Get existing records columns
      // Get record schema columns
      const {
        dbRecordColumns,
        schemaColumns,
      }: { dbRecordColumns: DbRecordAssociationColumnEntity[], schemaColumns: SchemaColumnEntity[] } = await Promise.all(
        [
          this.getDbRecordColumnsByOrganizationAndId(principal.organization, dbRecordAssociation, record),
          this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(principal.organization, schema.id),
        ]).then(res => ({
        dbRecordColumns: res[0],
        schemaColumns: res[1],
      }));

      // we want to filter the columns if the record has a schemaTypeId
      const filteredCols = record.schemaTypeId ? schemaColumns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId) : schemaColumns;

      const { columnsToUpdate, columnsToCreate } = this.dbRecordsAssociationsColumnsHelpers.constructColumnsForDatabaseEntry(
        principal,
        record,
        dbRecordAssociation,
        schema,
        body,
        dbRecordColumns,
        filteredCols,
        { tracerParent: trace },
      );

      // Save the record columns
      return await Promise.all([
        this.saveRecordColumnsAndLogRevision(
          principal,
          columnsToUpdate,
          LogsConstants.DB_RECORD_ASSOCIATION_COLUMN_UPDATED,
        ),
        this.saveRecordColumnsAndLogRevision(
          principal,
          columnsToCreate,
          LogsConstants.DB_RECORD_ASSOCIATION_COLUMN_CREATED,
        ),
      ]).then(res => [ ...res[0], ...res[1] ]);


    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   *
   * @param principal
   * @param columns
   * @param eventType
   */
  private async saveRecordColumnsAndLogRevision(
    principal: OrganizationUserEntity,
    columns: DbRecordAssociationColumnEntity[],
    eventType: LogsConstants,
  ): Promise<DbRecordAssociationColumnEntity[]> {
    try {
      if(columns.length > 0) {
        const res = await this.dbRecordAssociationsColumnsRepository.save(columns);

        for(const item of res) {
          await this.logsUserActivityService.createByPrincipal(
            principal,
            item.id,
            { [item.column.name]: item.value },
            eventType,
          );
        }
        return res;
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param dbRecordAssociation
   * @param record
   * @param relations
   */
  protected async getDbRecordColumnsByOrganizationAndId(
    organization: OrganizationEntity,
    dbRecordAssociation: DbRecordAssociationEntity,
    record: DbRecordEntity,
    relations?: string[],
  ): Promise<DbRecordAssociationColumnEntity[]> {
    try {

      if(dbRecordAssociation && record) {

        return await this.dbRecordAssociationsColumnsRepository.getColumnsByOrganizationAndRecord(
          organization,
          dbRecordAssociation.id,
          record.id,
          relations,
        );

      }

      return;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(
        500,
        `error retrieving records associated columns for record id ${record ? record.id : undefined} and association id ${dbRecordAssociation ? dbRecordAssociation.id : undefined}`,
      )
    }
  }

  /**
   *
   * @param principal
   * @param recordId
   */
  protected async softDeleteAssociationColumnsByRecordId(
    principal: OrganizationUserEntity,
    recordId: string,
  ): Promise<DeleteResult> {
    return await this.dbRecordAssociationsColumnsRepository.softDeleteColumnsByRecordId(
      principal.organization,
      recordId,
    );
  }
}
