import { ExceptionType } from '@d19n/common/dist/exceptions/types/ExceptionType';
import { DbRecordColumnEntity } from '@d19n/models/dist/schema-manager/db/record/column/db.record.column.entity';
import { DbRecordColumnEntityTransform } from '@d19n/models/dist/schema-manager/db/record/column/transform/db.record.column.entity.transform';
import { DbRecordCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/dto/db.record.create.update.dto';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { constantCase } from 'change-case';
import { DateParser } from './DateParser';

export class ColumnValueUtilities {

  /**
   *
   * @param title
   */
  public static sanitizeDbRecordTitleForStorage(
    title: string,
  ): string {

    console.log('BEFORE', title);
    let value;
    // we want to set the value to a string to prevent unwanted side effects
    // when boolean values are passed in true and false
    if(![ null, 'null', undefined, 'undefined', '' ].includes(title)) {

      value = String(title);

    }

    if(!!title) {

      if([ null, 'null', undefined, 'undefined', '' ].includes(value)) {

        return null;

      } else {

        return String(value).replace(/'/g, '\'\'');

      }
    }

    return value;

  }

  /**
   *
   * @param properties
   * @param column
   * @param property
   */
  public static sanitizeForStorage(
    properties: { [key: string]: any },
    column: SchemaColumnEntity,
    property,
  ): string {
    try {

      console.log({ properties, property });

      let columnValue = properties[property];

      console.log('BEFORE', columnValue);
      // we want to set the value to a string to prevent unwanted side effects
      // when boolean values are passed in true and false
      if(![ null, 'null', undefined, 'undefined', '' ].includes(columnValue)) {

        columnValue = String(columnValue);

      }

      console.log('typeof value', typeof columnValue);

      // trim any whitespace
      if(!!columnValue && typeof columnValue === 'string') {

        columnValue = columnValue.trim();

      }

      if(!!columnValue) {

        if([ null, 'null', undefined, 'undefined', '' ].includes(columnValue)) {

          return null;

        } else if(column.type === 'ENUM') {

          return String(constantCase(String(columnValue)));

        } else if(column.type === 'DATE_TIME') {

          return String(DateParser.toUtcUnixMs(columnValue, column));

        } else if(column.type === 'DATE') {

          return String(DateParser.toYearMonthDay(columnValue, column));

        } else if(column.type === 'NUMBER') {

          if(!isNaN(columnValue)) {

            return String(Number(columnValue));

          } else {

            return String(0);

          }

        } else if(column.type === 'CURRENCY') {

          if(!isNaN(columnValue)) {

            return String(Number(columnValue).toFixed(2));

          } else {

            return String(0);

          }

        } else if(column.type === 'PERCENT') {

          if(!isNaN(columnValue)) {

            return String(Number(columnValue).toFixed(2));

          } else {

            return String(0);

          }

        } else if(column.type === 'BOOLEAN') {

          // validate that the value passed in is a boolean value
          if(Boolean(columnValue)) {

            // change it to a string to avoid side effects with if statement conditions
            return String(columnValue);

          } else {

            // default return false if the user passes in a non boolean value
            return String(false)

          }

        } else if(column.type === 'EMAIL') {

          return String(columnValue.toLowerCase());

        } else if(column.type.includes('PHONE')) {

          return String(columnValue.replace(/ /g, ''));

        } else if([ 'TEXT', 'TEXT_LONG' ].includes(column.type)) {

          return String(columnValue).replace(/'/g, '\'\'');

        } else if(column.type.includes('NUMERIC')) {

          return String(columnValue);

        } else {

          return String(columnValue);

        }

      } else {

        if(column.type === 'DATE_TIME') {

          return null;

        } else if(column.type === 'DATE') {

          return null;

        } else if(column.type === 'NUMBER') {

          return String(0);

        } else if(column.type === 'CURRENCY') {

          return String(Number(0).toFixed(2));

        } else if(column.type === 'PERCENT') {

          return String(Number(0).toFixed(2));

        } else if(column.type === 'BOOLEAN') {

          // default return false if the user passes in a non boolean value
          return String(false)

        } else if(column.type === 'EMAIL') {

          return null;

        } else if(column.type.includes('PHONE')) {

          return null;

        } else if(column.type.includes('NUMERIC')) {

          return String(0);

        } else {

          return null;

        }
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(422, e.message, e.validation);
    }
  }

  /**
   *
   * @param body
   * @param dbRecordColumns
   * @param schemaColumns
   */
  public static getColumnValueDiffFromExisting(
    body: DbRecordCreateUpdateDto,
    dbRecordColumns: DbRecordColumnEntity[],
    schemaColumns: SchemaColumnEntity[],
  ): { [key: string]: any } {
    try {
      const existingColumnProperties = DbRecordColumnEntityTransform.transform(dbRecordColumns, schemaColumns);
      const newColumnProperties = body.properties;
      // remove all unchanged properties from the new Column properties;
      let changedProperties: { [key: string]: any } = {};

      console.log('newColumnProperties', newColumnProperties);

      if(Object.keys(existingColumnProperties).length > 0 && newColumnProperties) {

        for(const propKey in existingColumnProperties) {

          const schemaColumn = schemaColumns.find(elem => elem.name === propKey);

          // only check properties that have a schemaColumn
          if(schemaColumn) {

            if(Object.keys(newColumnProperties).includes(propKey)) {

              console.log({ newColumnProperties, propKey, col: schemaColumn.name });
              // sanitize before checking against database values
              const sanitized = this.sanitizeForStorage(
                newColumnProperties,
                schemaColumn,
                propKey,
              )

              const existingValue = existingColumnProperties[propKey] ? existingColumnProperties[propKey].trim() : null;
              const newValue = sanitized;

              console.log('existingValue', existingValue);
              console.log('newValue', newValue);
              console.log('sanitized', sanitized);

              // values are different return the new value
              if(existingValue !== newValue) {
                changedProperties = Object.assign({}, changedProperties, { [propKey]: newValue });
              }
            }
          }
        }

        console.log('changedProperties', changedProperties);

        // Return changed properties
        return changedProperties;

      } else {

        console.log('changedProperties', changedProperties);

        // No existing columns, return new properties
        return newColumnProperties;
      }
    } catch (e) {
      console.error(e);
      throw new ExceptionType(422, e.message, e.validation);
    }
  }
}
