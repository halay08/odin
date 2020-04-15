import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Modal, Spin } from 'antd';
import moment from 'moment';
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


class VoiceActivateModal extends React.Component<Props> {
  state = { showModal: false, isLoading: false, data: undefined };

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
    });

    await httpPost(
      `ServiceModule/v1.0/network/adtranont/voice/${record.id}/activate`,
      {},
    ).then(res => {
      console.log(res);
      alertMessage({ body: 'voice activation successful', type: 'success' });
      this.setState({
        isLoading: false,
        data: res.data.data,
      })
    }).catch(err => {

      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
    });
  };


  render() {
    const { record } = this.props;

    return (
      <>
        <Button type="primary" ghost onClick={() => this.setState({ showModal: true })}>Activate</Button>
        <Modal
          title="Activate Voice Request"
          visible={this.state.showModal}
          onOk={() => this.handleOk()}
          onCancel={() => this.handleCancel()}
          confirmLoading={this.state.isLoading}
          okText="Submit"
          cancelText="Cancel"
        >

          <p>{'Please confirm you would like to activate the voice service on the OLT'}</p>
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

  private isItemInvoiceAble(item: DbRecordEntityTransform) {
    // Disables invoicing anything more than 2 months from today
    return moment(getProperty(item, 'NextBillingDate'), 'YYYY-MM-DD').diff(
      moment().format('YYYY-MM-DD'),
      'days',
    ) < 31;
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


export default connect(mapState, mapDispatch)(VoiceActivateModal);

