import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ActivityFeed from '../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../core/records/components/DetailPanelLeft';
import RecordProperties from '../../../core/records/components/DetailView/RecordProperties';
import { IRecordReducer } from '../../../core/records/store/reducer';
import AssociationDataTable from '../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { SchemaReducerState } from '../../../core/schemas/store/reducer';
import CardWithTabs from '../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../shared/utilities/recordHelpers';

interface Props {
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  match: any
}

const { PRODUCT_MODULE } = SchemaModuleTypeEnums;
const { PRODUCT } = SchemaModuleEntityTypeEnums;

class OfferDetailView extends React.Component<Props> {
  render() {
    const { recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    return (<Layout className='record-detail-view'>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <RecordProperties columns={2} columnLayout="vertical" record={record}/>
            </DetailPanelLeft>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={18}>
          <div className="record-detail-left-panel">
            <CardWithTabs
              title="Options"
              defaultTabKey="Product"
              tabList={[
                {
                  key: 'Product',
                  tab: 'Product',
                },
                {
                  key: 'Activity',
                  tab: 'Activity',
                },
              ]}
              contentList={{
                Product:
                  <AssociationDataTable
                    title={PRODUCT}
                    record={record}
                    moduleName={PRODUCT_MODULE}
                    entityName={PRODUCT}/>,
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
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
});


export default withRouter(connect(mapState)(OfferDetailView));
