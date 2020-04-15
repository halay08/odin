import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getPremiseByUdprnAndUmprnRequest } from '../../../../containers/CrmModule/containers/Premise/store/actions';
import { getRecordFromShortListById } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import { addUrlPathToHistory } from '../../../navigation/store/actions';
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

  identityReducer: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  moduleName: string,
  entityName?: string,
  match?: any,
  children?: JSX.Element,
  addToHistory: any
  getSchema: any
  getRecord: any,
  getRelatedRecordById: any,
  getPremise: any,
  getAuditLogs: any,

}

interface State {
}

class RecordDetailView extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);
  }

  componentDidMount(): void {
    this.fetchData();
  }

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<State>, snapshot?: any): void {

    const { schemaReducer, entityName, moduleName, match } = this.props;

    let entity = entityName ? entityName : match.params.entityName;

    if(prevProps.entityName !== this.props.entityName) {
      this.fetchData();
    }

    // fetch data when the url changes
    if(prevProps.match.url !== this.props.match.url) {
      this.fetchData();
    }

    if(prevProps.schemaReducer.isRequesting !== this.props.schemaReducer.isRequesting) {
      const schema = getSchemaFromShortListByModuleAndEntity(
        schemaReducer.shortList,
        moduleName,
        entity,
      );
      if(!schema) {
        this.fetchData();
      }
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
    const { match, schemaReducer, recordReducer, getSchema, getRecord, getRelatedRecordById, getAuditLogs, getPremise, moduleName, entityName } = this.props;

    const parentRecordId = match.params.parentRecordId;
    const recordId = match.params.recordId;
    const dbRecordAssociationId = match.params.dbRecordAssociationId;
    const udprn = match.params.udprn;
    const umprn = match.params.umprn;

    let entity = entityName ? entityName : match.params.entityName;



    getSchema({ moduleName, entityName: entity }, (results: SchemaEntity) => {
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
    return (
      <>
        {this.props.children}
      </>
    );
  }
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
  getRelatedRecordById: (payload: IGetRecordAssociationById) => dispatch(getRecordAssociationByIdRequest(payload)),
  getPremise: (payload: any) => dispatch(getPremiseByUdprnAndUmprnRequest(payload)),
  addToHistory: (params: { path: string, title: string }) => dispatch(addUrlPathToHistory(params)),
  getAuditLogs: (params: any) => dispatch(getRecordAuditLogs(params)),
});

export default withRouter(connect(mapState, mapDispatch)(RecordDetailView));
