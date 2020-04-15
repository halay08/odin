import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Card, Col, Layout, Row, Statistic } from 'antd';
import Title from 'antd/lib/typography/Title';
import React from 'react';
import { connect } from 'react-redux';
import QueryDataList from '../../../../core/queries/components/DataList';
import QueryStatisticCard from '../../../../core/queries/components/StatisticCard';
import { getPipelinesOverviewRequest } from '../../../../core/reporting/store/actions';
import { ReportReducerState } from '../../../../core/reporting/store/reducer';
import PremiseBuildStatus from './BuildStatus';

interface Props {
  reportReducer: ReportReducerState,
  getPipelinesOverview: any,
}

interface State {
}

const { PROGRAM, PROJECT, MILESTONE, TASK, SUBTASK } = SchemaModuleEntityTypeEnums;

class Dashboard extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData() {
    const { getPipelinesOverview } = this.props;
    getPipelinesOverview();
  }

  renderMilestonePipeline() {
    const { reportReducer } = this.props;
    const { pipelinesOverview } = reportReducer;
    const orderPipeline = pipelinesOverview.filter((elem: any) => elem.module_name === 'ProjectModule' && elem.entity_name === 'Milestone');
    return <Row gutter={16} style={{ marginBottom: 24, display: 'flex' }}>
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

  renderTaskPipeline() {
    const { reportReducer } = this.props;
    const { pipelinesOverview } = reportReducer;
    const orderPipeline = pipelinesOverview.filter((elem: any) => elem.module_name === 'ProjectModule' && elem.entity_name === 'Task');
    return <Row gutter={16} style={{ marginBottom: 24, display: 'flex' }}>
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
      <Layout style={{ padding: 8, border: '1px solid #dadada', background: '#fafafa', overflow: 'auto' }}>
        <Title level={2}>Project Module</Title>
        <PremiseBuildStatus/>
        <div>
          <Title level={4}>Overview</Title>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={4}>
              <QueryStatisticCard
                title="Programs"
                queryName="OdinGetRecordCount"
                queryParams={`entityName=${PROGRAM}`}/>
            </Col>
            <Col span={4}>
              <QueryStatisticCard
                title="Projects"
                queryName="OdinGetRecordCount"
                queryParams={`entityName=${PROJECT}`}/>
            </Col>
            <Col span={4}>
              <QueryStatisticCard
                title="Milestones"
                queryName="OdinGetRecordCount"
                queryParams={`entityName=${MILESTONE}`}/>
            </Col>
            <Col span={4}>
              <QueryStatisticCard
                title="Tasks"
                queryName="OdinGetRecordCount"
                queryParams={`entityName=${TASK}`}/>
            </Col>
            <Col span={4}>
              <QueryStatisticCard
                title="Subtasks"
                queryName="OdinGetRecordCount"
                queryParams={`entityName=${SUBTASK}`}/>
            </Col>
          </Row>
          <Row>
            <Col span={4}>
              <QueryStatisticCard
                title="Features"
                queryName="OdinGetRecordCount"
                queryParams={`entityName=Feature`}/>
            </Col>
          </Row>
        </div>

        <div>
          <Title level={4}>Milestone Pipeline</Title>
          {this.renderMilestonePipeline()}
        </div>
        <div>
          <Title level={4}>Task Pipeline</Title>
          {this.renderTaskPipeline()}
        </div>

        <Row gutter={16}>
          <Col span={8}>
            <QueryDataList
              title="Projects Updated last 24 hours"
              queryName="OdinListRecordsUpdatedAtByInterval"
              queryParams={`entityName=${PROJECT}&interval=24 hours`}/>
          </Col>
          <Col span={8}>
            <QueryDataList
              title="Milestones Updated last 24 hours"
              queryName="OdinListRecordsUpdatedAtByInterval"
              queryParams={`entityName=${MILESTONE}&interval=24 hours`}/>
          </Col>
          <Col span={8}>
            <QueryDataList
              title="Tasks Updated last 24 hours"
              queryName="OdinListRecordsUpdatedAtByInterval"
              queryParams={`entityName=${TASK}&interval=24 hours`}/>
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
