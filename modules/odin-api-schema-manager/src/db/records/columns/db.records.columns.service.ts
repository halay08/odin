import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { LogsConstants } from '@d19n/models/dist/logs/logs.constants';
import { DbRecordColumnEntity } from '@d19n/models/dist/schema-manager/db/record/column/db.record.column.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import moment from 'moment';
import { DeleteResult } from 'typeorm';
import { LogsUserActivityService } from '../../../logs/user-activity/logs.user.activity.service';
import { SchemasColumnsService } from '../../../schemas/columns/schemas.columns.service';
import { IMethodOptions } from '../../interfaces/interfaces';
import { DbRecordsColumnsRepository } from './db.records.columns.repository';
import { DbRecordsColumnsServiceHelpers } from './db.records.columns.service.helpers';

@Injectable()
export class DbRecordsColumnsService {

  protected logsUserActivityService: LogsUserActivityService;
  protected schemasColumnsService: SchemasColumnsService;
  protected dbRecordsColumnsRepository: DbRecordsColumnsRepository;

  private dbRecordsColumnsHelpers: DbRecordsColumnsServiceHelpers;

  public constructor(
    dbRecordsColumnsRepository: DbRecordsColumnsRepository,
    @Inject(forwardRef(() => LogsUserActivityService)) logsUserActivityService: LogsUserActivityService,
    @Inject(forwardRef(() => SchemasColumnsService)) schemasColumnsService: SchemasColumnsService,
  ) {

    this.dbRecordsColumnsRepository = dbRecordsColumnsRepository;
    this.logsUserActivityService = logsUserActivityService;
    this.schemasColumnsService = schemasColumnsService;

    this.dbRecordsColumnsHelpers = new DbRecordsColumnsServiceHelpers();


  }


  /**
   * Used for validating the request body before creating a dbRecord
   *
   * @ticket ODN-1251
   * @author ftruglio
   *
   * @param principal
   * @param schemaId
   * @param schemaTypeId
   * @param body
   * @param options
   * @protected
   */
  protected async validateBodyPropertiesBeforeDbRecordCreate(
    principal: OrganizationUserEntity,
    schemaId: string,
    schemaTypeId: string,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ) {

    const trace = tracer.startSpan(
      'validateBodyPropertiesBeforeDbRecordCreate',
      { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
    )

    const schemaColumns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
      principal.organization,
      schemaId,
      { tracerParent: trace },
    );

    // records that have required properties cannot be created without those properties
    this.dbRecordsColumnsHelpers.validateAllRequiredPropertiesExist(body, schemaColumns, schemaTypeId);

    // we want to filter the columns if the record has a schemaTypeId
    const filteredCols = schemaTypeId ? schemaColumns.filter(elem => elem.schemaTypeId === schemaTypeId || !elem.schemaTypeId) : schemaColumns;

    // records can be created without any properties if all properties are optional
    if(!!body.properties) {
      for(const property in Object.keys(body.properties)) {

        const schemaColumn: SchemaColumnEntity = filteredCols.find(column => column.name == property);

        if(schemaColumn) {

          this.dbRecordsColumnsHelpers.validateAndSanitizeColumnValue(
            body.properties,
            schemaColumn,
            property,
            false,
          );

        }
      }

    }


  }

