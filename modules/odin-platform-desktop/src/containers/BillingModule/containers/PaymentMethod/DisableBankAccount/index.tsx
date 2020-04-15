import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Modal, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpPost } from '../../../../../shared/http/requests';
import { canUserDeleteRecord } from '../../../../../shared/permissions/rbacRules';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';


interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  userReducer: any,
  alertMessage: any,
  hidden?: string[],
}

class DisableBankAccountForm extends React.Component<Props> {
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
        `BillingModule/v1.0/gocardless/bank-accounts/${getProperty(record, 'BankAccountId')}/actions/disable`,
        {},
      ).then(() => {

        this.setState({
          visible: false,
          isLoading: false,
        });

        alertMessage({ body: 'disable bank account requested', type: 'success' });

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

    const { userReducer, schemaReducer, record } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (
      <div>
        <Button
          disabled={!canUserDeleteRecord(userReducer, schema, record)}
          style={{ marginLeft: 4, marginRight: 4 }}
          danger
          onClick={this.showModal}>
          Disable Bank Account
        </Button>
        <Modal
          title="Disable Bank Account"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <ul>
            <li><Typography.Text>Immediately cancels all associated mandates and cancellable
              payments.</Typography.Text>
            </li>
            <li><Typography.Text>A disabled bank account can be re-enabled by creating a new bank account resource with
              the same details.</Typography.Text></li>
          </ul>
        </Modal>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(DisableBankAccountForm);

