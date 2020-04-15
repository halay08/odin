import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Checkbox, List, Typography } from 'antd';
import moment from 'moment';
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
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import { OrderCalculations } from '../../../helpers/OrderCalculations';


interface Props {
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  hidden?: string[],
  getAssociations: any,
  alertMessage: any,
  getSchema: any,
  onStepComplete: any
}

const { ORDER_MODULE, BILLING_MODULE } = SchemaModuleTypeEnums;
const { ORDER_ITEM, INVOICE, DISCOUNT } = SchemaModuleEntityTypeEnums;

class OrderGenerateInvoice extends React.Component<Props> {
  state = { visible: false, isLoading: false, selected: [], currentStep: 1 };

  componentDidMount() {
    this.getOrderItems();
    this.getRecordAssociations();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.getOrderItems();
      this.getRecordAssociations();
    }

    // if(prevProps.recordAssociationReducer.isRequesting !== this.props.recordAssociationReducer.isRequesting) {
    //   this.getOrderItems();
    // }
  }

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


  handleOk = async () => {
    const { schemaReducer, record, alertMessage, onStepComplete } = this.props;
    this.setState({
      isLoading: true,
    });

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    if(record && schema) {

      const body = this.state.selected.map(elem => ({
        recordId: elem,
      }));

      await httpPost(
        `BillingModule/v1.0/invoices/orders/${record.id}`,
        body,
      ).then(res => {
        console.log(res);
        this.getRecordAssociations();
        alertMessage({ body: 'invoice created', type: 'success' });
        onStepComplete();
        // history.push(`/OrderModule/Order/${record.id}`);

      }).catch(err => {

        const error = err.response ? err.response.data : undefined;
        alertMessage({ body: error && error.message || 'error generating invoice', type: 'error' });
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
      getSchema({ moduleName: BILLING_MODULE, entityName: INVOICE }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: INVOICE,
          schema: result,
          entities: [ INVOICE ],
        });
      });
    }
    return;
  }

  private selectedItemTotals() {

    const { recordAssociationReducer, record } = this.props;

    const associationKey = `${record?.id}_${ORDER_ITEM}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    if(associationObj) {
      const selectedItems = this.state.selected
      const orderItems = associationObj[ORDER_ITEM].dbRecords;

      if(orderItems) {
        // @ts-ignore
        const filteredOrderItems = orderItems.filter((elem: DbRecordEntityTransform) => selectedItems.includes(elem.id));

        return {
          Subtotal: OrderCalculations.computeOrderSubtotal(filteredOrderItems),
          TotalDiscounts: OrderCalculations.computeOrderTotalDiscounts(filteredOrderItems, record),
          TotalTaxAmount: OrderCalculations.computeOrderTotalTax(filteredOrderItems, record),
          TotalPrice: OrderCalculations.computeTotalDue(filteredOrderItems, record),
        }
      } else {
        return {
          Subtotal: '0.00',
          TotalDiscounts: '0.00',
          TotalTaxAmount: '0.00',
          TotalPrice: '0.00',
        }
      }
    } else {
      return {
        Subtotal: '0.00',
        TotalDiscounts: '0.00',
        TotalTaxAmount: '0.00',
        TotalPrice: '0.00',
      }
    }
  }

  render() {
    const { record, recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${ORDER_ITEM}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    return (
      <Card type="inner" title="Order Items" style={{ marginBottom: 10, width: '100%', minWidth: 500 }}
            extra={<Button type="primary" onClick={() => this.handleOk()}>Generate Invoice</Button>}>
        <List
          size="small"
          loading={this.state.isLoading}
          dataSource={associationObj && associationObj[ORDER_ITEM] ? associationObj[ORDER_ITEM].dbRecords : []}
          renderItem={(item: DbRecordEntityTransform) =>
            <List.Item actions={[ <Checkbox onChange={() => this.addRemoveItem(item)}>Add</Checkbox> ]}>
              <List.Item.Meta
                title={item.title}
                description={
                  <div style={{ display: 'flex', marginLeft: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography.Text style={{ marginRight: 24 }}><strong>Billing start date: </strong> {getProperty(
                        item,
                        'BillingStartDate',
                      )}</Typography.Text>
                      <Typography.Text style={{ marginRight: 24 }}><strong>Next invoice date: </strong>{getProperty(
                        item,
                        'NextInvoiceDate',
                      )}</Typography.Text>
                      <Typography.Text style={{ marginRight: 24 }}><strong>Next billing date: </strong>{getProperty(
                        item,
                        'NextBillingDate',
                      )}</Typography.Text>
                    </div>
                    <Typography.Text style={{ marginRight: 24 }}><strong> Unit Price </strong>{getProperty(
                      item,
                      'UnitPrice',
                    )}</Typography.Text>
                  </div>
                }
              />
            </List.Item>
          }
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <div>
            <div><strong>Subtotal: </strong>{this.selectedItemTotals()['Subtotal']}</div>
            <div><strong>Total Discounts: </strong>{this.selectedItemTotals()['TotalDiscounts']}</div>
            <div><strong>Total TaxAmount: </strong>{this.selectedItemTotals()['TotalTaxAmount']}</div>
            <div><strong>Total Price: </strong>{this.selectedItemTotals()['TotalPrice']}</div>
          </div>
        </div>
      </Card>
    );
  }

  private isItemInvoiceAble(item: DbRecordEntityTransform) {
    // Disables invoicing anything more than 2 months from today
    return moment(getProperty(item, 'NextBillingDate'), 'YYYY-MM-DD').diff(
      moment().format('YYYY-MM-DD'),
      'days',
    ) < 31;
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


export default connect(mapState, mapDispatch)(OrderGenerateInvoice);

