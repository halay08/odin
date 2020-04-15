import { SchemaColumnEntity } from "../schema.column.entity";

export class SchemaColumnEntityTransform {

  /**
   *
   * @param columns
   */
  public static transform(columns: SchemaColumnEntity[]) {

    let properties: { [key: string]: any } = {};

    if(columns) {
      for(let i = 0; i < columns.length; i++) {
        const column = columns[i];
        properties = Object.assign({}, properties, {
          [column.name]: column.type,
        });
      }
    }

    return properties;
  }

}
