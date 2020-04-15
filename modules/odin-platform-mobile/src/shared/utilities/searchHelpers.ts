import { TableReducer } from '../../core/records/components/DynamicTable/store/reducer';
import { IRecordReducer } from '../../core/records/store/reducer';
import { SchemaReducerState } from '../../core/schemas/store/reducer';
import { getSchemaFromShortListByModuleAndEntity } from './schemaHelpers';

/**
 * This method will the the filters for a list view
 * @returns {QueryBuilder<any> | QueryBuilderReducer}
 * @param schemaReducer
 * @param recordTableReducer
 * @param moduleName
 * @param entityName
 */
export function getCurrentListView(
  schemaReducer: SchemaReducerState,
  recordTableReducer: TableReducer,
  moduleName: string,
  entityName: string,
) {

  const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

  if(schema) {
    const name = `${schema.moduleName}_${schema.entityName}_filter`;
    const filter = recordTableReducer.listViews ? recordTableReducer.listViews[name] : undefined;
    if(!!filter) {
      return filter;
    }
  }
}

/**
 * This method will the the filters for a list view
 * @returns {QueryBuilder<any> | QueryBuilderReducer}
 * @param schemaReducer
 * @param recordTableReducer
 * @param moduleName
 * @param entityName
 */
export function getSavedFilter(
  schemaReducer: SchemaReducerState,
  recordTableReducer: TableReducer,
  moduleName: string,
  entityName: string,
) {

  const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

  if(schema) {
    const name = `${schema.moduleName}_${schema.entityName}_filter`;
    const filter = recordTableReducer.listViews ? recordTableReducer.listViews[name] : undefined;
    if(!!filter && filter.queryBuilder) {
      return filter.queryBuilder;
    }
  }
}

/**
 *
 * @param schemaReducer
 * @param recordReducer
 * @param moduleName
 * @param entityName
 */
export function setSortQuery(
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  moduleName: string,
  entityName: string,
) {
  const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
  if(!!recordReducer.searchQuery && schema) {
    if([ 'Premise', 'Premise2' ].includes(schema.entityName)) {
      return [
        // { 'properties.UDPRN': { 'order': 'asc' } },
        { 'properties.BuildingNumber': { 'order': 'asc' } },
        { 'properties.DeliveryPointSuffixNumber': { 'order': 'asc' } },
        { 'properties.DeliveryPointSuffixLetter.keyword': { 'order': 'asc' } },
      ];
    } else {
      // @ts-ignore
      return !!recordReducer.searchQuery[schema.id] ? recordReducer.searchQuery[schema.id].sort : [ { updatedAt: { order: 'desc' } } ];
    }
  }
}

/**
 *
 * @param schemaReducer
 * @param recordReducer
 * @param moduleName
 * @param entityName
 */
export function setSearchQuery(
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  moduleName: string,
  entityName: string,
) {
  const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
  if(!!recordReducer.searchQuery && schema) {
    // @ts-ignore
    return !!recordReducer.searchQuery[schema.id] ? recordReducer.searchQuery[schema.id].terms : ''
  }
}

/**
 * Set the default search fields for entities
 * @param moduleName
 * @param entityName
 */
export function getDefaultFields(moduleName: string, entityName: string) {

  if([ 'Task', 'Milestone', 'Project', 'Program', 'Subtask' ].includes(entityName)) {
    return [
      'properties.*',
      'title',
      'recordNumber',
    ];
  }
  if(moduleName === 'CrmModule' && [ 'Premise' ].includes(entityName)) {
    return [
      'properties.PostalCode',
      'properties.PostalCodeNoSpace',
      'properties.UDPRN',
      'title',
    ];
  }
  if(moduleName === 'CrmModule' && [ 'Visit' ].includes(entityName)) {
    return [
      'properties.Coordinates',
      'properties.FollowUpDate',
      'properties.NotInterestedReason',
      'properties.Outcome',
      'properties.UDPRN',
      'properties.UMPRN',
      'title'
    ];
  }
  if(moduleName === 'OrderModule' && entityName === 'Order') {
    return [
      'properties.*',
      'title',
      'recordNumber',
      'Address.dbRecords.properties.*',
      'Contact.dbRecords.properties.*',
    ];
  }
  if(moduleName === 'FieldServiceModule' && entityName === 'WorkOrder') {
    return [
      'properties.*',
      'title',
      'recordNumber',
      'Address.dbRecords.properties.*',
      'Contact.dbRecords.properties.*',
    ];
  }
  if(moduleName === 'CrmModule' && entityName === 'Lead') {
    return [
      'title',
      'recordNumber',
      'Address.dbRecords.title',
      'Contact.dbRecords.title',
      'Contact.dbRecords.properties.FirstName',
      'Contact.dbRecords.properties.LastName',
      'Contact.dbRecords.properties.EmailAddress',
      'Contact.dbRecords.properties.Phone',
    ];
  }
  if(moduleName === 'CrmModule' && entityName === 'Account') {
    return [
      'title',
      'recordNumber',
      'Address.dbRecords.title',
      'Contact.dbRecords.title',
      'Contact.dbRecords.properties.FirstName',
      'Contact.dbRecords.properties.LastName',
      'Contact.dbRecords.properties.EmailAddress',
      'Contact.dbRecords.properties.Phone',
    ];
  }
  if(moduleName === 'SchemaModule' && entityName === 'ALL') {
    return [
      'title',
      'recordNumber',
      'Address.dbRecords.title',
      'Contact.dbRecords.title',
      'Contact.dbRecords.properties.FirstName',
      'Contact.dbRecords.properties.LastName',
      'Contact.dbRecords.properties.EmailAddress',
      'Contact.dbRecords.properties.Phone',
    ];
  }
}
