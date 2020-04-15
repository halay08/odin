import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Modal } from 'antd';
import Title from 'antd/lib/typography/Title';
import React from 'react';
import { connect } from 'react-redux';
import { getRecordByIdRequest, IGetRecordById } from '../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpPost } from '../../../../../shared/http/requests';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';


interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  hidden?: string[]
  getAssociations: any,
  alertMessage: any,
  getRecordById: any
}

class InvoiceTakePayment extends React.Component<Props> {
  state = { visible: false, isLoading: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = async (e: any) => {
    const { schemaReducer, record, alertMessage } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    this.setState({
      isLoading: true,
    });
    if(record && schema) {
      await httpPost(
        `BillingModule/v1.0/transactions/invoices/${record.id}`,
        {},
      ).then(res => {
       
        this.setState({
          isLoading: false,
        });
        alertMessage({ body: 'payment transaction created', type: 'success' });

      }).catch(err => {

        const error = err.response ? err.response.data : undefined;
        alertMessage({ body: error && error.message || 'error processing payment', type: 'error' });

      });

      this.setState({
        visible: false,
        isLoading: false,
      });
    }
  };

  handleCancel = (e: any) => {
    this.setState({
      visible: false,
      isLoading: false,
    });
  };


  render() {
    const { record } = this.props;
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Process Payment
        </Button>
        <Modal
          title="Confirm Payment"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <Title>£ {getProperty(record, 'TotalDue')}</Title>
        </Modal>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(InvoiceTakePayment);

