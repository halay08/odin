import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Col, Layout, Row, PageHeader, Card } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import BillingTemplateDataList from './widgets/BillingTemplateDataList';
import BillingTemplateStatisticCard from './widgets/BillingTemplateStatisticCard';
import BillingTemplatePlanStatisticCard from './widgets/BillingTemplatePlanStatisticCard';
import QueryStatisticCard from '../../../../core/queries/components/StatisticCard';

interface Props {
}

interface State {
}

const { INVOICE, TRANSACTION } = SchemaModuleEntityTypeEnums;

class BillingModuleDashboard extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <Layout style={{ padding: 14, overflow: 'auto'  }}>
        <PageHeader
          style={{ marginBottom: 14, background: '#f3f2f2' }}
          ghost={false}
          title="Billing Dashboard"
        />

        <Card size="small" title="Totals" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16} style={{ marginBottom: 8 }}>
                <Col span={6}>
                  <QueryStatisticCard
                    title="Invoices"
                    queryName="OdinGetRecordCount"
                    queryParams={`entityName=${INVOICE}`}/>
                </Col>
                <Col span={6}>
                  <QueryStatisticCard
                    title="Transactions"
                    queryName="OdinGetRecordCount"
                    queryParams={`entityName=${TRANSACTION}`}/>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Invoices generated in the last Bill Run" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Orders where the invoices must be created"
                link="/OrderModule/Order/:id"
                countAPI="BillingModule/v1.0/dashboards/invoices/plan_last_bill_run"
                API="BillingModule/v1.0/dashboards/invoices/plan_breakdown_last_bill_run"
              />
            </Col>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Orders where the invoices were created"
                link="/OrderModule/Order/:id"
                countAPI="BillingModule/v1.0/dashboards/invoices/fact_last_bill_run"
                API="BillingModule/v1.0/dashboards/invoices/fact_breakdown_last_bill_run"
              />
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Invoices" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Created and Processed in the last Bill Run"
                link="/BillingModule/Invoice/:id"
                countAPI="BillingModule/v1.0/dashboards/invoices/processed_last_bill_run"
                API="BillingModule/v1.0/dashboards/invoices/processed_breakdown_last_bill_run"
              />
            </Col>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Created and Scheduled in the last Bill Run"
                link="/BillingModule/Invoice/:id"
                countAPI="BillingModule/v1.0/dashboards/invoices/scheduled_last_bill_run"
                API="BillingModule/v1.0/dashboards/invoices/scheduled_breakdown_last_bill_run"
              />
            </Col>
          </Row>
        </Card>
        <Card size="small" title="Transactions" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Created in the last Bill Run"
                link="/BillingModule/Transaction/:id"
                countAPI="BillingModule/v1.0/dashboards/transactions/created_last_bill_run"
                API="BillingModule/v1.0/dashboards/transactions/created_breakdown_last_bill_run"
              />
            </Col>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Updated after the last Bill Run"
                link="/BillingModule/Transaction/:id"
                countAPI="BillingModule/v1.0/dashboards/transactions/updated_since_last_bill_run"
                API="BillingModule/v1.0/dashboards/transactions/updated_breakdown_since_last_bill_run"
              />
            </Col>
            <Col span={12} xs={24} md={12}>
              <BillingTemplateDataList
                title="Created after the last Bill Run"
                link="/BillingModule/Transaction/:id"
                // countAPI="BillingModule/v1.0/dashboards/transactions/updated_since_last_bill_run"
                API="BillingModule/v1.0/dashboards/transactions/created_breakdown_since_last_bill_run"
              />
            </Col>
          </Row>
        </Card>

      </Layout>
    )
  }
}



const mapState = (state: any) => ({});

const mapDispatch = (dispatch: any) => ({});

export default connect(mapState, mapDispatch)(BillingModuleDashboard);
