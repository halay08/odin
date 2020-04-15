import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getPremiseByUdprnAndUmprnRequest } from '../../../../containers/CrmModule/containers/Premise/store/actions';
import { Error403 } from '../../../../shared/pages/403';
import { canUserGetRecord } from '../../../../shared/permissions/rbacRules';
import { getRecordFromShortListById } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import { updateUserRolesAndPermissionsRequest } from '../../../identity/store/actions';
import { addTabToHistory } from '../../../navigation/store/actions';
import { getRecordAssociationByIdRequest, IGetRecordAssociationById } from '../../../recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { getRecordAuditLogs } from '../../auditLogs/store/actions';
import { getRecordByIdRequest, IGetRecordById } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';

type PathParams = {

  url: string,
  recordId: string

}

type PropsType = RouteComponentProps<PathParams> & {

  moduleName: string,
  userReducer: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  addToHistory: any
  getSchema: any
  getRecord: any,
  getRelatedRecordById: any,
  getPremise: any,
  getAuditLogs: any,
  updateUserRolesAndPermissions: any
  entityName?: string,
  children?: any,
  match: any,

}

interface State {
}

class RecordDetailView extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);
  }

  componentDidMount(): void {
    this.fetchData();
    this.fetchUserPermissions();
  }

  fetchUserPermissions() {

    const { updateUserRolesAndPermissions } = this.props;
    updateUserRolesAndPermissions();
  }

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<State>, snapshot?: any): void {

    if(prevProps.userReducer.user === null && this.props.userReducer.user) {
      this.fetchData();
    }

    if(prevProps.entityName !== this.props.entityName) {
      this.fetchData();
    }

    // fetch data when the url changes
    if(prevProps.match.url !== this.props.match.url) {
      this.fetchData();
    }

    // update the navigation history tab when the record is loaded
    if(prevProps.recordReducer.isRequesting !== this.props.recordReducer.isRequesting) {
      this.handleRouteChange();
    }
  }

  private getTabTitle() {
    const { match, recordReducer } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    if(record) {
      if(record.title && record.recordNumber) {

        return `${record.recordNumber} ${record.title}`;

      } else if(record.title && !record.recordNumber) {

        return record.title;

      } else if(record.type && record.recordNumber) {

        return `${record.recordNumber} ${record.type}`;

      } else if(record.type && !record.recordNumber) {

        return record.type;

      } else if(record.recordNumber) {

        return record.recordNumber;

      } else {

        return match.url

      }
    } else {
      return match.url
    }
  }

  handleRouteChange() {
    const { addToHistory, match, recordReducer } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    if(record) {
      addToHistory({ path: match.url, title: this.getTabTitle() });
    }
  }

  fetchData() {
    const {
      match,
      getSchema,
      getRecord,
      getRelatedRecordById,
      getAuditLogs,
      getPremise,
      moduleName,
      entityName,
    } = this.props;

    const recordId = match?.params?.recordId;
    const dbRecordAssociationId = match?.params?.dbRecordAssociationId;
    const udprn = match?.params?.udprn;
    const umprn = match?.params?.umprn;

    let entity = entityName ? entityName : match?.params?.entityName;

    getSchema({ moduleName, entityName: entity, withAssociations: true }, (results: SchemaEntity) => {
      if(results.entityName === 'Premise') {
        getPremise({ udprn, umprn });
      } else if(dbRecordAssociationId) {
        getRelatedRecordById({ schema: results, recordId, dbRecordAssociationId });
        getAuditLogs({ schema: results, recordId });
      } else {
        getRecord({ schema: results, recordId });
        getAuditLogs({ schema: results, recordId });
      }
    });
  }

  render() {
    const { schemaReducer, moduleName, entityName, userReducer, match } = this.props;
    let entity = entityName ? entityName : match.params.entityName;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entity);

    if(schema && userReducer && !canUserGetRecord(userReducer, schema)) {
      return <Error403/>
    } else {
      return (
        <>
          {this.props.children}
        </>
      )
    }

  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
  getRelatedRecordById: (payload: IGetRecordAssociationById) => dispatch(getRecordAssociationByIdRequest(payload)),
  getPremise: (payload: any) => dispatch(getPremiseByUdprnAndUmprnRequest(payload)),
  addToHistory: (params: { path: string, title: string }) => dispatch(addTabToHistory(params)),
  getAuditLogs: (params: any) => dispatch(getRecordAuditLogs(params)),
  updateUserRolesAndPermissions: () => dispatch(updateUserRolesAndPermissionsRequest()),
});

export default withRouter(connect(mapState, mapDispatch)(RecordDetailView));
