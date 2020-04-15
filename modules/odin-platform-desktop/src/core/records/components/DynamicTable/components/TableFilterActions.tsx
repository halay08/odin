import { ReloadOutlined } from '@ant-design/icons';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, message, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getDefaultFields, getSavedFilter, setSortQuery } from '../../../../../shared/utilities/searchHelpers';
import { SchemaReducerState } from '../../../../schemas/store/reducer';
import { ISearchRecords, resetRecordsSearchQuery, searchRecordsRequest } from '../../../store/actions';
import { IRecordReducer } from '../../../store/reducer';
import SaveView from '../../ListView/SaveView';
import QueryBuilderToggle from '../QueryBuilder/components/ToggleFilterButton';
import { resetQueryBuilderState } from '../QueryBuilder/store/actions';
import { QueryBuilderReducer } from '../QueryBuilder/store/reducer';
import { clearSavedFilter } from '../store/actions';
import { TableReducer } from '../store/reducer';

interface Props {
  schema: SchemaEntity | undefined,
  recordTableReducer: TableReducer;
  schemaReducer: SchemaReducerState;
  recordReducer: IRecordReducer;
  queryBuilderReducer: QueryBuilderReducer
  clearListView: any;
  searchRecords: any;
  clearSearchQuery: any,
  clearQueryBuilder: any,
}

const success = () => {
  message.success('filters cleared');
};

class TableFilterActions extends React.Component<Props> {

  private clearSavedTableFilters() {

    const { schema, clearListView, clearSearchQuery, clearQueryBuilder } = this.props;

    if(!!schema) {
      const name = `${schema.moduleName}_${schema.entityName}_filter`;

      clearListView({ name });
      clearSearchQuery({ schemaId: schema?.id });
      clearQueryBuilder();

      success();

      this.searchRecords();

    }

  }

  searchRecords() {
    const { schema, schemaReducer, recordTableReducer, recordReducer, searchRecords } = this.props;

    if(schema && !recordReducer.isSearching) {

      const moduleName = schema.moduleName;
      const entityName = schema.entityName;

      const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

      searchRecords({
        schema: schema,
        searchQuery: {
          terms: '',
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
          boolean: savedFilter?.queries,
        },
      });
    }
  }


  render() {

    const { schema, recordReducer } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        <Popconfirm
          title="clear saved filter?"
          onConfirm={() => this.clearSavedTableFilters()}
          okText="Yes"
          cancelText="No"
        >
          <Button loading={recordReducer.isSearching} style={{ marginRight: 4 }} icon={<ReloadOutlined/>}/>
        </Popconfirm>
        <QueryBuilderToggle/>
        <SaveView moduleName={schema?.moduleName} entityName={schema?.entityName}/>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  recordTableReducer: state.recordTableReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  queryBuilderReducer: state.queryBuilderReducer,
});

const mapDispatch = (dispatch: any) => ({
  clearListView: (params: any) => dispatch(clearSavedFilter(params)),
  clearSearchQuery: (params: any) => dispatch(resetRecordsSearchQuery(params)),
  clearQueryBuilder: () => dispatch(resetQueryBuilderState()),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
});


export default connect(mapState, mapDispatch)(TableFilterActions);
