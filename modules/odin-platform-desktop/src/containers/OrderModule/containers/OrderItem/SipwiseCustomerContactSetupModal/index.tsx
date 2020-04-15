import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
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


class SipwiseCustomerContactSetupModal extends React.Component<Props> {
  state = { showModal: false, isInitializing: false, isLoading: false, data: undefined };

  initializeModal() {

    this.setState({
      showModal: true,
      isInitializing: true,
    });

    const { record, getSchema, getAssociations } = this.props;

    const moduleName = 'OrderModule';
    const entityName = 'Order';

    getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
      getAssociations({
        recordId: record.id,
        key: entityName,
        schema: result,
        entities: [ entityName ],
      }, () => {
        this.setState({
          showModal: true,
          isInitializing: false,
        });
      });
    });
  }

  handleCancel = () => {
    this.setState({
      showModal: false,
      isLoading: false,
      data: undefined,
    });
  };


  handleOk = async () => {
    const { record, recordAssociationReducer, alertMessage } = this.props;

    // get the orderItem Order
    const associationKey = `${record?.id}_Order`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    const orderRecords = associationObj['Order'].dbRecords;

    if(orderRecords) {

      this.setState({
        isLoading: true,
      });

      await httpPost(
        `ServiceModule/v1.0/voice/sipwise/flows/${orderRecords[0].id}/setup`,
        {},
      ).then(res => {
        console.log(res);
        alertMessage({ body: 'sipwise customer setup successfully', type: 'success' });
        this.setState({
          isLoading: false,
          data: res.data.data,
        })
      }).catch(err => {
        this.setState({
          showModal: false,
          isLoading: false,
        });
        const error = err.response ? err.response.data : undefined;
        alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      });
    }
  };


  render() {
    const { record } = this.props;

    return (
      <>
        <Button type="primary" ghost onClick={() => this.initializeModal()}>Setup Sipwise</Button>
        <Modal
          title="Setup Sipwise Request"
          visible={this.state.showModal}
          onOk={() => this.handleOk()}
          onCancel={() => this.handleCancel()}
          maskClosable
          confirmLoading={this.state.isLoading || this.state.isInitializing}
          okText="Submit"
          cancelText="Cancel"
        >

          {this.state.isInitializing ? <Spin spinning={this.state.isLoading}>initializing...</Spin> :
            <div>
              <p>{'Please confirm you would like to Setup a sipwsie profile for the customer'}</p>
              <ol>
                <li>Create Customer Contact</li>
                <li>Create Customer</li>
                <li>Create Subscriber</li>
              </ol>
              <p>Item: {record?.title}</p>

              {this.state.isLoading ?
                <Spin spinning={this.state.isLoading}>
                  setting up profile...
                </Spin>
                : (
                  <div>
                    <code>
                      <pre style={{ overflow: 'auto', maxHeight: 400 }}>{JSON.stringify(this.state.data, null, 2)}</pre>
                    </code>
                  </div>
                )}
            </div>
          }
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
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(SipwiseCustomerContactSetupModal);

