import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import GoCardlessActivityFeed from '../../../../../core/billing/GocardlessActivityFeed';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import CancelMandateForm from '../CancelMandate';
import DisableBankAccountForm from '../DisableBankAccount';
import ReinstateMandateForm from '../ReinstateMandate';

interface Props {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
}

const { CRM_MODULE, BILLING_MODULE } = SchemaModuleTypeEnums;
const { CONTACT, TRANSACTION } = SchemaModuleEntityTypeEnums;

class PaymentMethodDetailView extends React.Component<Props> {

  render() {
    const { schemaReducer, recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <RecordProperties columnLayout="vertical" record={record} columns={2}/>
            </DetailPanelLeft>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-center-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="Order"
              extra={<div style={{ display: 'flex' }}>
                <CancelMandateForm record={record}/>
                <ReinstateMandateForm record={record}/>
              </div>}
              tabList={[
                {
                  key: 'GocardlessActvity',
                  tab: 'Gocardless events',
                },
                {
                  key: 'Transaction',
                  tab: 'Transactions',
                },
                {
                  key: 'Contact',
                  tab: 'Contact',
                },
                {
                  key: 'Admin',
                  tab: 'Admin',
                },
              ]}
              contentList={{
                GocardlessActvity: <GoCardlessActivityFeed record={record} filterBy="MANDATE"/>,
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                Transaction: <AssociationDataTable
                  title={TRANSACTION}
                  record={record}
                  moduleName={BILLING_MODULE}
                  entityName={TRANSACTION}/>,
                Admin: <DisableBankAccountForm record={record}/>,
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
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

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(PaymentMethodDetailView));
