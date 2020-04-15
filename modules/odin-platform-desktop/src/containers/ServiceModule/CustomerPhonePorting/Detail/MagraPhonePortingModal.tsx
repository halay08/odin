import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../core/schemas/store/reducer';
import { httpPost } from '../../../../shared/http/requests';
import { displayMessage } from '../../../../shared/system/messages/store/reducers';


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


class MagraPhonePortingModal extends React.Component<Props> {
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
      `ServiceModule/v1.0/voice/magra/order/${record.id}`,
      {},
    ).then(res => {
      console.log(res);
      alertMessage({ body: 'successful', type: 'success' });
      this.setState({
        showModal: false,
        isLoading: false,
        data: res.data.data,
      });

    }).catch(err => {

      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      this.setState({
        showModal: false,
        isLoading: false,
      })
    });
  };


  render() {

    return (
      <>
        <Button type="primary" onClick={() => this.setState({ showModal: true })}>New Order</Button>
        <Modal
          title="Porting Request"
          visible={this.state.showModal}
          onOk={() => this.handleOk()}
          onCancel={() => this.handleCancel()}
          confirmLoading={this.state.isLoading}
          okText="Submit"
          cancelText="Cancel"
        >
          <p>{'Please confirm you would like to submit a porting request to Magrathea'}</p>
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


export default connect(mapState, mapDispatch)(MagraPhonePortingModal);

