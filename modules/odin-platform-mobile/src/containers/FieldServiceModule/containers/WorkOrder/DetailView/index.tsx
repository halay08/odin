import { Col, Layout, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import WorkOrderStageButtons from '../../../../../core/records/components/Pipeline/WorkInstallOrderStageButtons';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationCardList from '../../../../../core/recordsAssociations/AssociationCardList';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import StageNameTag from '../../../../../shared/components/StageNameTag';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import WorkOrderItems from './RenderOrderItems';

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

class WorkOrderDetailView extends React.Component<PropsType> {

  render() {
    const { recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">

        <Col span={24} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to={'/FieldServiceModule/WorkOrder'}>Back to list</Link>
            <div>
              <Typography.Title level={4} style={{ marginBottom: 4 }}># {record?.recordNumber}</Typography.Title>
              <StageNameTag record={record} text={record?.stage?.name}/>
            </div>
          </div>
        </Col>

        <Row gutter={18}>
          <Col span={24} style={{ marginBottom: 16 }}>
            <WorkOrderStageButtons record={record}/>
          </Col>
          <Col span={24} style={{ marginBottom: 16 }}>
            <AssociationCardList
              record={record}
              moduleName="CrmModule"
              entityName="Address"
              layout="vertical"
              showRecordTitle
              propKeys={[ 'FullAddress', 'SalesStatus', 'BuildStatus', 'TargetReleaseDate', 'UDPRN' ]}
            />
          </Col>
          <Col span={24} style={{ marginBottom: 16 }}>
            <AssociationCardList
              record={record}
              moduleName="CrmModule"
              entityName="Contact"
              layout="horizontal"
              showRecordTitle
              propKeys={[ 'Phone', 'EmailAddress' ]}/>
          </Col>
          <Col span={24} style={{ marginBottom: 18 }}>
            <WorkOrderItems record={record}/>
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

export default withRouter(connect(mapState, mapDispatch)(WorkOrderDetailView));
