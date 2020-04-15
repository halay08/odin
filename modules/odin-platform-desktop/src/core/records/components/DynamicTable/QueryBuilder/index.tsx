import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import { Card, Col, Tabs, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { setSortQuery } from '../../../../../shared/utilities/searchHelpers';
import { SchemaReducerState } from '../../../../schemas/store/reducer';
import { searchRecordsRequest } from '../../../store/actions';
import { IRecordReducer } from '../../../store/reducer';
import { setTableConfig } from '../store/actions';
import { TableReducer } from '../store/reducer';
import DateFilters from './components/DateFilters';
import PipelineFilterDropdown from './components/PipelineFilterDropdown';
import TablePropertiesFilter from './components/PropertyFilters';
import TableColumnsFilter from './components/VisibilityFilters';
import { createElasticSearchFieldNames } from './helpers/recordFilterParsers';

import { resetQueryBuilderState, setQueryBuilderState, setQueryBuilderDefaultTab } from './store/actions';
import { QueryBuilderReducer } from './store/reducer';

const { TabPane } = Tabs;
const { Title } = Typography;

interface Props {
  schema: SchemaEntity | undefined,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  queryBuilderReducer: QueryBuilderReducer,
  recordTableReducer: TableReducer,
  searchRecords: any,
  setFilterableProps: any,
  setBuilderState: any,
  reset: any,
  setQueryBuilderDefaultTab: any,
}

class QueryBuilder extends React.Component<Props> {

  componentDidMount(): void {

    const { schema, setFilterableProps } = this.props;
    this.loadSavedQueries();

    createElasticSearchFieldNames(schema, setFilterableProps);

  }

  componentWillUnmount() {

    this.props.reset();

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {

    if(prevProps.queryBuilderReducer.queries !== this.props.queryBuilderReducer.queries) {

      this.fetchData();

    }

  }

  private loadSavedQueries() {
    const { setBuilderState } = this.props;
    const savedFilter = this.getSavedFilter();

    if(!!savedFilter) {
      setBuilderState(savedFilter);
    }

  }

  private getSavedFilter() {
    const { schema, recordTableReducer } = this.props;

    if(schema) {
      const name = `${schema.moduleName}_${schema.entityName}_filter`;
      const filter = recordTableReducer.listViews ? recordTableReducer.listViews[name] : undefined;
      if(!!filter && filter.queryBuilder) {
        return filter.queryBuilder;
      }
    }
  }


  private fetchData() {
    const { schema, schemaReducer, recordReducer, queryBuilderReducer, searchRecords } = this.props;

    if(schema && !recordReducer.isSearching) {

      searchRecords({
        schema: schema,
        searchQuery: {
          schemas: schema.id,
          terms: recordReducer.searchQuery.terms,
          sort: setSortQuery(schemaReducer, recordReducer, schema.moduleName, schema.entityName),
          boolean: queryBuilderReducer.queries,
        },
      });
     
    }

  }

  render() {
    const { queryBuilderReducer, schema } = this.props;

    return (
      queryBuilderReducer.isVisible &&
      <Col span={5}>
          <Card className="query-builder"
                style={{ height: 'calc(100vh - 300px)', overflow: 'auto' }}>
              <Tabs activeKey={queryBuilderReducer.activeKey} onTabClick={activeKey=>this.props.setQueryBuilderDefaultTab({activeKey})}>
                  <TabPane tab="Show / Hide" key="1">
                      <TableColumnsFilter moduleName={schema?.moduleName} entityName={schema?.entityName}/>
                  </TabPane>
                  <TabPane tab="Filters" key="2">
                      <div style={{ marginBottom: 24 }}>
                          <Title level={4}>Stage Filters</Title>
                          <PipelineFilterDropdown schema={schema}/>
                      </div>
                      <div style={{ marginBottom: 24 }}>
                          <Title level={4}>Date Filters</Title>
                          <DateFilters moduleName={schema?.moduleName} entityName={schema?.entityName}/>
                      </div>
                      <div style={{ marginBottom: 24 }}>
                          <Title level={4}>Property Filters</Title>
                          <TablePropertiesFilter moduleName={schema?.moduleName} entityName={schema?.entityName}/>
                      </div>
                  </TabPane>
              </Tabs>
          </Card>
      </Col>
    );
  }
}

const mapState = (state: any) => ({
  queryBuilderReducer: state.queryBuilderReducer,
  recordTableReducer: state.recordTableReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  setBuilderState: (params: QueryBuilderReducer) => dispatch(setQueryBuilderState(params)),
  setFilterableProps: (params: any) => dispatch(setTableConfig(params)),
  reset: () => dispatch(resetQueryBuilderState()),
  searchRecords: (params: { schema: SchemaEntity, searchQuery: SearchQueryType }) => dispatch(searchRecordsRequest(
    params)),
  setQueryBuilderDefaultTab: (params: { activeKey: string })  => dispatch(setQueryBuilderDefaultTab(params)),
});

export default connect(mapState, mapDispatch)(QueryBuilder);
