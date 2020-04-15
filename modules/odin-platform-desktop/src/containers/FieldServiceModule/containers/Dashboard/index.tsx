import { Card, Col, Layout, Row, Statistic, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import QueryDataList from '../../../../core/queries/components/DataList';
import { getPipelinesOverviewRequest } from '../../../../core/reporting/store/actions';
import { ReportReducerState } from '../../../../core/reporting/store/reducer';

interface Props {
  reportReducer: ReportReducerState,
  getPipelinesOverview: any,
}

class Dashboard extends React.Component<Props> {

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData() {
    const { getPipelinesOverview } = this.props;
    getPipelinesOverview();
  }

  renderRagStatuses(stageId: string) {
    const { reportReducer } = this.props;
    const { pipelinesRagOverview } = reportReducer;

    const stages = pipelinesRagOverview.filter((elem: any) => elem.pipeline_stage_id === stageId);

    if(stages) {
      return (
        stages.map((elem: any) => (
          <div style={{ display: 'flex' }}>
            <div>{elem.count}</div>
          </div>
        ))
      );
    }
  }

  renderWorkOrderPipeline() {
    const { reportReducer } = this.props;
    const { pipelinesOverview } = reportReducer;
    const orderPipeline = pipelinesOverview.filter((elem: any) => elem.module_name === 'FieldServiceModule' && elem.entity_name === 'WorkOrder');
    return <Row style={{ marginBottom: 8, display: 'flex', background: '#fff' }}>
      {orderPipeline.map((elem: any) => (
        <Col flex={1}>
          <Card
            loading={reportReducer.isPipelinesRequesting}>
            <Statistic title={elem.stage_name} value={elem.records}/>
          </Card>
        </Col>
      ))}
    </Row>;
  }

  render() {
    return (
      <Layout style={{ padding: 8 }}>
        <div style={{ marginTop: 24 }}>
          <Typography.Title level={3}>Work Orders</Typography.Title>
          {this.renderWorkOrderPipeline()}
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <QueryDataList
              title="Work orders created today"
              queryName="OdinListRecordsCreatedFromStartOfCurrentDay"
              queryParams={`entityName=WorkOrder&interval=0 hour`}/>
          </Col>
          <Col span={12}>
            <QueryDataList
              title="Work orders updated today"
              queryName="OdinListRecordsUpdatedFromStartOfCurrentDay"
              queryParams={`entityName=WorkOrder&interval=0 hour`}/>
          </Col>
        </Row>
      </Layout>
    )
  }
}

const mapState = (state: any) => ({
  reportReducer: state.reportReducer,
});

const mapDispatch = (dispatch: any) => ({
  getPipelinesOverview: (params: { moduleName?: string, entityName?: string }) => dispatch(getPipelinesOverviewRequest(
    params)),
});


export default connect(mapState, mapDispatch)(Dashboard);
