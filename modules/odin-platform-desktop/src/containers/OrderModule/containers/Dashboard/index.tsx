import { Card, Col, Layout, Row, Statistic, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import QueryDataList from '../../../../core/queries/components/DataList';
import OrderMandateIssuesList from '../../../../core/reporting/components/OrderMandateIssuesList';
import { getPipelinesOverviewRequest } from '../../../../core/reporting/store/actions';
import { ReportReducerState } from '../../../../core/reporting/store/reducer';

const { Title } = Typography;

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
    const orderPipeline = pipelinesOverview.filter((elem: any) => elem.module_name === 'OrderModule' && elem.entity_name === 'Order');
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
      <Layout style={{ padding: 12 }}>
        <div style={{ marginTop: 24 }}>
          <Typography.Title level={3}>Orders</Typography.Title>
          {this.renderWorkOrderPipeline()}
        </div>
        <Row gutter={16}>
          <Col span={12}>
            <QueryDataList
              title="Orders created today"
              queryName="OdinListRecordsCreatedFromStartOfCurrentDay"
              queryParams={`entityName=Order&interval=0 hour`}/>
          </Col>
          <Col span={12}>
            <QueryDataList
              title="Orders updated today"
              queryName="OdinListRecordsUpdatedFromStartOfCurrentDay"
              queryParams={`entityName=Order&interval=0 hour`}/>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={12}>
            <OrderMandateIssuesList title="Missing mandates" path="orders-no-mandate"/>
          </Col>
          <Col span={12}>
            <OrderMandateIssuesList title="Inactive mandate" path="orders-inactive-mandate"/>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16, paddingBottom: 50 }}>
          <Col span={12}>
            <QueryDataList
              title="Mandates created today"
              queryName="OdinListRecordsCreatedFromStartOfCurrentDay"
              queryParams={`entityName=PaymentMethod&interval=0 hour`}/>
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
