import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Col, Descriptions, Layout, Popconfirm, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MailActivityFeed from '../../../../../core/notifications/components/MailActivityFeed';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import Pipeline from '../../../../../core/records/components/Pipeline/Pipeline';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import AssociationDescriptionList from '../../../../../core/recordsAssociations/components/AssociationDescriptionList';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import OrderSummaryCard from './../OrderSummaryCard/index';

interface Props {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
  sendConfirmation: any,
  recordAssociationReducer: any
}


const { PRODUCT_MODULE, ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { DISCOUNT, ADDRESS, CONTACT, INVOICE, ORDER_ITEM, WORK_ORDER, ACCOUNT } = SchemaModuleEntityTypeEnums;

class OrderDetailView extends React.Component<Props> {

  render() {
    const { schemaReducer, recordReducer, match, sendConfirmation } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <Descriptions
                style={{ marginBottom: 14 }}
                size="small"
                layout="horizontal"
                column={1}
              >
                <Descriptions.Item label={'Issued Date'}>{getProperty(
                  record,
                  'IssuedDate',
                )}</Descriptions.Item>
                <Descriptions.Item label={'Subtotal'}>{getProperty(
                  record,
                  'Subtotal',
                )}</Descriptions.Item>
                <Descriptions.Item label={'Total Discounts'}>{getProperty(
                  record,
                  'TotalDiscounts',
                )}</Descriptions.Item>
                <Descriptions.Item label={'Total Taxes'}>{getProperty(
                  record,
                  'TotalTaxAmount',
                )}</Descriptions.Item>
                <Descriptions.Item label={'Total Price'}>{getProperty(
                  record,
                  'TotalPrice',
                )}</Descriptions.Item>
                <Descriptions.Item label={'Contract Type'}>{getProperty(
                  record,
                  'ContractType',
                )}</Descriptions.Item>
              </Descriptions>

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

              <AssociationDescriptionList
                title="Address"
                record={record}
                moduleName={CRM_MODULE}
                entityName={ADDRESS}
                layout="vertical"
                showRecordTitle
                addRecordTitleLink
                disableListActions
                recordKeys={[
                  'title',
                ]}
                propKeys={[
                  'Type',
                  'SalesStatus',
                ]}/>
            </DetailPanelLeft>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={16}>
          <div className="record-detail-left-panel">
            <Pipeline className="record-pipeline" record={record} redirectRules={{
              OrderStageActive: {
                redirectUrl: `/OrderModule/Order/${record?.id}/activate`,
                redirectMessage: 'You are about to be redirected to activate the Order,would you would like to proceed?',
              },
            }}/>
            <CardWithTabs
              title="Options"
              defaultTabKey="Order"
              tabList={[
                {
                  key: 'Summary',
                  tab: 'Summary',
                },
                {
                  key: 'Contract',
                  tab: 'Contract',
                },
                {
                  key: 'Billing',
                  tab: 'Billing',
                },
                {
                  key: 'Account',
                  tab: 'Account',
                },
                {
                  key: 'Address',
                  tab: 'Address',
                },
                {
                  key: 'Contact',
                  tab: 'Contact',
                },
                {
                  key: 'SplitOrder',
                  tab: 'Split Order',
                },
                {
                  key: 'Communication',
                  tab: 'Communications',
                },
              ]}
              contentList={{
                Summary: <div>
                  <OrderSummaryCard record={record}/>
                </div>,
                Contract: <div>
                  <Descriptions
                    title={'Contract Dates'}
                    size="small"
                    layout="horizontal"
                    column={1}
                  >
                    <Descriptions.Item label={'Issued'}>{getProperty(
                      record,
                      'IssuedDate',
                    )}</Descriptions.Item>
                    <Descriptions.Item label={'Billing Start'}>{getProperty(
                      record,
                      'BillingStartDate',
                    )}</Descriptions.Item>
                    <Descriptions.Item label={'Contract Start'}>{getProperty(
                      record,
                      'ContractStartDate',
                    )}</Descriptions.Item>
                    <Descriptions.Item label={'Contract End'}>{getProperty(
                      record,
                      'ContractEndDate',
                    )}</Descriptions.Item>
                    <Descriptions.Item label={'Contract Renewals'}>{getProperty(
                      record,
                      'ContractRenewalCount',
                    )}</Descriptions.Item>
                  </Descriptions>
                </div>,
                Billing: <div>
                  <AssociationDataTable
                    title={INVOICE}
                    record={record}
                    moduleName={BILLING_MODULE}
                    entityName={INVOICE}/>
                  <AssociationDataTable
                    title={'BillingAdjustment'}
                    record={record}
                    moduleName={ORDER_MODULE}
                    entityName={'BillingAdjustment'}/>
                </div>,
                SplitOrder: <AssociationDataTable
                  title={'SplitOrder'}
                  record={record}
                  moduleName={ORDER_MODULE}
                  entityName={'SplitOrder'}/>,
                Account: <AssociationDataTable
                  title={ACCOUNT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ACCOUNT}/>,
                Address: <AssociationDataTable
                  title={ADDRESS}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ADDRESS}/>,
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                Communication: <div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: 10 }}>
                      <Popconfirm
                        title="Are you sure you want to send the order confirmation?"
                        onConfirm={() => sendConfirmation(`OrderModule/v1.0/orders/${record ? record.id : null}/email/SENDGRID_ORDER_CONFIRMATION`)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="primary">Send Confirmation</Button>
                      </Popconfirm>
                    </div>
                    <div>
                      <Popconfirm
                        title="Are you sure you want to send the install booking request?"
                        onConfirm={() => sendConfirmation(`OrderModule/v1.0/orders/${record ? record.id : null}/email/SENDGRID_INSTALL_SCHEDULING_REQUEST`)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="primary">Send Install Request </Button>
                      </Popconfirm>
                    </div>
                  </div>
                  <MailActivityFeed record={record}/>
                </div>,
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
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(OrderDetailView));
