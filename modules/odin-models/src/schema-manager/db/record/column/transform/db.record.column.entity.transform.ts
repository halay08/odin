import { SchemaColumnEntity } from '../../../../schema/column/schema.column.entity';
import { DbRecordColumnEntity } from '../db.record.column.entity';
import { DbRecordColumnEntityTransformBase } from './db.record.column.entity.transform.base';

export class DbRecordColumnEntityTransform extends DbRecordColumnEntityTransformBase {

  public properties: { [key: string]: any };

  /**
   * Sort columns alphabetically
   * @param schemaColumns
   * @private
   */
  private static sortAlphabetically(schemaColumns: SchemaColumnEntity[]): SchemaColumnEntity[] {
    return schemaColumns.sort(function (a, b) {
      const nameA = a.name.toLowerCase(); // ignore case
      const nameB = b.name.toLowerCase(); // ignore case
      if(nameA < nameB) {
        return -1; //nameA comes first
      }
      if(nameA > nameB) {
        return 1; // nameB comes first
      }
      return 0;  // names must be equal
    });
  }


  /**
   * Transform dbRecord column values
   * @param dbRecordColumns
   * @param schemaColumns
   */
  public static transform(
    dbRecordColumns: DbRecordColumnEntity[],
    schemaColumns: SchemaColumnEntity[],
  ): DbRecordColumnEntityTransform {

    let properties = {};
    if(!!schemaColumns) {

      const sortedColumns = DbRecordColumnEntityTransform.sortAlphabetically(schemaColumns);

      for(let i = 0; i < sortedColumns.length; i++) {

        const schemaColumn = sortedColumns[i];

        const dbRecordColumn = dbRecordColumns.find(elem => elem.column && elem.column.id === schemaColumn.id);

        const value = dbRecordColumn ? dbRecordColumn.value : null;

        properties = Object.assign({}, properties, { [schemaColumn.name]: value });

      }
    }
    return <DbRecordColumnEntityTransform>properties;
  }
}
