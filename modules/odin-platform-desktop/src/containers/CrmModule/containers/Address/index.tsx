import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
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

const { ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE, SERVICE_MODULE } = SchemaModuleTypeEnums;
const {
  LEAD,
  ACCOUNT,
  CONTACT,
  INVOICE,
  ORDER,
  WORK_ORDER,
  CUSTOMER_DEVICE_ONT,
  CUSTOMER_DEVICE_ROUTER,
} = SchemaModuleEntityTypeEnums;

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

interface State {
}

class AddressDetailView extends React.Component<PropsType, State> {

  render() {
    const { recordReducer, match, visibleProperties, hasColumnMappings, recordAssociationReducer } = this.props;

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
                  key: 'Billing',
                  tab: 'Billing',
                },
                {
                  key: 'CustomerDevices',
                  tab: 'CustomerDevices',
                },
                {
                  key: 'Contact',
                  tab: 'Contacts',
                },
                {
                  key: 'Lead',
                  tab: 'Leads',
                },
                {
                  key: 'Account',
                  tab: 'Accounts',
                },
              ]}
              contentList={{
                Billing: <AssociationDataTable
                  title={INVOICE}
                  record={record}
                  moduleName={BILLING_MODULE}
                  entityName={INVOICE}/>,
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
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                CustomerDevices: <div>
                  <AssociationDataTable
                    title={CUSTOMER_DEVICE_ONT}
                    record={record}
                    moduleName={SERVICE_MODULE}
                    entityName={CUSTOMER_DEVICE_ONT}/>
                  <AssociationDataTable
                    title={CUSTOMER_DEVICE_ROUTER}
                    record={record}
                    moduleName={SERVICE_MODULE}
                    entityName={CUSTOMER_DEVICE_ROUTER}/>
                </div>,
                Lead: <AssociationDataTable
                  title={LEAD}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={LEAD}/>,
                Account: <AssociationDataTable
                  title={ACCOUNT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ACCOUNT}/>,
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
});

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(AddressDetailView));
