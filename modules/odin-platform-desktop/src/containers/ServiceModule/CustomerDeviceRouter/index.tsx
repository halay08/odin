import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Layout, Row, Tabs } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ActivityFeed from '../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../core/records/components/Note/NoteForm';
import { IRecordReducer } from '../../../core/records/store/reducer';
import AssociationDataTable from '../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import CardWithTabs from '../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../shared/utilities/recordHelpers';
import EeroEerosDetails from './Eero/EeroEerosDetails';

const { TabPane } = Tabs;

interface Props {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
}


const { SERVICE_MODULE, CRM_MODULE } = SchemaModuleTypeEnums;
const { ADDRESS, CUSTOMER_DEVICE_ONT } = SchemaModuleEntityTypeEnums;

class CustomerDeviceRouterDetail extends React.Component<Props> {

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
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-center-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="Contact"
              tabList={[
                {
                  key: 'Info',
                  tab: 'Info',
                },
                {
                  key: 'Address',
                  tab: 'Address',
                },
                {
                  key: 'CustomerDeviceOnt',
                  tab: 'Customer Device Ont',
                },
              ]}
              contentList={{
                Info: <EeroEerosDetails record={record}/>,
                Address:
                  <AssociationDataTable
                    title={ADDRESS}
                    record={record}
                    moduleName={CRM_MODULE}
                    entityName={ADDRESS}/>,
                CustomerDeviceOnt: <AssociationDataTable
                  title={CUSTOMER_DEVICE_ONT}
                  record={record}
                  moduleName={SERVICE_MODULE}
                  entityName={CUSTOMER_DEVICE_ONT}/>,

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

const mapDispatch = (dispatch: any) => ({});

export default withRouter(connect(mapState, mapDispatch)(CustomerDeviceRouterDetail));
