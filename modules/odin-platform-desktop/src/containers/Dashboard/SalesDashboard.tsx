import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Card, Col, Layout, List, PageHeader, Row, Select, Statistic, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getOrdersOverviewRequest, getPipelinesOverviewRequest } from '../../core/reporting/store/actions';
import { ReportReducerState } from '../../core/reporting/store/reducer';
import PremiseBuildStatus from '../ProjectModule/containers/Dashboard/BuildStatus';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface Props {
  reportReducer: ReportReducerState,
  getOrdersOverview: any,
  getPipelinesOverview: any,
}

interface State {
  orderStageKey: string
}

const { ORDER } = SchemaModuleEntityTypeEnums;

class SalesDashboard extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      orderStageKey: 'OrderStageActive',
    };
  }

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData() {
    const { getOrdersOverview, getPipelinesOverview } = this.props;
    getOrdersOverview({
      orderStageKey: this.state.orderStageKey,
    });
    getPipelinesOverview();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if(prevState.orderStageKey !== this.state.orderStageKey) {
      this.fetchData()
    }
  }

  handleOrderStageSelected(value: string) {
    this.setState({ orderStageKey: value });
  }

  renderOrderPipeline() {
    const { reportReducer } = this.props;
    const { pipelinesOverview } = reportReducer;

    const orderPipeline = pipelinesOverview.filter((elem: any) => elem.module_name === 'OrderModule' && elem.entity_name === 'Order');
    return <Row gutter={16} style={{ marginBottom: 8, display: 'flex' }}>
      {orderPipeline.map((elem: any) => (
        <Col flex={1}>
          <Card
            style={elem.stage_key === this.state.orderStageKey ? { backgroundColor: '#d8edff' } : { backgroundColor: '#fff' }}
            loading={reportReducer.isOrdersRequesting}>
            <Statistic title={elem.stage_name} value={elem.records}/>
          </Card>
        </Col>
      ))}
    </Row>;
  }

  render() {
    const { reportReducer } = this.props;
    const { ordersOverview } = reportReducer;
    return (
      <Layout style={{ padding: 14, overflow: 'auto' }}>

        <PageHeader
          style={{ marginBottom: 14, background: '#f3f2f2' }}
          ghost={false}
          title="Sales Executive Dashboard"
          extra={[
            <Select
              style={{ width: 200 }}
              placeholder="Select stage filters"
              defaultValue={[ this.state.orderStageKey ]}
              onSelect={(e) => this.handleOrderStageSelected(e)}
            >
              <Option key={1} value="OrderStagePreOrder">Pre Order</Option>
              <Option key={2} value="OrderStageDraft">Draft</Option>
              <Option key={3} value="OrderStageSold">Sold</Option>
              <Option key={4} value="OrderStageSupply">Supply</Option>
              <Option key={5} value="OrderStageActive">Active</Option>
              <Option key={6} value="OrderStageCancelled">Cancelled</Option>
            </Select>,
          ]}>
        </PageHeader>

        <Card size="small" title="Premise Build" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <PremiseBuildStatus/>

            </Col>
          </Row>
        </Card>

        <Card size="small" title="Order Pipeline" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>

              {this.renderOrderPipeline()}

            </Col>
          </Row>
        </Card>


        <Card size="small" title="Active Customers" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col flex={1}>
              <Card loading={reportReducer.isOrdersRequesting}>
                <Statistic title="Customers" value={`${ordersOverview?.connectedAddresses}`}/>
              </Card>
            </Col>
            <Col flex={1}>
              <Card loading={reportReducer.isOrdersRequesting}>
                <Statistic title="Gross order value" value={`£ ${ordersOverview?.grossOrderValue}`}/>
              </Card>
            </Col>
            <Col flex={1}>
              <Card loading={reportReducer.isOrdersRequesting}>
                <Statistic title="Net order value" value={`£ ${ordersOverview?.netOrderValue}`}/>
              </Card>
            </Col>
            <Col flex={1}>
              <Card loading={reportReducer.isOrdersRequesting}>
                <Statistic title="ARPU" value={`£ ${ordersOverview?.arpu}`}/>
              </Card>
            </Col>
          </Row>
        </Card>


        <Card size="small" title="Product Mix Residential" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Res. Base Broadband Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.resBaseBroadband}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Res. Add-on Broadband Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.resAddOnBroadband}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Res. Base Voice Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.resBaseVoice}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Res. Add-on Voice Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.resAddOnVoice}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Product Mix Business" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Bus. Base Broadband Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.busBaseBroadband}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Bus. Add-on Broadband Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.busAddOnBroadband}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Bus. Base Voice Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.busBaseVoice}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col span={6}>
              <Card style={{ marginTop: 14, minHeight: 300 }} title="Bus. Add-on Voice Mix"
                    loading={reportReducer.isOrdersRequesting}>
                <List
                  bordered
                  dataSource={ordersOverview?.busAddOnVoice}
                  renderItem={(item: any) => (
                    <List.Item>
                      <div style={{ width: 100 }}>{item.line_item_name}</div>
                      <div>{item.line_item_count}</div>
                      <div>{Number(item.percentage) > 0 ? item.percentage : '< 1'} %</div>
                    </List.Item>
                  )}
                />
              </Card>
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
  getOrdersOverview: (params: { orderStageKey: string }) => dispatch(
    getOrdersOverviewRequest(params)),
  getPipelinesOverview: (params: { moduleName?: string, entityName?: string }) => dispatch(getPipelinesOverviewRequest(
    params)),
});


export default connect(mapState, mapDispatch)(SalesDashboard);
