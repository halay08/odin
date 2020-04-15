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

class ReinstateMandateForm extends React.Component<Props> {
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
        `BillingModule/v1.0/gocardless/mandates/${getProperty(record, 'ExternalRef')}/actions/reinstate`,
        {},
      ).then(() => {

        this.setState({
          visible: false,
          isLoading: false,
        });

        alertMessage({ body: 'reinstate mandate requested', type: 'success' });

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
          disabled={[ 'submitted', 'active' ].includes(getProperty(record, 'Status'))}
          style={{ marginLeft: 4, marginRight: 4 }}
          type="primary"
          onClick={this.showModal}>
          Reinstate
        </Button>
        <Modal
          title="Reinstate Mandate"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <ul>
            <li><Typography.Text>Reinstates a cancelled or expired mandate to the banks.</Typography.Text></li>
            <li><Typography.Text>Mandates can be resubmitted up to 10 times.</Typography.Text></li>
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


export default connect(mapState, mapDispatch)(ReinstateMandateForm);

