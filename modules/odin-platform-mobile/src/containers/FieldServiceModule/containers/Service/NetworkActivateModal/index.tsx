import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button, Modal, Spin } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpPost } from '../../../../../shared/http/requests';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';


interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  hidden?: string[],
  getAssociations: any,
  alertMessage: any,
  getSchema: any,
}


class NetworkProvisioningModal extends React.Component<Props> {
  state = { showModal: false, isLoading: false, isSubmitDisabled: false, data: undefined };

  handleCancel = () => {
    this.setState({
      showModal: false,
      isLoading: false,
      data: undefined,
    });
  };


  handleOk = async () => {
    const { record, alertMessage } = this.props;
    this.setState({
      isLoading: true,
      isSubmitDisabled: true,
    });

    await httpPost(
      `ServiceModule/v1.0/network/adtranont/data/${record.id}/activate`,
      {},
    ).then(res => {
      console.log(res);
      alertMessage({ body: 'provision successful', type: 'success' });
      this.setState({
        showModal: false,
        isLoading: false,
        isSubmitDisabled: true,
        data: res.data.data,
      });
    }).catch(err => {

      const error = err.response ? err.response.data : undefined;
      console.log('err.response.data', err.response.data);
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      this.setState({
        showModal: false,
        isLoading: false,
        isSubmitDisabled: false,
        data: error.data,
      });
    });
  };


  render() {
    const { record } = this.props;

    return (
      <>
        <Button type="primary" onClick={() => this.setState({ showModal: true })}>Activate</Button>
        <Modal
          title="Activate Request"
          visible={this.state.showModal}
          onOk={() => this.handleOk()}
          onCancel={() => this.handleCancel()}
          confirmLoading={this.state.isLoading}
          okText="Submit"
          cancelText="Cancel"
        >

          <p>{'Please confirm you would like to activate the ONT'}</p>
          <p>Item: {record?.title}</p>

          {this.state.isLoading ?
            <Spin spinning={this.state.isLoading}>
              Requesting...
            </Spin>
            : (
              <div>
                <code>
                  <pre style={{ overflow: 'auto', maxHeight: 400 }}>{JSON.stringify(this.state.data, null, 2)}</pre>
                </code>
              </div>
            )}
        </Modal>
      </>
    );
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(NetworkProvisioningModal);

