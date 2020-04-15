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

class CancelMandateForm extends React.Component<Props> {
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
        `BillingModule/v1.0/gocardless/mandates/${getProperty(record, 'ExternalRef')}/actions/cancel`,
        {},
      ).then(() => {

        this.setState({
          visible: false,
          isLoading: false,
        });

        alertMessage({ body: 'cancel mandate requested', type: 'success' });

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
          Cancel
        </Button>
        <Modal
          title="Cancel Mandate"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <Typography.Text strong>Immediately cancels a mandate and all associated cancellable payments. Any metadata
            supplied to this endpoint will be stored on the mandate cancellation event it causes.</Typography.Text>
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


export default connect(mapState, mapDispatch)(CancelMandateForm);

