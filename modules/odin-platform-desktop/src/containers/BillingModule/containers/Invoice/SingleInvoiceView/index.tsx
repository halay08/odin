import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Descriptions, Popconfirm, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import { getRecordByIdRequest, IGetRecordById } from '../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { changeToCapitalCase } from '../../../../../shared/utilities/dataTransformationHelpers';
import { getBrowserPath, getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import InvoiceTakePayment from '../TakePayment';

interface Props {
  invoice: DbRecordEntityTransform,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  getRecordById: any,
  sendConfirmation: any,
}

const { BILLING_MODULE } = SchemaModuleTypeEnums;
const { NOTE, INVOICE_ITEM, TRANSACTION } = SchemaModuleEntityTypeEnums;

class SingleInvoiceView extends React.Component<Props> {

  componentDidMount() {
    this.loadInvoice();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.invoice !== this.props.invoice) {
      this.loadInvoice();
    }
  }


  private loadInvoice() {
    const { invoice, schemaReducer, getRecordById } = this.props;
    if(invoice) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, invoice.schemaId);
      if(invoice && schema) {
        getRecordById({ schema, recordId: invoice.id });
      }
    }
    return;
  }


  render() {
    const { recordReducer, invoice, sendConfirmation } = this.props;

    const record = getRecordFromShortListById(recordReducer.shortList, invoice?.id);

    return (
      <Card type="inner" title={record?.recordNumber}
            style={{ marginBottom: 10, maxWidth: 1200, width: '100%', minWidth: 500 }}
            extra={<div style={{ display: 'flex' }}>
              <div style={{ marginRight: 18 }}>
                <Link to={getBrowserPath(record)} component={Typography.Link}>View Invoice</Link>
              </div>
              <div style={{ marginRight: 18 }}>
                <Popconfirm
                  title="Are you sure you want to send the invoice confirmation?"
                  onConfirm={() => sendConfirmation(`BillingModule/v1.0/invoices/${record.id}/email/SENDGRID_INVOICE_NEW`)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button type="primary">Send Invoice</Button>
                </Popconfirm>
              </div>
              <div>
                <InvoiceTakePayment record={record} hidden={[ NOTE ]}/>
              </div>
            </div>}>

        <Descriptions style={{ marginBottom: 24 }} column={1} layout="horizontal" size="small">
          <Descriptions.Item key={0} label={changeToCapitalCase('Status')}>{getProperty(
            record,
            'Status',
          )}</Descriptions.Item>
          <Descriptions.Item key={0} label={changeToCapitalCase('IssuedDate')}>{getProperty(
            record,
            'IssuedDate',
          )}</Descriptions.Item>
          <Descriptions.Item key={0} label={changeToCapitalCase('DueDate')}>{getProperty(
            record,
            'DueDate',
          )}</Descriptions.Item>
          <Descriptions.Item key={0} label={changeToCapitalCase('BillingTerms')}>{getProperty(
            record,
            'BillingTerms',
          )}</Descriptions.Item>
        </Descriptions>

        <AssociationDataTable
          title={INVOICE_ITEM}
          record={record}
          moduleName={BILLING_MODULE}
          entityName={INVOICE_ITEM}/>

        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <div>
              <div><strong>Subtotal: </strong>{getProperty(record, 'Subtotal')}</div>
              <div><strong>TotalDiscounts: </strong>{getProperty(record, 'TotalDiscounts')}</div>
              <div><strong>TotalTaxAmount: </strong>{getProperty(record, 'TotalTaxAmount')}</div>
              <div><strong>TotalDue: </strong>{getProperty(record, 'TotalDue')}</div>
              <div><strong>Balance: </strong>{getProperty(record, 'Balance')}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, width: '80%' }}>
          <AssociationDataTable
            title={TRANSACTION}
            record={record}
            moduleName={BILLING_MODULE}
            entityName={TRANSACTION}/>
        </div>

      </Card>
    )
  }

}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default connect(mapState, mapDispatch)(SingleInvoiceView);
