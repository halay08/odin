import { BooleanQuery } from '@d19n/models/dist/search/search.query.boolean.interfaces';
import { v4 as uuidv4 } from 'uuid';
import {
  ADD_FORM_FIELD,
  REMOVE_FORM_FIELD,
  RESET_QUERY_BUILDER_STATE,
  SET_DATE_RANGE_QUERY,
  SET_FORM_FIELD_CONDITION,
  SET_FORM_FIELD_ENTITY,
  SET_FORM_FIELD_PROPERTY,
  SET_FORM_FIELD_VALUE,
  SET_QUERY_BUILDER_FORM_FIELDS,
  SET_QUERY_BUILDER_SEARCH_QUERY,
  SET_QUERY_BUILDER_STATE,
  TOGGLE_QUERY_BUILDER,
  SET_FORM_FIELD_OPERATOR,
  SET_FORM_FIELD_AND_OR,
  SHOW_QUERY_BUILDER,
  SET_QUERY_BUILDER_TAB,
} from './constants';

export interface FieldData {
  property: string;
  condition: string;
  value: any;
  UUID: string;
  entityName: string;
  query: any;
  esPropPath: string;
  andOr: string;
  operator: string;
}

export interface QueryBuilderReducer {
  isVisible: boolean,
  activeKey?: string
  formFields: {
    propertyFilters: FieldData[],
    pipelineFilters: FieldData[],
  },
  dateRangeFilters: { [key: string]: { gte: string, lte: string } },
  queries: {
    must: [],
    must_not: [],
    should: [],
    filter: [],
  }
}

export const initialState: QueryBuilderReducer = {
  isVisible: false,
  activeKey: "1",
  formFields: {
    propertyFilters: [],
    pipelineFilters: [],
  },
  dateRangeFilters: {},
  queries: {
    must: [],
    must_not: [],
    should: [],
    filter: [],
  },
};

