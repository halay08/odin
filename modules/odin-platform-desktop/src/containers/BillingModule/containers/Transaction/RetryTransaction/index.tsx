import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Modal, Typography } from 'antd';
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

class RetryTransactionForm extends React.Component<Props> {
  state = { visible: false, isLoading: false, amount: 0, refundId: null };

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
        `BillingModule/v1.0/gocardless/payments/${getProperty(record, 'ExternalRef')}/actions/retry`,
        {},
      ).then(() => {

        this.setState({
          visible: false,
          isLoading: false,
        });

        alertMessage({ body: 'retry transaction requested', type: 'success' });

      }).catch(err => {
        this.setState({
          isLoading: false,
        });
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
        <Button
          disabled={getProperty(record, 'Status') !== 'failed'}
          style={{ marginLeft: 4, marginRight: 4 }}
          type="primary" onClick={this.showModal}>
          Retry
        </Button>
        <Modal
          title="Retry Transaction"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <ul>
            <li><Typography.Text>Note: Only failed payments can be retried</Typography.Text></li>
            <li><Typography.Text>Please confirm that you would like to submit a retry request to
              gocardless.</Typography.Text></li>
            <li><Typography.Text>Payments can be retried up to 3 times.</Typography.Text></li>
          </ul>
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


export default connect(mapState, mapDispatch)(RetryTransactionForm);