  /**
   *
   * @param organization
   * @param params
   * @param options
   */
  protected async getDbRecordColumnsByOrganizationAndId(
    organization: OrganizationEntity,
    params: {
      record: DbRecordEntity,
    },
    options?: IMethodOptions,
  ): Promise<DbRecordColumnEntity[]> {

    try {

      const trace = await tracer.startSpan(
        'getDbRecordColumnsByOrganizationAndId',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const res = await this.dbRecordsColumnsRepository.getColumnsByOrganizationAndRecord(organization, params.record);

      trace.finish();

      return res;

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param organization
   * @param schema
   * @param query
   * @param schemaTypeId
   * @param title
   */
  public _getDbRecordBySchemaAndValues(
    organization: OrganizationEntity,
    schema: SchemaEntity,
    query: any,
    schemaTypeId: string,
    title?: string,
  ): Promise<{ record_id: string }> {
    try {

      return this.dbRecordsColumnsRepository.getDbRecordIdByOrganizationAndSchemaAndValues(
        organization,
        schema,
        query,
        schemaTypeId,
        title,
      );

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param organization
   * @param schemaColumnId
   * @param values
   */
  protected getDbRecordColumnsByOrganizationAndColumnAndValues(
    organization: OrganizationEntity,
    schemaColumnId: string,
    values: string[],
    schemaTypeId?: string,
  ): Promise<{ record_id: string }[]> {
    try {
      return this.dbRecordsColumnsRepository.getDbRecordColumnsByOrganizationAndColumnAndValues(
        organization,
        schemaColumnId,
        values,
        schemaTypeId,
      );
    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }


  /**
   *
   * @param principal
   * @param record
   * @param schema
   * @param body
   * @param options
   */
  protected async updateOrCreateDbRecordColumns(
    principal: OrganizationUserEntity,
    record: DbRecordEntity,
    schema: SchemaEntity,
    body: DbRecordCreateUpdateDto,
    options?: IMethodOptions,
  ): Promise<DbRecordColumnEntity[]> {
    try {
      const trace = await tracer.startSpan(
        'updateOrCreateDbRecordColumns',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const dbRecordColumns = await this.getDbRecordColumnsByOrganizationAndId(
        principal.organization,
        { record },
        { tracerParent: trace },
      );

      const schemaColumns = await this.schemasColumnsService.getSchemaColumnsByOrganizationAndSchemaId(
        principal.organization,
        schema.id,
        { tracerParent: trace },
      );

      // we want to filter the columns if the record has a schemaTypeId
      const filteredCols = record.schemaTypeId ? schemaColumns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId) : schemaColumns;

      const { columnsToUpdate, columnsToCreate } = this.dbRecordsColumnsHelpers.constructColumnsForDatabaseEntry(
        principal,
        record,
        schema,
        body,
        dbRecordColumns,
        filteredCols,
        { tracerParent: trace },
      );

      const colsUpdated = await this.updateRecordColumns(
        principal,
        columnsToUpdate,
        LogsConstants.DB_RECORD_COLUMN_UPDATED,
        { tracerParent: trace },
      );

      const colsCreated = await this.createRecordColumns(
        principal,
        columnsToCreate,
        LogsConstants.DB_RECORD_COLUMN_CREATED,
        { tracerParent: trace },
      );

      trace.finish();

      return [ ...colsUpdated, ...colsCreated ];

    } catch (e) {
      throw new ExceptionType(e.statusCode, e.message, e.validation, e.data);
    }
  }

  /**
   *
   * @param principal
   * @param columns
   * @param eventType
   */
  private async updateRecordColumns(
    principal: OrganizationUserEntity,
    columns: DbRecordColumnEntity[],
    eventType: LogsConstants,
    options?: IMethodOptions,
  ): Promise<DbRecordColumnEntity[]> {
    try {

      if(columns.length > 0) {

        const trace = await tracer.startSpan(
          'updateRecordColumns',
          { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
        );

        const values = [];
        for(const col of columns) {

          if(!!col.value) {

            values.push(`('${col.id}', '${col.value}', '${col.lastModifiedBy.id}', '${moment().utc().toISOString()}')`);

          } else {

            values.push(`('${col.id}', NULL, '${col.lastModifiedBy.id}', '${moment().utc().toISOString()}')`);

          }

        }

        const updated = await this.dbRecordsColumnsRepository.updateColumn(values);

        const items = [];
        if(updated[1]) {

          for(const item of columns) {
            items.push({ recordId: item.id, revision: { [item.columnName]: item.value } });
          }

          this.logsUserActivityService.batchCreate(principal, items, eventType);
        }

        trace.finish();
        return items;

      } else {
        return [];
      }
    } catch (e) {

      throw new ExceptionType(e.statusCode, e.message, e.validation);

    }
  }

  /**
   *
   * @param principal
   * @param columns
   * @param eventType
   */
  private async createRecordColumns(
    principal: OrganizationUserEntity,
    columns: DbRecordColumnEntity[],
    eventType: LogsConstants,
    options?: IMethodOptions,
  ): Promise<DbRecordColumnEntity[]> {
    try {

      if(columns.length > 0) {

        const trace = await tracer.startSpan(
          'createRecordColumns',
          { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
        );


        const values = [];

        for(const col of columns) {

          if(!!col.value) {
            values.push(`('${col.recordId}', '${col.organizationId}', '${col.schemaId}', '${col.column.id}', '${col.columnName}', ${col.schemaTypeId ? `'${col.schemaTypeId}'` : null}, '${col.value}', '${col.lastModifiedBy.id}')`);
          }

        }

        // only run the insert if there are values to store
        if(values.length > 0) {

          const creates = await this.dbRecordsColumnsRepository.createColumn(values);

          const items = [];
          for(const item of creates) {
            items.push({ recordId: item.id, revision: { [item.column_name]: item.value } });
          }

          this.logsUserActivityService.batchCreate(principal, items, eventType);

          trace.finish();
          return creates;

        } else {

          return [];

        }

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
   * @param record
   * @param relations
   */
  protected async softDeleteColumnsByRecordId(
    principal: OrganizationUserEntity,
    recordId: string,
  ): Promise<DeleteResult> {
    return await this.dbRecordsColumnsRepository.softDeleteColumnsByRecordId(principal.organization, recordId);
  }
}
