import { Layout, PageHeader } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Error403 } from '../../../../shared/pages/403';
import { canUserSearchRecord } from '../../../../shared/permissions/rbacRules'
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import { updateUserRolesAndPermissionsRequest } from '../../../identity/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { resetRecordsList } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import DataTable from '../DynamicTable';
import TableRecordActions from '../DynamicTable/components/TableRecordActions';
import { QueryBuilderReducer } from '../DynamicTable/QueryBuilder/store/reducer';
import { resetTableState, saveTableFilters } from '../DynamicTable/store/actions';

import RecordSearch from '../Search';
import ViewManager from './ViewManager';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {

  moduleName: string,
  entityName: string,
  userReducer?: Object,
  schemaReducer: SchemaReducerState;
  recordReducer: IRecordReducer;
  queryBuilderReducer: QueryBuilderReducer
  recordTableReducer: any,
  saveFilter: any,
  getSchema: any,
  resetRecordState: any,
  resetTableReducer: any,
  pipelinesEnabled?: boolean,
  updateUserRolesAndPermissions: any,
  match: any,

}

class RecordListView extends React.Component<PropsType> {


  // Load schema
  componentDidMount(): void {
    this.loadSchema();
    this.fetchUserPermissions();
  }

  fetchUserPermissions() {
    const { updateUserRolesAndPermissions } = this.props;
    updateUserRolesAndPermissions();
  }

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.entityName !== this.props.entityName) {
      this.loadSchema();
    }

    if(prevProps.recordTableReducer.columns !== this.props.recordTableReducer.columns) {
      this.saveTableFilters();
    }

    if(prevProps.recordReducer.searchQuery !== this.props.recordReducer.searchQuery) {
      this.saveTableFilters();
    }

    if(prevProps.queryBuilderReducer.queries !== this.props.queryBuilderReducer.queries) {
      this.saveTableFilters();
    }

    if(prevProps.queryBuilderReducer.dateRangeFilters !== this.props.queryBuilderReducer.dateRangeFilters) {
      this.saveTableFilters();
    }

    if(prevProps.queryBuilderReducer.formFields !== this.props.queryBuilderReducer.formFields) {
      this.saveTableFilters();
    }

  }

  loadSchema() {
    const { schemaReducer, getSchema, moduleName, entityName, resetTableReducer } = this.props;
    // get schema by module and entity and save it to the local state
    this.props.resetRecordState();
    if(!schemaReducer.isRequesting) {
      getSchema({ moduleName, entityName, withAssociations: true });
      resetTableReducer();
    }
  }

  private saveTableFilters() {

    const { moduleName, entityName, recordReducer, schemaReducer, recordTableReducer, queryBuilderReducer, saveFilter } = this.props;

    if(!schemaReducer.isRequesting && !recordReducer.isSearching) {

      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

      if(schema) {
        const name = `${schema.moduleName}_${schema.entityName}_filter`;
        saveFilter(name, {
          search: recordReducer.searchQuery,
          columns: recordTableReducer.columns,
          queryBuilder: queryBuilderReducer,
        });
      }
    }
  }


  render() {
    const { schemaReducer, pipelinesEnabled, moduleName, entityName, userReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema && userReducer && !canUserSearchRecord(userReducer, schema)) {

      return <Error403/>

    } else {

      return (
        <Layout className="list-view">

          <PageHeader
            style={{ border: '1px solid #dadada' }}
            className="page-header"
            title={entityName}
            subTitle={<ViewManager moduleName={moduleName} entityName={entityName}/>}
            extra={[ <TableRecordActions key={1} schema={schema}/> ]}
          >
            <RecordSearch moduleName={moduleName} entityName={entityName}/>
          </PageHeader>

          <div className="list-view-table">
            <DataTable
              schema={schema}
              moduleName={moduleName}
              entityName={entityName}
              pipelinesEnabled={pipelinesEnabled}/>
          </div>

        </Layout>
      )
    }
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  queryBuilderReducer: state.queryBuilderReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
  saveFilter: (name: string, params: any) => dispatch(saveTableFilters(name, params)),
  resetRecordState: () => dispatch(resetRecordsList()),
  resetTableReducer: () => dispatch(resetTableState()),
  updateUserRolesAndPermissions: () => dispatch(updateUserRolesAndPermissionsRequest()),
});


export default withRouter(connect(mapState, mapDispatch)(RecordListView));
