import { Card, Col, Row, Statistic } from 'antd';
import React from 'react';
import { httpGet } from '../../../../shared/http/requests';

interface Props {
}

interface State {
  data?: {
    totalPremises: number,
    buildDoneTotal: number,
    doneTotal: number
  };
  isLoading: boolean;
}

class PremiseBuildStatus extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: undefined,
      isLoading: false,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount(): void {
    this.fetchData();
  }

  private async fetchData() {

    this.setState({ isLoading: true });

    await httpGet(`ConnectModule/v1.0/reporting/premises-passed`).then(res => {
        this.setState({ data: res.data.data, isLoading: false })
      },
    ).catch(err => {
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { data, isLoading } = this.state;

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 8 }}>
          <Col span={4}>
            <Card loading={isLoading}>
              <Statistic title={'7-Build Done'} value={data?.buildDoneTotal}/>
            </Card>
          </Col>
          <Col span={4}>
            <Card loading={isLoading}>
              <Statistic title={'8-RFS'} value={data?.doneTotal}/>
            </Card>
          </Col>
          <Col span={4}>
            <Card loading={isLoading}>
              <Statistic title={'Total'} value={data?.totalPremises}/>
            </Card>
          </Col>
        </Row>
      </div>)
  }
}

export default PremiseBuildStatus;
