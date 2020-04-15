import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Col, Layout, Popconfirm, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MailActivityFeed from '../../../../../core/notifications/components/MailActivityFeed';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import AssociationDescriptionList from '../../../../../core/recordsAssociations/components/AssociationDescriptionList';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import InvoiceTakePayment from '../TakePayment';
import VoidInvoice from '../VoidInvoice';

const { CRM_MODULE, BILLING_MODULE, ORDER_MODULE, PRODUCT_MODULE } = SchemaModuleTypeEnums;
const { CONTACT, ORDER, INVOICE_ITEM, DISCOUNT, TRANSACTION, NOTE } = SchemaModuleEntityTypeEnums;

const BILLING_ADJUSTMENT = 'BillingAdjustment';

interface Props {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
  sendConfirmation: any,
}

interface State {
}


class InvoiceDetailView extends React.Component<Props, State> {

  render() {

    const { schemaReducer, recordReducer, sendConfirmation, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <RecordProperties columnLayout="vertical" record={record} columns={2}/>
            </DetailPanelLeft>

            <AssociationDescriptionList
              title="Order"
              record={record}
              moduleName={ORDER_MODULE}
              entityName={ORDER}
              layout="vertical"
              showRecordTitle
              addRecordTitleLink
              disableListActions
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'TotalPrice',
              ]}/>
            <AssociationDescriptionList
              title="Contact"
              record={record}
              moduleName={CRM_MODULE}
              entityName={CONTACT}
              layout="vertical"
              showRecordTitle
              addRecordTitleLink
              disableListActions
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'EmailAddress',
                'Phone',
              ]}/>

          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-center-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="Order"
              extra={<div style={{ display: 'flex' }}>
                <div style={{ marginRight: 14 }}>
                  <Popconfirm
                    title="Are you sure you want to send the invoice confirmation?"
                    onConfirm={() => sendConfirmation(`BillingModule/v1.0/invoices/${record.id}/email/SENDGRID_INVOICE_NEW`)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="primary">Send Invoice</Button>
                  </Popconfirm>
                </div>
                <div style={{ marginRight: 14 }}>
                  <InvoiceTakePayment record={record} hidden={[ NOTE ]}/>
                </div>
                <VoidInvoice record={record}/>
              </div>}
              tabList={[
                {
                  key: 'Summary',
                  tab: 'Summary',
                },
                {
                  key: 'Contact',
                  tab: 'Contact',
                },
                {
                  key: 'Communitcation',
                  tab: 'Communitcation',
                },
              ]}
              contentList={{
                Summary: <div>
                  <AssociationDataTable
                    title={INVOICE_ITEM}
                    record={record}
                    moduleName={BILLING_MODULE}
                    entityName={INVOICE_ITEM}/>

                  <AssociationDataTable
                    title={TRANSACTION}
                    record={record}
                    moduleName={BILLING_MODULE}
                    entityName={TRANSACTION}/>

                  <AssociationDataTable
                    title={DISCOUNT}
                    record={record}
                    moduleName={PRODUCT_MODULE}
                    entityName={DISCOUNT}/>

                  <AssociationDataTable
                    title={BILLING_ADJUSTMENT}
                    record={record}
                    moduleName={ORDER_MODULE}
                    entityName={BILLING_ADJUSTMENT}/>

                </div>,
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                Communitcation: <MailActivityFeed record={record}/>,
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-right-panel">
            <CardWithTabs
              title="Updates"
              defaultTabKey="Notes"
              tabList={[
                {
                  key: 'Notes',
                  tab: 'Notes',
                },
                {
                  key: 'Activity',
                  tab: 'Activity',
                },
              ]}
              contentList={{
                Notes: <NoteForm record={record}/>,
                Activity: <ActivityFeed/>,
              }}
            />
          </div>
        </Col>

      </Row>
    </Layout>)
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});


export default withRouter(connect(mapState, mapDispatch)(InvoiceDetailView));
