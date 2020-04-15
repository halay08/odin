import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Card, Col, Layout, Row, Tabs } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ActivityFeed from '../../../../core/records/components/ActivityFeed';
import RecordAlert from '../../../../core/records/components/Alert';
import RecordCollaborators from '../../../../core/records/components/DataDisplays/RecordCollaborators';
import RecordProperties from '../../../../core/records/components/DetailView/RecordProperties';
import NoteForm from '../../../../core/records/components/Note/NoteForm';
import RecordPageHeader from '../../../../core/records/components/PageHeader';
import { IRecordReducer } from '../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import {
  getAllSchemaAssociationSchemas,
  getRecordFromShortListById,
} from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { showPhonePortingModal } from './component-rendering-conditions';
import MagraPhonOrderDetails from './MagraPhoneOrderDetails';
import MagraPhonePortingModal from './MagraPhonePortingModal';

const { TabPane } = Tabs;

interface Props {
  recordReducer: IRecordReducer,
  match: any,
  schemaReducer: any,
}


const { NOTE } = SchemaModuleEntityTypeEnums;

class CustomerPhonePortingDetail extends React.Component<Props> {

  render() {
    const { schemaReducer, recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedChildSchemas = getAllSchemaAssociationSchemas(
      schema?.associations,
      [ NOTE ],
      false,
      false,
    );

    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">
        <Col span={16}>
          <RecordPageHeader
            record={record}
            disableClone={getProperty(record, 'MagraOrderId')}
            disableDelete={getProperty(record, 'MagraOrderId')}
            disableEdit={getProperty(record, 'MagraOrderId')}/>
          <Col span={24}>
            <Card style={{ marginBottom: 10 }}>
              <RecordProperties columns={5} record={record}/>
            </Card>
          </Col>

          <Col span={24}>
            <Card>
              <Tabs defaultActiveKey={'#tab1_MagraOrders'}>
                <TabPane tab="Magra Orders" key={`#tab1_MagraOrders`}>
                  {showPhonePortingModal(record) &&
                  <MagraPhonePortingModal record={record}/>
                  }
                  <MagraPhonOrderDetails record={record}/>
                </TabPane>
                <TabPane tab="Related" key={`#tab1_related`}>
                  {relatedChildSchemas.map((schema: SchemaEntity) => (
                    <AssociationDataTable
                      title={schema.entityName}
                      record={record}
                      moduleName={schema.moduleName}
                      entityName={schema.entityName}/>
                  ))}
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Col>

        <Col span={8}>
          <RecordAlert record={record}/>
          <RecordCollaborators record={record}/>
          <Card size="small" title="Notes" bordered style={{ marginBottom: 10 }}>
            <NoteForm record={record}/>
          </Card>
          <ActivityFeed/>
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

export default withRouter(connect(mapState, mapDispatch)(CustomerPhonePortingDetail));
