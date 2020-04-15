import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ActivityFeed from '../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../core/records/components/DetailView/RecordProperties';
import NoteFormWithChilds from '../../../../core/records/components/Note/NoteFormWithChilds';
import { IRecordReducer } from '../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import AssociationDescriptionList from '../../../../core/recordsAssociations/components/AssociationDescriptionList';
import CardWithTabs from '../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../shared/utilities/recordHelpers';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
}

const { ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { ADDRESS, CONTACT, INVOICE, ORDER, WORK_ORDER } = SchemaModuleEntityTypeEnums;

class AccountDetail extends React.Component<PropsType> {

  render() {
    const { recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <RecordProperties columnLayout="vertical" record={record} columns={2}/>
            </DetailPanelLeft>

            <AssociationDescriptionList
              title="Billing Contact"
              listKey="BillingContact"
              record={record}
              moduleName={CRM_MODULE}
              entityName={CONTACT}
              filters={[ 'Role:BILLING' ]}
              layout="vertical"
              showRecordTitle
              hasColumnMappings
              addRecordTitleLink
              disableListActions
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'Role',
                'EmailAddress',
                'Phone',
              ]}/>

            <AssociationDescriptionList
              title="Billing Address"
              listKey="BillingAddress"
              record={record}
              moduleName={CRM_MODULE}
              entityName={ADDRESS}
              filters={[ 'Type:BILLING' ]}
              layout="vertical"
              showRecordTitle
              hasColumnMappings
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
          <div className="record-detail-center-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="Notes"
              tabList={[
                {
                  key: 'Notes',
                  tab: 'Notes',
                },
                {
                  key: 'Order',
                  tab: 'Orders',
                },
                {
                  key: 'WorkOrder',
                  tab: 'WorkOrders',
                },
                {
                  key: 'Billing',
                  tab: 'Billing',
                },
                {
                  key: 'Contact',
                  tab: 'Contacts',
                },
                {
                  key: 'Address',
                  tab: 'Addresses',
                },
              ]}
              contentList={{
                Notes: <NoteFormWithChilds record={record}/>,
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
                Billing: <AssociationDataTable
                  title={INVOICE}
                  record={record}
                  moduleName={BILLING_MODULE}
                  entityName={INVOICE}/>,
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                Address: <AssociationDataTable
                  title={ADDRESS}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ADDRESS}/>,
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-right-panel">
            <CardWithTabs
              title="Updates"
              defaultTabKey="Activity"
              tabList={[
                {
                  key: 'Activity',
                  tab: 'Activity',
                },
              ]}
              contentList={{
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

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(AccountDetail));
