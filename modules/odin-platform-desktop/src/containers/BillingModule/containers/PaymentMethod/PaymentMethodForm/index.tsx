import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Button, Input, Modal, Space } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpPost } from '../../../../../shared/http/requests';
import { canUserCreateRecord } from '../../../../../shared/permissions/rbacRules';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';


const { PAYMENT_METHOD } = SchemaModuleEntityTypeEnums;

interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  hidden?: string[],
  alertMessage: any,
  userReducer: any,
}

class PaymentMethodForm extends React.Component<Props> {
  state = { visible: false, isLoading: false, identityName: 'GOCARDLESS', accountNumber: '', branchCode: '' };

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
      await httpPost(`BillingModule/v1.0/contact/${record.id}/payment-methods`, {
        identityName: this.state.identityName,
        bankDetails: {
          accountNumber: this.state.accountNumber,
          branchCode: this.state.branchCode,
        },
        authorizedDirectDebit: true,
      }).then(({ data }) => {

        this.setState({
          visible: false,
          isLoading: false,
        });

        if(data.data) {
          if(moment().utc().isAfter(data.data.createdAt)) {
            alertMessage({
              body: `nothing to do the customers mandate is ${getProperty(
                data.data,
                'Status',
              )}`, type: 'success',
            });
          } else {
            alertMessage({ body: 'A new mandate was created', type: 'success' });
          }
        }
      }).catch(err => alertMessage({ body: err.message, type: 'error' }));
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

    const { schemaReducer, userReducer, record } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    return (
      <div>
        <Button
          disabled={!canUserCreateRecord(userReducer, schema)}
          type="text"
          onClick={this.showModal}>
          Add Mandate
        </Button>
        <Modal
          title="Add Mandate"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Password
              placeholder="bank account #"
              onChange={(e) => this.setState({ accountNumber: e.target.value })}/>
            <Input.Password
              placeholder="sort code"
              onChange={(e) => this.setState({ branchCode: e.target.value })}/>
          </Space>

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


export default connect(mapState, mapDispatch)(PaymentMethodForm);
