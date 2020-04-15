import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { tracer } from '@d19n/common/dist/logging/Tracer';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordAssociationColumnEntity } from '@d19n/models/dist/schema-manager/db/record/association-column/db.record.association.column.entity';
import { DbRecordAssociationEntity } from '@d19n/models/dist/schema-manager/db/record/association/db.record.association.entity';
import { DbRecordColumnEntity } from '@d19n/models/dist/schema-manager/db/record/column/db.record.column.entity';
import { DbRecordEntity } from '@d19n/models/dist/schema-manager/db/record/db.record.entity';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Injectable } from '@nestjs/common';
import chalk from 'chalk';
import { ColumnValueUtilities } from '../../../helpers/ColumnValueUtilities';
import { ValidateDBRecordColumnValues } from '../../../helpers/ValidateDBRecordColumnValues';
import { IMethodOptions } from '../../interfaces/interfaces';

@Injectable()
export class DbRecordsAssociationsColumnsServiceHelpers {

  public constructor() {

  }

  /**
   * this function returns an array of columns to update and an array of columns to create
   * this is based on a check for existing columns by id and whether the value being passed
   * in is different than the one we already have stored
   * the difference is returned
   *
   * @param principal
   * @param record
   * @param dbRecordAssociation
   * @param schema
   * @param body
   * @param dbRecordColumns
   * @param schemaColumns
   * @param options
   */
  public constructColumnsForDatabaseEntry(
    principal: OrganizationUserEntity,
    record: DbRecordEntity,
    dbRecordAssociation: DbRecordAssociationEntity,
    schema: SchemaEntity,
    body,
    dbRecordColumns,
    schemaColumns,
    options?: IMethodOptions,
  ): { columnsToUpdate: DbRecordAssociationColumnEntity[], columnsToCreate: DbRecordAssociationColumnEntity[] } {
    try {

      const trace = tracer.startSpan(
        'constructColumnsToCreate',
        { childOf: options && options.tracerParent ? options.tracerParent.context() : undefined },
      );

      const columnsToCreate: DbRecordAssociationColumnEntity[] = [];
      const columnsToUpdate: DbRecordAssociationColumnEntity[] = [];

      // Return an array of properties that have changed
      const { modifiedValues } = this.getModifiedProperties(
        dbRecordColumns,
        schemaColumns,
        body,
      );

      // we want to filter the columns if the record has a schemaTypeId
      const filteredCols = record.schemaTypeId ? schemaColumns.filter(elem => elem.schemaTypeId === record.schemaTypeId || !elem.schemaTypeId) : schemaColumns;

      for(let property in modifiedValues) {

        const schemaColumn: SchemaColumnEntity = filteredCols.find(column => column.name == property);

        if(schemaColumn) {

          let columnId;
          if(dbRecordColumns.length > 0) {

            const recordColumn = dbRecordColumns.find(col => col.column.id === schemaColumn.id);
            columnId = recordColumn ? recordColumn.id : undefined;

          }

          console.log(chalk.greenBright(`${!columnId ? 'creating' : 'updating'} column value for '${property} = ${body.properties[property]}'`));

          const sanitizedValue = this.validateAndSanitizeColumnValue(
            modifiedValues,
            schemaColumn,
            property,
            false,
          );

          if(!columnId) {

            columnsToCreate.push({
              id: columnId,
              dbRecordAssociation,
              recordId: record.id,
              schema: schema,
              schemaTypeId: record.schemaTypeId,
              organization: principal.organization,
              column: schemaColumn,
              value: sanitizedValue,
              lastModifiedBy: principal,
            });

          } else {

            columnsToUpdate.push({
              id: columnId,
              dbRecordAssociation,
              recordId: record.id,
              schema: schema,
              schemaTypeId: record.schemaTypeId,
              organization: principal.organization,
              column: schemaColumn,
              value: sanitizedValue,
              lastModifiedBy: principal,
            });

          }
        } else {
          throw new ExceptionType(
            422,
            `could not locate column ${property} in ${JSON.stringify(schemaColumns.map(elem => elem.name))}`,
          );
        }
      }

      trace.finish();

      return { columnsToUpdate, columnsToCreate };

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message || 'error constructing columns to create', e.validation);
    }
  }

  /**
   *
   * @param properties
   * @param schemaColumn
   * @param property
   * @param isUpdating
   */
  public validateAndSanitizeColumnValue(
    properties: { [key: string]: any },
    schemaColumn: SchemaColumnEntity,
    property: string,
    isUpdating: boolean,
  ): string {
    try {

      const sanitized = ColumnValueUtilities.sanitizeForStorage(
        properties,
        schemaColumn,
        property,
      );

      ValidateDBRecordColumnValues.validate(
        schemaColumn.validators,
        { properties: { [property]: sanitized } },
        schemaColumn,
        property,
        { isUpdating },
      );

      return sanitized;

    } catch (e) {
      console.error(e);
      throw new ExceptionType(e.statusCode, e.message, e.validation);
    }
  }

  /**
   *
   * @param dbRecordColumns
   * @param schemaColumns
   * @param body
   */
  private getModifiedProperties(
    dbRecordColumns: DbRecordColumnEntity[],
    schemaColumns: SchemaColumnEntity[],
    body: DbRecordCreateUpdateDto,
  ): { [key: string]: any } {
    let modifiedValues = body.properties || {};

    // If there are no columns then the record is being created do not find the difference.
    if(dbRecordColumns && dbRecordColumns.length > 1) {

      modifiedValues = ColumnValueUtilities.getColumnValueDiffFromExisting(
        body,
        dbRecordColumns,
        schemaColumns,
      );
    }

    return { modifiedValues };
  }

  /**
   *
   * @param body
   * @param schemaColumns
   *
   */
  public validateAllRequiredPropertiesExist(
    body: DbRecordCreateUpdateDto,
    schemaColumns: SchemaColumnEntity[],
    schemaTypeId?: string,
  ) {
    if(!!body.properties) {

      const bodyPropertyKeys = Object.keys(body.properties);

      let columns = schemaColumns;

      // filter schemaColumns by schemaTypeId if exists
      if(schemaTypeId) {
        columns = schemaColumns.filter(elem => elem.schemaTypeId === schemaTypeId || !elem.schemaTypeId);
      }

      const requiredSchemaColumns = columns.filter(elem => elem.validators.map(val => val.type).includes(
        'REQUIRED'));

      console.log('requiredSchemaColumns', requiredSchemaColumns)

      for(const schemaCol of requiredSchemaColumns) {

        if(!bodyPropertyKeys.includes(schemaCol.name)) {

          throw new ExceptionType(400, `missing required column ${schemaCol.name}`);

        }

      }

    }
  }

}
