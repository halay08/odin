import { Card, Col, Layout, PageHeader, Row, Select, Space, Statistic } from 'antd';
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import updateLocale from 'dayjs/plugin/updateLocale'
import utc from 'dayjs/plugin/utc'
import React from 'react';
import { connect } from 'react-redux';
import QueryDataList from '../../../../core/queries/components/DataList';
import { getPipelinesOverviewRequest } from '../../../../core/reporting/store/actions';
import { ReportReducerState } from '../../../../core/reporting/store/reducer';
import DayjsDatePicker from '../../../../shared/components/DayjsDatePicker/DayjsDatePicker'
import CrmTemplateDataList from './widgets/CrmTemplateDataList'
import CrmTemplateStackedCard from './widgets/CrmTemplateStackedCard';
import CrmTemplateStatisticCard from './widgets/CrmTemplateStatisticCard';

dayjs.extend(utc)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  weekStart: 1,
})
dayjs.extend(quarterOfYear)

const { RangePicker } = DayjsDatePicker;
const { Option } = Select;

interface Props {
  reportReducer: ReportReducerState,
  getPipelinesOverview: any,
}

interface State {
  defaultDateFrom: string | Date,
  defaultDateTo: string | Date,
  dateFormat: string,
  datePreset: string
}


class Dashboard extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    const dateFormat = 'YYYY/MM/DD'
    this.state = {
      defaultDateFrom: dayjs().format(dateFormat),
      defaultDateTo: dayjs().add(1, 'days').format(dateFormat),
      dateFormat,
      datePreset: 'Today',
    };
  }

  componentDidMount(): void {
    this.fetchData();
  }

  onChangeDatePicker = (values: null | [ any, any ], dateStrings: [ string, string ]) => {
    this.setState({
      datePreset: 'Custom',
      defaultDateFrom: dateStrings[0],
      defaultDateTo: dateStrings[1],
    });
  }

  fetchData() {
    const { getPipelinesOverview } = this.props;
    getPipelinesOverview();
  }

  renderPipeline() {
    const { reportReducer } = this.props;
    const { pipelinesOverview } = reportReducer;
    const orderPipeline = pipelinesOverview.filter((elem: any) => elem.module_name === 'CrmModule' && elem.entity_name === 'Lead');
    return <Row gutter={[ 16, 16 ]} style={{ marginBottom: 8 }}>
      {orderPipeline.map((elem: any, key: any) => (
        <Col span={4} xs={24} sm={12} md={8} lg={4} key={`order_${key}`}>
          <Card
            loading={reportReducer.isPipelinesRequesting}>
            <Statistic title={elem.stage_name} value={elem.records}/>
          </Card>
        </Col>
      ))}
    </Row>;
  }

  handleDatePresetChange(value: any) {
    this.setState({ datePreset: value });
    switch (value) {
      case 'Today':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().startOf('day').toISOString(),
          defaultDateTo: dayjs().endOf('day').toISOString(),
        });
        break;
      case 'Yesterday':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().subtract(1, 'day').startOf('day').toISOString(),
          defaultDateTo: dayjs().subtract(1, 'day').endOf('day').toISOString(),
        });
        break;
      case 'This Week':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().startOf('week').startOf('day').toISOString(),
          defaultDateTo: dayjs().endOf('week').endOf('day').toISOString(),
        });
        break;
      case 'Last Week':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().startOf('week').subtract(1, 'week').startOf('day').toISOString(),
          defaultDateTo: dayjs().endOf('week').subtract(1, 'week').endOf('day').toISOString(),
        });
        break;
      case 'This Month':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().date(1).startOf('day').toISOString(),
          defaultDateTo: dayjs().date(31).endOf('day').toISOString(),
        });
        break;
      case 'Last Month':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().date(1).subtract(1, 'month').startOf('day').toISOString(),
          defaultDateTo: dayjs().date(31).subtract(1, 'month').endOf('day').toISOString(),
        });
        break;
      case 'This Quarter':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().startOf('quarter').startOf('day').toISOString(),
          defaultDateTo: dayjs().endOf('quarter').endOf('day').toISOString(),
        });
        break;
      case 'Last Quarter':
        this.setState({
          datePreset: value,
          defaultDateFrom: dayjs().startOf('quarter').subtract(1, 'quarter').startOf('day').toISOString(),
          defaultDateTo: dayjs().endOf('quarter').subtract(1, 'quarter').endOf('day').toISOString(),
        });
        break;
      default:

    }

  };

  render() {
    const { dateFormat, defaultDateTo, defaultDateFrom, datePreset } = this.state;
    return (
      <Layout style={{ padding: 14, overflow: 'auto' }}>
        <PageHeader
          style={{ marginBottom: 14, background: '#f3f2f2' }}
          ghost={false}
          title="CRM Dashboard"
          extra={[
            <Space align="start" wrap>
              <RangePicker
                defaultValue={[ dayjs(defaultDateFrom, dateFormat), dayjs(defaultDateTo, dateFormat) ]}
                format={dateFormat}
                value={[ dayjs(defaultDateFrom, dateFormat), dayjs(defaultDateTo, dateFormat) ]}
                onChange={
                  this.onChangeDatePicker
                }
              />
              <Select value={datePreset} style={{ width: 120 }} onChange={this.handleDatePresetChange.bind(this)}>
                <Option value="Custom">Custom</Option>
                <Option value="Today">Today</Option>
                <Option value="Yesterday">Yesterday</Option>
                <Option value="This Week">This Week</Option>
                <Option value="Last Week">Last Week</Option>
                <Option value="This Month">This Month</Option>
                <Option value="Last Month">Last Month</Option>
                <Option value="This Quarter">This Quarter</Option>
                <Option value="Last Quarter">Last Quarter</Option>
              </Select>
            </Space>,
          ]}>
        </PageHeader>

        <Card size="small" title="Lead Pipeline" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              {this.renderPipeline()}
            </Col>
          </Row>
        </Card>

        <Row gutter={16}>
          <Col span={12} xs={24} md={12}>
            <Card size="small" title="New Leads" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={24}>
                  <QueryDataList
                    title=""
                    queryName="OdinListRecordsCreatedFromStartOfCurrentDay"
                    queryParams={`entityName=Lead&interval=0 hour`}/>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12} xs={24} md={12}>
            <Card
              title="Performance"
              style={{ marginBottom: 16, minHeight: 'calc(100% - 16px)', height: 'calc(100% - 16px)' }}
              bodyStyle={{ height: 'calc(100% - 48px)' }}
            >
              <Row gutter={[ 16, 16 ]} style={{ height: '100%' }}>
                <Col span={12} xs={24} sm={12} md={24} lg={24} xl={12}>
                  <CrmTemplateStatisticCard
                    title={`Leads (${this.state.datePreset})`}
                    API="CrmModule/v1.0/dashboards/leads/total"
                    tag="count"
                    dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                    dateTo={dayjs(defaultDateTo).utc().toISOString()}
                    key={`${defaultDateFrom}+${defaultDateTo}`}
                    alignCenter
                    fullHeight
                    size="large"
                  />
                </Col>
                <Col span={12} xs={24} sm={12} md={24} lg={24} xl={12}>
                  <Row gutter={[ 16, 16 ]} style={{ height: '100%' }}>
                    <Col span={24}>
                      <CrmTemplateStatisticCard
                        title={`Visits (${this.state.datePreset})`}
                        API="CrmModule/v1.0/dashboards/visits/total"
                        tag="count"
                        dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                        dateTo={dayjs(defaultDateTo).utc().toISOString()}
                        key={`${defaultDateFrom}+${defaultDateTo}`}
                        alignCenter
                        fullHeight
                        size="large"
                      />
                    </Col>
                    <Col span={24}>
                      <CrmTemplateStatisticCard
                        title="Visits change"
                        API="CrmModule/v1.0/dashboards/visits/change"
                        tag="change"
                        dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                        dateTo={dayjs(defaultDateTo).utc().toISOString()}
                        additionalValueSymbol="%"
                        key={`${defaultDateFrom}+${defaultDateTo}`}
                        alignCenter
                        colored
                        fullHeight
                        size="large"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card size="small" title="Leads" style={{ marginBottom: 16 }}>
          <Row gutter={[ 16, 16 ]}>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateDataList
                chart="pie"
                title="By Source"
                API="CrmModule/v1.0/dashboards/leads/by_source"
                tag="source"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
              />
            </Col>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateDataList
                chart="pie"
                title="By User"
                API="CrmModule/v1.0/dashboards/leads/by_user"
                tag="name"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
              />
            </Col>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateDataList
                chart="bar"
                title="By Address SalesStatus"
                API="CrmModule/v1.0/dashboards/leads/by_salesstatus"
                tag="value"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
              />
            </Col>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateStackedCard
                title="Opportunities"
                API="CrmModule/v1.0/dashboards/leads/by_salesstatus_in_order_preorder"
                tag="salesstatus"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
                options={{
                  prefix: '£',
                  title: 'salesstatus',
                  labels: {
                    'ORDER': 'Hot Lead Opportunities',
                    'PRE_ORDER': 'Warm Lead Opportunities',
                  },
                  amount: 'sum',
                  count: 'count',
                  // colors: ['#bdfda0', '#ffd9a3']
                }}
              />
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Visits" style={{ marginBottom: 16 }}>
          <Row gutter={[ 16, 16 ]}>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateDataList
                chart="bar"
                title="By Outcome"
                API="CrmModule/v1.0/dashboards/visits/by_outcome"
                tag="outcome"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
              />
            </Col>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateDataList
                chart="bar"
                title="By User"
                API="CrmModule/v1.0/dashboards/visits/by_user"
                tag="name"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
              />
            </Col>
            <Col span={8} xs={24} md={12} xl={8}>
              <CrmTemplateDataList
                chart="bar"
                title="By NotInterestedReason"
                API="CrmModule/v1.0/dashboards/visits/by_notinterestedreason"
                tag="notinterstedreason"
                dateFrom={dayjs(defaultDateFrom).utc().toISOString()}
                dateTo={dayjs(defaultDateTo).utc().toISOString()}
                key={`${defaultDateFrom}+${defaultDateTo}`}
              />
            </Col>
          </Row>
        </Card>
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
