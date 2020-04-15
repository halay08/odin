import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, message, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getDefaultFields, getSavedFilter, setSortQuery } from '../../../../../shared/utilities/searchHelpers';
import { SchemaReducerState } from '../../../../schemas/store/reducer';
import { ISearchRecords, resetRecordsSearchQuery, searchRecordsRequest } from '../../../store/actions';
import { IRecordReducer } from '../../../store/reducer';
import { clearSavedFilter, saveTableFilters } from '../store/actions';
import { TableReducer } from '../store/reducer';

interface Props {
  schema: SchemaEntity | undefined,
  recordTableReducer: TableReducer;
  schemaReducer: SchemaReducerState;
  recordReducer: IRecordReducer;
  saveFilter: any;
  clearListView: any;
  clearQueries: any;
  searchRecords: any;
  clearSearchQuery: any,
}

const success = () => {
  message.success('filters cleared');
};

class TableFilterActions extends React.Component<Props> {

  private clearSavedTableFilters() {
    const { schema, clearListView, clearQueries, clearSearchQuery } = this.props;
    if(!!schema) {
      // For saved views until we have that inside a reducer
      // we need to reset the url to stop the filters from being set
      const urlNoHash = window.location.href.substr(0, window.location.href.indexOf('#'))
      window.location.href = urlNoHash;

      const name = `${schema.moduleName}_${schema.entityName}_filter`;
      clearListView({ name });
      clearQueries();
      clearSearchQuery({ schemaId: schema?.id });
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
    return (
      <div style={{ display: 'flex' }}>
        <Popconfirm
          title="clear saved filter?"
          onConfirm={() => this.clearSavedTableFilters()}
          okText="Yes"
          cancelText="No"
        >
          <Button style={{ marginRight: 4 }}>Reset</Button>
        </Popconfirm>
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
  saveFilter: (name: string, params: any) => dispatch(saveTableFilters(name, params)),
  clearListView: (params: any) => dispatch(clearSavedFilter(params)),
  clearSearchQuery: (params: any) => dispatch(resetRecordsSearchQuery(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
});


export default connect(mapState, mapDispatch)(TableFilterActions);