function reducer(state = initialState, action: any) {

  let _newPropertyFilters;

  switch (action.type) {

    case SET_QUERY_BUILDER_STATE:
      return {
        ...state,
        ...action.params,
      };

    case TOGGLE_QUERY_BUILDER:
      return {
        ...state,
        isVisible: !state.isVisible,
      };

    case SHOW_QUERY_BUILDER:
      return {
        ...state,
        isVisible: true,
      };

    case SET_QUERY_BUILDER_TAB:
      return {
        ...state,
        activeKey:action.params.activeKey,
      };

    case SET_QUERY_BUILDER_FORM_FIELDS:
      return {
        ...state,
        formFields: action.params.formFields,
      };

    case SET_QUERY_BUILDER_SEARCH_QUERY:
      const newQueries: BooleanQuery = {
        must: [],
        must_not: [],
        should: [],
        filter: state.queries.filter,
      };

      for(let i = 0;i<action.params?.query?.length;i++) {
        const item=action.params?.query[i]
        const nextItem=action.params?.query[i+1] 

        if(nextItem?.andOr === 'OR' || ( item.operator && item.operator !== '=')){
          if(nextItem?.andOr === 'OR'){
            const baseORQuery:any ={
              "bool": {
                "should": [
                ]
              }
            }
            const itemBlock = getQueryBlock(item)
            const nextItemBlock = getQueryBlock(nextItem)
            baseORQuery.bool.should.push(itemBlock)
            baseORQuery.bool.should.push(nextItemBlock)
  
            // @ts-ignore
            newQueries['must'].push(baseORQuery)
            i=i+1
          }else{
          const itemBlock = getQueryBlock(item)
          newQueries['must'].push(itemBlock)
          }

        }else if(action.params.queryType === 'query_string') {
          // @ts-ignore
          newQueries['must'].push(
            // @ts-ignore
            {
              query_string: {
                fields: [ item.esPropPath ],
                query: item.value,
                default_operator: 'AND',
                lenient: true,
                analyze_wildcard: true,
                boost: 1.0,
              },
            },
          );
        }
      }

      return {
        ...state,
        queries: newQueries,
      };
      break;

    case RESET_QUERY_BUILDER_STATE:
      return initialState;

    case SET_FORM_FIELD_CONDITION:
      let newPropertyFilters = state.formFields.propertyFilters.map((field => {
        if(field.UUID == action.UUID) {
          field.condition = action.condition
        }
        return field;
      }))
      return {
        ...state,
        formFields: Object.assign({}, state.formFields, {
          propertyFilters: newPropertyFilters,
        }),
      }
      break;
    case SET_FORM_FIELD_AND_OR:
        _newPropertyFilters = state.formFields.propertyFilters.map((field => {
          if(field.UUID == action.UUID) {
            field.andOr = action.andOr
          }
          return field;
        }))
      return {
        ...state,
        formFields: Object.assign({}, state.formFields, {
          propertyFilters: _newPropertyFilters,
        }),
      }
      break;
    case SET_FORM_FIELD_OPERATOR:
        _newPropertyFilters = state.formFields.propertyFilters.map((field => {
          if(field.UUID == action.UUID) {
            field.operator = action.operator
          }
          return field;
        }))
      return {
        ...state,
        formFields: Object.assign({}, state.formFields, {
          propertyFilters: _newPropertyFilters,
        }),
      }
      break;

    case SET_FORM_FIELD_ENTITY:
      _newPropertyFilters = state.formFields.propertyFilters.map((field => {
        if(field.UUID == action.UUID) {
          field.entityName = action.value
          field.property = ''
          field.condition = ''
          field.andOr = field.andOr || 'AND'
          field.operator = action.operator || '='
        }
        return field;
      }))
      return {
        ...state,
        formFields: Object.assign({}, state.formFields, {
          propertyFilters: _newPropertyFilters,
        }),
      }
      break;

    case SET_FORM_FIELD_PROPERTY:
      _newPropertyFilters = state.formFields.propertyFilters.map((field => {
        if(field.UUID == action.UUID) {
          field.property = action.propertyName
          field.esPropPath = action.esPropPath
          field.condition = ''
        }
        return field;
      }))
      return {
        ...state,
        formFields: Object.assign({}, state.formFields, {
          propertyFilters: _newPropertyFilters,
        }),
      }
      break;

    case SET_FORM_FIELD_VALUE:
      _newPropertyFilters = state.formFields.propertyFilters.map((field => {
        if(field.UUID == action.UUID) {
          field.value = action.value
        }
        return field;
      }))
      return {
        ...state,
        formFields: Object.assign({}, state.formFields, {
          propertyFilters: _newPropertyFilters,
        }),
      }
      break;

    case REMOVE_FORM_FIELD:
      const propertyFilters = state.formFields.propertyFilters.filter((field => field.UUID !== action.UUID))
      const remainingPropertyFields = Object.assign({}, state.formFields, {
        propertyFilters: propertyFilters,
      })
      return {
        ...state,
        formFields: remainingPropertyFields,
      }
      break;

    case ADD_FORM_FIELD:
      const newField = {
        UUID: uuidv4(),
        entityName: '',
        property: '',
        condition: '',
        value: '',
        esPropPath: '',
      };

      const newFormFields = Object.assign({}, state.formFields, {
        propertyFilters: [ ...state.formFields.propertyFilters, ...[ newField ] ],
      })

      return {
        ...state,
        formFields: newFormFields,
      };
      break;

    case SET_DATE_RANGE_QUERY:
      const newRangeFilters = Object.assign({}, state.dateRangeFilters, action.query);
      return {
        ...state,
        dateRangeFilters: newRangeFilters,
        queries: {
          ...state.queries,
          filter: [
            {
              range: {
                [action.query.property]: {
                  gte: action.query.gte,
                  lt: action.query.lte,
                },
              },
            },
          ],
        },
      };
      break;

    default:
      return state;
  }
}


function getQueryBlock(item:any){
  switch (item.operator){
    case '=':
    const baseQueryEqualEl:any = {
      "bool": {
        "must": {
          "terms": {}
        }
      }
    }
    baseQueryEqualEl.bool.must.terms[`${item.esPropPath}.keyword`]=[item.value]
    return baseQueryEqualEl

    case '!=':
    const baseQueryNotEqualEl:any = {
      "bool": {
        "must_not": {
          "terms": {}
        }
      }
    }
    baseQueryNotEqualEl.bool.must_not.terms[`${item.esPropPath}.keyword`]=[item.value]
    return baseQueryNotEqualEl
    
    case 'LIKE':
    const baseQueryLikeEl:any = {
      "bool": {
        "must": {
          "match": {},
        }
      }
    }
    baseQueryLikeEl.bool.must.match[item.esPropPath]={
      query:item.value,
      operator:'and'
    }
    return baseQueryLikeEl

    case 'IN':
      const baseQueryInEl:any = {
        "bool": {
          "must": {
            "match": {},
          }
        }
      }
      baseQueryInEl.bool.must.match[item.esPropPath]={
        query:item.value,
        operator:'or'
      }
      return baseQueryInEl
  }
}

export default reducer;
