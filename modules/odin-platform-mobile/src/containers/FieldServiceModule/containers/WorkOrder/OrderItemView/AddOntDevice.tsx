import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import React from 'react';
import { connect } from 'react-redux';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationCardList from '../../../../../core/recordsAssociations/AssociationCardList';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import NetworkProvisioningModal from '../../Service/NetworkActivateModal';
import NetworkCheckModal from '../../Service/NetworkCheckModal';
import NetworkDeactivateModal from '../../Service/NetworkDeactivateModal';

interface Props {
  record: DbRecordEntityTransform
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  sendConfirmation: any,
  getSchema: any,
  getAssociations: any,
}

const moduleName = 'ServiceModule';
const entityName = 'CustomerDeviceOnt';

class AddOntDevice extends React.Component<Props> {

  render() {
    const { record } = this.props;

    return (
      <>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ marginRight: 12 }}>
            <NetworkProvisioningModal record={record}/>
          </div>
          <div style={{ marginRight: 12 }}>
            <NetworkDeactivateModal record={record}/>
          </div>
          <div style={{ marginRight: 12 }}>
            <NetworkCheckModal record={record}/>
          </div>
        </div>
        <AssociationCardList
          formEnabled
          record={record}
          moduleName={moduleName}
          entityName={entityName}
          layout="horizontal"
          showRecordTitle
          propKeys={[ 'Model', 'SerialNumber' ]}/>
      </>)
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
});

export default connect(mapState, mapDispatch)(AddOntDevice);
