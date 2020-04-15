import { AutoComplete, Col, Layout, Row, Spin, Tag } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { QueryBuilderReducer } from '../../core/records/components/DynamicTable/QueryBuilder/store/reducer';
import { TableReducer } from '../../core/records/components/DynamicTable/store/reducer';
import {
  ISearchRecords,
  resetRecordsList,
  searchRecordsRequest,
  setDbRecordSearchQuery,
} from '../../core/records/store/actions';
import { IRecordReducer } from '../../core/records/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../core/schemas/store/actions';
import { SchemaReducerState } from '../../core/schemas/store/reducer';
import {
  getBrowserPath,
  getRecordListFromShortListById,
  splitModuleAndEntityName,
} from '../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../shared/utilities/schemaHelpers';
import { getDefaultFields } from '../../shared/utilities/searchHelpers';

const { Option } = AutoComplete;

interface Props {
  entities: string[],
  schema: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  queryBuilderReducer: QueryBuilderReducer,
  searchRecords: any,
  resetRecordState: any,
  setSearchQuery: any,
  getSchema: any,
}

class SearchBox extends React.Component<Props> {

  componentDidMount(): void {
    this.loadSchema();
  }

  loadSchema() {
    const { getSchema, entities } = this.props;
    for(const entity of entities) {
      const { moduleName, entityName } = splitModuleAndEntityName(entity);
      getSchema({ moduleName, entityName });
    }
  }

  searchRecordOnChange(e: any) {
    const { schema, schemaReducer, searchRecords, entities } = this.props;

    let schemaIds;
    for(const entity of entities) {
      const { moduleName, entityName } = splitModuleAndEntityName(entity);
      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
      if(schema && schema.id && schemaIds) {
        schemaIds = schemaIds.concat(`,${schema.id}`);
      } else if(schema) {
        schemaIds = schema.id;
      }
    }

    if(schemaIds) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: e,
          fields: getDefaultFields(schema.moduleName, schema.entityName),
          schemas: schemaIds,
          sort: [],
          boolean: true,
        },
      });
    }

  }

  renderResultsTag(tagText: string) {
    const entityName = tagText.split(':')[1]

    switch (entityName) {
      case 'Order':
        return <Tag color="blue">{entityName}</Tag>
      case 'Account':
        return <Tag color="purple">{entityName}</Tag>
      default:
        return <Tag>{tagText}</Tag>
    }
  }

  renderResults() {
    const { recordReducer, schema, entities } = this.props

    let searchResults: any[] = []

    if(recordReducer.list && schema && schema.id) {
      const list = getRecordListFromShortListById(recordReducer.list, schema.id);
      console.log('list', list);
      if(list) {
        searchResults.push(...list);
      }
    }

    if(recordReducer.isSearching) {
      return (
        <Option key="searching" value="searching" disabled={true}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Spin/>
          </div>
        </Option>
      )
    }

    if(searchResults && searchResults.length > 0) {
      searchResults = searchResults.map((result: any) => (
        <Option key={result.id} value={result.title}>
          <Link to={getBrowserPath(result)}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {result.title}
              <span>{this.renderResultsTag(result.entity)}</span>
            </div>
          </Link>
        </Option>
      ))
    }

    return searchResults
  }

  render() {


    return (
      <Layout style={{
        padding: 8,
        overflow: 'auto'
      }}>
        <Row>
          <Col span={24} style={{
            textAlign: 'center',
            marginTop: '15%'
          }}>
            <AutoComplete
              style={{ width: '42%' }}
              size="large"
              onChange={e => this.searchRecordOnChange(e)}
              placeholder="Search Email / Phone / Address"
              autoFocus={true}
            >
              {this.renderResults()}
            </AutoComplete>
          </Col>
        </Row>
      </Layout>
    )
  }
}

const mapState = (state: any) => ({
  recordTableReducer: state.recordTableReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  queryBuilderReducer: state.queryBuilderReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
  setSearchQuery: (params: ISearchRecords) => dispatch(setDbRecordSearchQuery(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  resetRecordState: () => dispatch(resetRecordsList()),
});

export default connect(mapState, mapDispatch)(SearchBox)
