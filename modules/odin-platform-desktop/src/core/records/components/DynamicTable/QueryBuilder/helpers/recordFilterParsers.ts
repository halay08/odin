import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';


/**
 *
 * @param schema
 * @param setFilterableProps
 */
export function createElasticSearchFieldNames(
  schema: SchemaEntity | undefined,
  setFilterableProps: (params: any) => {},
) {
  let properties = {};
  if(schema && schema.columns) {
    for(const col of schema.columns) {
      // @ts-ignore
      properties = Object.assign(
        {},
        properties,
        { [`properties.${col.name}`]: null },
      );
    }
  }
  setFilterableProps({ filterableColumns: properties });
}

/**
 *
 * @param colName
 */
export const getDataIndexForRecordField = (colName: string) => {
  return colName ? `${colName}` : ''
}

/**
 *
 * @param colName
 */
export const getDataIndexForRecord = (colName: string) => {
  return colName ? `properties.${colName}` : ''
}

/**
 *
 * @param colName
 */
export const extractDataIndexFromSchemaColumnName = (colName: string) => {
  let dataIndex = colName.split('.');
  return dataIndex[dataIndex.length - 1];
}
