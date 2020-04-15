import { PlusCircleOutlined } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Checkbox, List, Modal } from 'antd';
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
import { canUserCreateRecord } from '../../../../../shared/permissions/rbacRules';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';

const { ORDER_MODULE } = SchemaModuleTypeEnums;
const { ORDER, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  hidden?: string[],
  getAssociations: any,
  alertMessage: any,
  getSchema: any,
  userReducer: any,
}

class SplitOrder extends React.Component<Props> {
  state = { visible: false, isLoading: false, selected: [] };

  showModal = () => {
    this.setState({
      visible: true,
    });
    this.getOrderItems();
  };

  addRemoveItem = (item: DbRecordEntityTransform) => {
    if(this.state.selected.find(elem => elem === item.id)) {
      // remove the item
      this.setState({
        selected: this.state.selected.filter(elem => elem !== item.id),
      });
    } else {
      this.setState(prevState => ({
        // @ts-ignore
        selected: [ ...prevState.selected, ...[ item.id ] ],
      }));
    }
  };


  handleOk = async (e: any) => {
    const { schemaReducer, record, alertMessage } = this.props;
    this.setState({
      isLoading: true,
    });

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    if(record && schema) {

      const body = this.state.selected.map(elem => ({
        recordId: elem,
      }));

      await httpPost(
        `${ORDER_MODULE}/v1.0/orders/${record.id}/split`,
        body,
      ).then(res => {

        this.getRecordAssociations();
        alertMessage({ body: 'order successfully split', type: 'success' });

      }).catch(err => {
        const error = err.response ? err.response.data : undefined;
        alertMessage({ body: error && error.message || 'error generating work order', type: 'error' });
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

  private getOrderItems() {
    const { getAssociations, record, getSchema } = this.props;
    if(record) {
      getSchema({ moduleName: ORDER_MODULE, entityName: ORDER_ITEM }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: ORDER_ITEM,
          schema: result,
          entities: [ ORDER_ITEM ],
        });
      });
    }
    return;
  }

  private getRecordAssociations() {
    const { getAssociations, record, getSchema } = this.props;
    if(record) {
      getSchema({ moduleName: ORDER_MODULE, entityName: 'SplitOrder' }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: 'SplitOrder',
          schema: result,
          entities: [ 'SplitOrder' ],
        });
      });
    }
    return;
  }

  render() {
    const { record, recordAssociationReducer, schemaReducer, userReducer } = this.props;
    const associationKey = `${record?.id}_${ORDER_ITEM}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);


    return (
      <div>
        <Button
          type="text"
          icon={<PlusCircleOutlined/>}
          onClick={this.showModal}
          disabled={schema ? !canUserCreateRecord(userReducer, schema) : false}
        >
          Split Order
        </Button>
        <Modal
          title="Split Order"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          confirmLoading={this.state.isLoading}
        >
          <List
            size="small"
            header={<div>Items</div>}
            bordered
            dataSource={associationObj && associationObj[ORDER_ITEM] ? associationObj[ORDER_ITEM].dbRecords : []}
            renderItem={(item: DbRecordEntityTransform) =>
              <List.Item
                actions={[ <Checkbox onChange={() => this.addRemoveItem(item)}>Add</Checkbox> ]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={getProperty(item, 'Description')}
                />
                <div>{getProperty(item, 'TotalPrice')}</div>
              </List.Item>
            }
          />
        </Modal>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  userReducer: state.userReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(SplitOrder);

