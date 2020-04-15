import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Col, Layout, Popconfirm, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import MailActivityFeed from '../../../../../core/notifications/components/MailActivityFeed';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import Pipeline from '../../../../../core/records/components/Pipeline/Pipeline';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationCardWithTabsList
  from '../../../../../core/recordsAssociations/components/AssociationCardWithTabsList';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import AssociationDescriptionList from '../../../../../core/recordsAssociations/components/AssociationDescriptionList';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import SwapCustomerDeviceRouter from '../../../../ServiceModule/SwapCustomerDeviceRouter';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
  sendConfirmation: any,
}


const { PRODUCT_MODULE, ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { DISCOUNT, ADDRESS, CONTACT, INVOICE, ORDER_ITEM, WORK_ORDER, ACCOUNT } = SchemaModuleEntityTypeEnums;

class OrderDetailView extends React.Component<PropsType> {

  render() {
    const { recordReducer, match, sendConfirmation } = this.props;

    const record = getRecordFromShortListById(recordReducer.shortList, match?.params?.recordId);

    return (<Layout className='record-detail-view'>

      <SwapCustomerDeviceRouter/>

      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <RecordProperties columnLayout="vertical" record={record} columns={2}/>
            </DetailPanelLeft>

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
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-left-panel">
            <Pipeline className="record-pipeline" record={record}/>
            <CardWithTabs
              title="Options"
              defaultTabKey="Order"
              tabList={[
                {
                  key: 'Summary',
                  tab: 'Summary',
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
                  key: 'Billing',
                  tab: 'Billing',
                },
                {
                  key: 'Contact',
                  tab: 'Contact',
                },
                {
                  key: 'Discount',
                  tab: 'Discount',
                },
                {
                  key: 'SplitOrder',
                  tab: 'Split Order',
                },
                {
                  key: 'WorkOrder',
                  tab: 'Work Order',
                },
                {
                  key: 'Communication',
                  tab: 'Communications',
                },
              ]}
              contentList={{
                Summary: <AssociationCardWithTabsList
                  title={'Products'}
                  record={record}
                  moduleName={ORDER_MODULE}
                  entityName={ORDER_ITEM}/>,
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
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                Discount: <AssociationDataTable
                  title={DISCOUNT}
                  record={record}
                  moduleName={PRODUCT_MODULE}
                  entityName={DISCOUNT}/>,
                SplitOrder: <AssociationDataTable
                  title={'SplitOrder'}
                  record={record}
                  moduleName={ORDER_MODULE}
                  entityName={'SplitOrder'}/>,
                WorkOrder: <AssociationDataTable
                  title={WORK_ORDER}
                  record={record}
                  moduleName={FIELD_SERVICE_MODULE}
                  entityName={WORK_ORDER}/>,
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
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(OrderDetailView));
