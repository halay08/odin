import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Input, Modal, Space } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpPost } from '../../../../../shared/http/requests';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';


interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  alertMessage: any,
  hidden?: string[],
}

class TransactionRefundForm extends React.Component<Props> {
  state = { visible: false, isLoading: false, amount: 0, refundId: null };

  showModal = () => {

    const { record } = this.props;

    this.setState({
      visible: true,
      amount: getProperty(record, 'Amount'),
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
        `BillingModule/v1.0/transactions/${record.id}/refund`,
        {
          'amount': this.state.amount,
          'refundId': this.state.refundId,
        },
      ).then(() => {

        this.setState({
          visible: false,
          isLoading: false,
        });

        alertMessage({ body: 'refund transaction created', type: 'success' });

      }).catch(err => {

        this.setState({
          isLoading: false,
        });

        console.log('err', err);

        alertMessage({ body: err.message, type: 'error' })
      });
    }
  };

  handleCancel = (e: any) => {
    console.log(e);
    this.setState({
      visible: false,
      isLoading: false,
    });
  };

  render() {

    const { record } = this.props;

    return (
      <div>
        <Button style={{ marginLeft: 4, marginRight: 4 }} type="primary" onClick={this.showModal}>
          Refund
        </Button>

        <Modal
          title="Refund Transaction"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              width={300}
              type="number"
              placeholder="amount"
              value={this.state.amount}
              onChange={(e) => this.setState({ amount: e.target.value })}/>
            {/*<Input*/}
            {/*  width={300}*/}
            {/*  placeholder="refund Id"*/}
            {/*  onChange={(e) => this.setState({ refundId: e.target.value })}/>*/}
          </Space>

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
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(TransactionRefundForm);

