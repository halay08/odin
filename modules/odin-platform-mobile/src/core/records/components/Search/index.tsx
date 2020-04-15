import { Input } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import {
  getDefaultFields,
  getSavedFilter,
  setSearchQuery,
  setSortQuery,
} from '../../../../shared/utilities/searchHelpers';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { ISearchRecords, resetRecordsList, searchRecordsRequest, setDbRecordSearchQuery } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import { TableReducer } from '../DynamicTable/store/reducer';


const { Search } = Input;

interface Props {
  moduleName: string,
  entityName: string,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  searchRecords: any,
  resetRecordState: any,
  setSearchQuery: any
}

class RecordSearch extends React.Component<Props> {

  componentDidMount() {
    this.props.resetRecordState();
    this.loadInitialList();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.entityName !== this.props.entityName) {
      this.loadInitialList();
    }
    if(prevProps.schemaReducer.isRequesting !== this.props.schemaReducer.isRequesting) {
      this.loadInitialList();
    }
  }

  loadInitialList() {
    const { schemaReducer, recordTableReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: setSearchQuery(schemaReducer, recordReducer, moduleName, entityName),
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
          boolean: savedFilter?.queries,
        },
      });
    }
  }

  searchRecordOnChange(e: any) {
    const { schemaReducer, recordTableReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: e.target.value,
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
          boolean: savedFilter?.queries,
        },
      });
    }
  }


  render() {
    const { schemaReducer, recordReducer, moduleName, entityName } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Search
            className="search-input"
            placeholder="search records"
            value={setSearchQuery(schemaReducer, recordReducer, moduleName, entityName)}
            loading={recordReducer.isRequesting}
            onChange={e => this.searchRecordOnChange(e)}
            onSearch={() => this.loadInitialList()}
          />
        </div>
      </div>
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
  setSearchQuery: (params: ISearchRecords) => dispatch(setDbRecordSearchQuery(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  resetRecordState: () => dispatch(resetRecordsList()),
});


export default connect(mapState, mapDispatch)(RecordSearch)
