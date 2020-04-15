import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { TableHeaderColumn } from '../../core/records/components/DynamicTable/helpers/configureColumns';

export const getSchemaFromShortListByModuleAndEntity = (
  shortList: { [key: string]: SchemaEntity },
  moduleName: string | undefined,
  entityName: string | undefined,
): SchemaEntity | undefined => {
  const keys = Object.keys(shortList);
  for(const key of keys) {
    const schema = shortList[key];
    if(schema.moduleName === moduleName && schema.entityName === entityName) {
      return schema;
    }
  }
};

export const getSchemaFromShortListBySchemaId = (
  shortList: { [key: string]: SchemaEntity },
  schemaId: string | null | undefined,
): SchemaEntity | undefined => {
  return schemaId ? shortList[schemaId] : undefined;
};


/**
 *  formats schema columns into elastic search index mappings
 * @param schema
 */
export const getElasticSearchKeysFromSchemaColumn = (
  schema: SchemaEntity,
  schemaTypeId?: string,
): TableHeaderColumn[] => {

  return schema?.columns?.filter(col => col.isVisibleInTables && (col.schemaTypeId === schemaTypeId || !col.schemaTypeId)).map(
    col => ({
      title: col.label ? col.label : '',
      dataIndex: `properties.${col.name}`,
      columnType: col.type,
      position: col.position,
      isTitleColumn: col.isTitleColumn ? col.isTitleColumn : false,
    }));

}

