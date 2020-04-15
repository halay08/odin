import { Col, Layout, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import FileUploaderDragAndDrop from '../../../../../core/records/components/Files/FileUploaderDragAndDrop';
import WorkOrderSurveyStageButtons from '../../../../../core/records/components/Pipeline/WorkSurveyOrderStageButtons';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationCardList from '../../../../../core/recordsAssociations/AssociationCardList';
import AssociationDataTable from '../../../../../core/recordsAssociations/AssociationDataTable/DataTable';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import StageNameTag from '../../../../../shared/components/StageNameTag';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {

  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  sendConfirmation: any,
  match: any,

}

class WorkOrderSurveyDetailView extends React.Component<PropsType> {

  render() {
    const { recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">

        <Col span={24} style={{ marginBottom: 8, background: '#fff', padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to={'/FieldServiceModule/WorkOrder/Survey'}>Back to list</Link>
            <div>
              <Typography.Title level={4} style={{ marginBottom: 4 }}># {record?.recordNumber}</Typography.Title>
              <StageNameTag record={record} text={record?.stage?.name}/>
            </div>
          </div>
        </Col>

        <Row gutter={16}>
          <Col span={24}>
            <WorkOrderSurveyStageButtons record={record}/>
          </Col>
          <Col span={24} style={{ marginBottom: 16 }}>
            <AssociationCardList
              record={record}
              moduleName="CrmModule"
              entityName="Address"
              layout="vertical"
              showRecordTitle
              propKeys={[
                'SalesStatus',
                'BuildStatus',
                'TargetReleaseDate',
                'UDPRN',
                'ExPolygonId',
                'L2PolygonId',
                'L4PolygonId',
              ]}
            />
          </Col>
          <Col span={24} style={{ marginBottom: 16 }}>
            <div>
              <FileUploaderDragAndDrop record={record}/>
              <AssociationDataTable
                title="Files"
                record={record}
                moduleName="SchemaModule"
                entityName="File"/>
            </div>
          </Col>
        </Row>
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

export default withRouter(connect(mapState, mapDispatch)(WorkOrderSurveyDetailView));
