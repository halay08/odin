import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import {
  ADD_FORM_FIELD,
  SET_QUERY_BUILDER_SEARCH_QUERY,
  REMOVE_FORM_FIELD,
  RESET_QUERY_BUILDER_STATE,
  SET_DATE_RANGE_QUERY,
  SET_FORM_FIELD_CONDITION,
  SET_FORM_FIELD_ENTITY,
  SET_FORM_FIELD_PROPERTY,
  SET_FORM_FIELD_VALUE,
  SET_QUERY_BUILDER_FORM_FIELDS,
  SET_QUERY_BUILDER_STATE,
  TOGGLE_QUERY_BUILDER,
  SET_FORM_FIELD_OPERATOR,
  SET_FORM_FIELD_AND_OR,
  SHOW_QUERY_BUILDER,
  SET_QUERY_BUILDER_TAB,
} from './constants';

import { FieldData, QueryBuilderReducer } from './reducer';

export interface IDateRangeQuery {
  property: string,
  gte: string,
  lte: string
}

export function toggleQueryBuilder() {
  return {
    type: TOGGLE_QUERY_BUILDER,
  }
}

export function showQueryBuilder() {
  return {
    type: SHOW_QUERY_BUILDER,
  }
}

export function setQueryBuilderDefaultTab(params: { activeKey: string }) {
  return {
    type: SET_QUERY_BUILDER_TAB,
    params,
  }
}


export function setQueryBuilderState(params: QueryBuilderReducer) {
  return {
    type: SET_QUERY_BUILDER_STATE,
    params,
  }
}

export function setQueryBuilderFormFields(params: { formFields: {} }) {
  return {
    type: SET_QUERY_BUILDER_FORM_FIELDS,
    params,
  }
}

export function resetQueryBuilderState() {
  return {
    type: RESET_QUERY_BUILDER_STATE,
  }
}


export function setSearchQuery(params: { schema: SchemaEntity, query: FieldData[], queryType: 'query_string | range' }) {
  return {
    type: SET_QUERY_BUILDER_SEARCH_QUERY,
    params,
  }
}

export function addFormField() {
  return {
    type: ADD_FORM_FIELD,
  }
}

export function removeFormField(UUID: string) {
  return {
    type: REMOVE_FORM_FIELD,
    UUID,
  }
}

export function setFormFieldEntity(UUID: string, value: string) {
  return {
    type: SET_FORM_FIELD_ENTITY,
    UUID,
    value,
  }
}

export function setFormFieldProperty(UUID: string, propertyName: string, esPropPath: string) {
  return {
    type: SET_FORM_FIELD_PROPERTY,
    UUID,
    propertyName,
    esPropPath,
  }
}

export function setFormFieldCondition(UUID: string, condition: string) {
  return {
    type: SET_FORM_FIELD_CONDITION,
    UUID,
    condition,
  }
}

export function setFormFieldOperator(UUID: string, operator: string) {
  return {
    type: SET_FORM_FIELD_OPERATOR,
    UUID,
    operator,
  }
}

export function setFormFieldAndOr(UUID: string, andOr: string) {
  return {
    type: SET_FORM_FIELD_AND_OR,
    UUID,
    andOr,
  }
}

export function setFormFieldValue(UUID: string, value: string) {
  return {
    type: SET_FORM_FIELD_VALUE,
    UUID,
    value,
  }
}


export function setDateRangeQuery(query: IDateRangeQuery) {
  return {
    type: SET_DATE_RANGE_QUERY,
    query,
  }
}
