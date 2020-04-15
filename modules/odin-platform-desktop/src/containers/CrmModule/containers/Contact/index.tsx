import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import MailActivityFeed from '../../../../core/notifications/components/MailActivityFeed';
import SendDynamicEmail from '../../../../core/notifications/components/SendDynamicEmail';
import ActivityFeed from '../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../../core/records/components/Note/NoteForm';
import { IRecordReducer } from '../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { IRecordAssociationsReducer } from '../../../../core/recordsAssociations/store/reducer';
import CardWithTabs from '../../../../shared/components/CardWithTabs';
import {
  getRecordFromShortListById,
  getRecordRelatedFromShortListById,
} from '../../../../shared/utilities/recordHelpers';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  match: any,
  hasColumnMappings?: boolean,
  visibleProperties?: string[],
}


const { ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const {
  LEAD,
  ACCOUNT,
  ADDRESS,
  PAYMENT_METHOD,
  CONTACT_IDENTITY,
  INVOICE,
  ORDER,
  WORK_ORDER,
} = SchemaModuleEntityTypeEnums;

class ContactDetailView extends React.Component<PropsType> {

  render() {
    const { recordAssociationReducer, hasColumnMappings, recordReducer, match, visibleProperties } = this.props;

    let record;

    if(hasColumnMappings) {
      record = getRecordRelatedFromShortListById(
        recordAssociationReducer.shortList,
        match.params.dbRecordAssociationId,
        match.params.recordId,
      );
    } else {
      record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    }

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft
              record={record}
              hasColumnMappings={hasColumnMappings}
              visibleProperties={visibleProperties}
            >
              <RecordProperties columnLayout="vertical" record={record} columns={2}/>
            </DetailPanelLeft>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-center-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="Order"
              tabList={[
                {
                  key: 'Order',
                  tab: 'Orders',
                },
                {
                  key: 'WorkOrder',
                  tab: 'WorkOrders',
                },
                {
                  key: 'Invoice',
                  tab: 'Invoices',
                },
                {
                  key: 'Address',
                  tab: 'Addresses',
                },
                {
                  key: 'Account',
                  tab: 'Accounts',
                },
                {
                  key: 'PaymentMethod',
                  tab: 'Payment Methods',
                },
                {
                  key: 'ContactIdentity',
                  tab: 'Identities',
                },
                {
                  key: 'Lead',
                  tab: 'Lead',
                },
                {
                  key: 'Communication',
                  tab: 'Communications',
                },
              ]}
              contentList={{
                Order: <AssociationDataTable
                  title={ORDER}
                  record={record}
                  moduleName={ORDER_MODULE}
                  entityName={ORDER}/>,
                WorkOrder: <AssociationDataTable
                  title={WORK_ORDER}
                  record={record}
                  moduleName={FIELD_SERVICE_MODULE}
                  entityName={WORK_ORDER}/>,
                Invoice: <AssociationDataTable
                  title={INVOICE}
                  record={record}
                  moduleName={BILLING_MODULE}
                  entityName={INVOICE}/>,
                Address: <AssociationDataTable
                  title={ADDRESS}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ADDRESS}/>,
                Account: <AssociationDataTable
                  title={ACCOUNT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ACCOUNT}/>,
                PaymentMethod: <AssociationDataTable
                  title={PAYMENT_METHOD}
                  record={record}
                  moduleName={BILLING_MODULE}
                  entityName={PAYMENT_METHOD}/>,
                ContactIdentity: <AssociationDataTable
                  title={CONTACT_IDENTITY}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT_IDENTITY}/>,
                Lead: <AssociationDataTable
                  title={LEAD}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={LEAD}/>,
                Communication: <div>
                  <SendDynamicEmail
                    buttonText="Setup Mandate"
                    email={{
                      to: getProperty(record, 'EmailAddress'),
                      templateLabel: 'SENDGRID_DD_MISSING',
                      dynamicTemplateData: {
                        id: record?.id,
                        description: 'Setup Direct Debit - Payment info missing',
                        properties: {
                          FirstName: getProperty(record, 'FirstName'),
                        },
                      },
                    }}/>
                  <MailActivityFeed record={record}/>
                </div>
                ,
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
  recordAssociationReducer: state.recordAssociationReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(ContactDetailView));
