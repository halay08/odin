import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Card, Col, Layout, Row, Tabs } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import RecordCollaborators from '../../../../../core/records/components/DataDisplays/RecordCollaborators';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import RecordPageHeader from '../../../../../core/records/components/PageHeader';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { changeToCapitalCase } from '../../../../../shared/utilities/dataTransformationHelpers';
import {
  getAllSchemaAssociationSchemas,
  getRecordFromShortListById,
} from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';

const { TabPane } = Tabs;

interface Props {
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  match: any,
}


const { NOTE } = SchemaModuleEntityTypeEnums;

class SubtasktTemplateDetailView extends React.Component<Props> {

  render() {
    const { schemaReducer, recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    const relatedSchemas = getAllSchemaAssociationSchemas(schema?.associations, [ NOTE, 'File' ]);

    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">
        <Col span={16}>
          <RecordPageHeader record={record}/>
          <Col span={24}>
            <Card style={{ marginBottom: 10 }}>
              <RecordProperties columns={5} record={record}/>
            </Card>
          </Col>

          <Col span={24}>
            <Card>
              <Tabs defaultActiveKey="#">
                {relatedSchemas.map((schema: SchemaEntity) => (
                  <TabPane tab={changeToCapitalCase(schema.entityName)} key={`#tab1_${schema.entityName}`}>
                    <AssociationDataTable
                      title={schema.entityName}
                      record={record}
                      moduleName={schema.moduleName}
                      entityName={schema.entityName}/>
                  </TabPane>
                ))}
              </Tabs>
            </Card>
          </Col>
        </Col>
        <Col span={8}>
          <RecordCollaborators record={record}/>
          <ActivityFeed/>
        </Col>
      </Row>
    </Layout>)
  }

}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(SubtasktTemplateDetailView));
