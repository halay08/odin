import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Card, Col, Descriptions, Modal } from 'antd';
import Countdown from 'antd/es/statistic/Countdown';
import React from 'react';
import { connect } from 'react-redux';
import { httpGet } from '../../../../shared/http/requests';
import { displayMessage } from '../../../../shared/system/messages/store/reducers';
import { parseDateAndTimeLocal } from '../../../../shared/utilities/dateHelpers';
import SpeedTest from './SpeedTest';

interface Props {
  record: DbRecordEntityTransform,
  alertMessage: any,
}

interface State {
  isSpeedTestProcessing: boolean,
  isLoading: boolean,
  data: any
}

class EeroEerosDetails extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      isSpeedTestProcessing: false,
      isLoading: false,
      data: undefined,
    }
  }

  componentDidMount() {
    this.fetchDeviceDetails();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.fetchDeviceDetails();
    }
  }


  async fetchDeviceDetails() {
    const { record, alertMessage } = this.props;

    this.setState({
      isLoading: true,
    });

    if(record) {

      await httpGet(
        `ServiceModule/v1.0/network/eero/eeros/${getProperty(record, 'SerialNumber')}`,
        {},
      ).then(res => {

        console.log(res);
        this.setState({
          isLoading: false,
          data: res.data.data,
        })
      }).catch(err => {
        this.setState({
          isLoading: false,
          data: undefined,
        });

        const error = err.response ? err.response.data : undefined;
        alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      });
    }
  };

  speedTestProcessing() {
    this.setState({
      isSpeedTestProcessing: true,
    });
  }

  renderDeviceDetails() {

    const { record } = this.props;

    return <div>
      <Card loading={this.state.isLoading} title="Device Details" style={{ marginBottom: 24 }}>
        {this.state.data &&
        <Descriptions layout='vertical' column={3}>
            <Descriptions.Item label="Mac Address">{this.state.data.mac_address}</Descriptions.Item>
            <Descriptions.Item label="Model">{this.state.data.model}</Descriptions.Item>
            <Descriptions.Item label="Deactivated">{this.state.data.deactivated}</Descriptions.Item>
        </Descriptions>
        }
      </Card>

      <Card loading={this.state.isLoading} title="Network Details" style={{ marginBottom: 24 }}>
        {this.state.data &&
        <Descriptions layout='vertical' column={3}>
            <Descriptions.Item label="Home Identifier">{this.state.data.network.label}</Descriptions.Item>
            <Descriptions.Item label="Name">{this.state.data.network.name}</Descriptions.Item>
            <Descriptions.Item label="Wan IP">{this.state.data.network.wan_ip}</Descriptions.Item>
            <Descriptions.Item label="Gateway IP">{this.state.data.network.gateway_ip}</Descriptions.Item>
        </Descriptions>
        }
      </Card>

      <Card loading={this.state.isLoading} title="Network Speed" style={{ marginBottom: 24 }}>
        {this.state.data &&
        <div style={{ marginBottom: 16 }}>
            <SpeedTest record={record} onSuccess={() => this.speedTestProcessing()}/>
        </div>
        }
        {this.state.data &&
        <Descriptions layout='vertical' column={3}>
            <Descriptions.Item
                label="Download">{Number(this.state.data?.network?.speed?.down?.value).toFixed(2)} {this.state.data?.network?.speed?.down?.units}</Descriptions.Item>
            <Descriptions.Item
                label="Upload">{Number(this.state.data?.network?.speed?.up?.value).toFixed(2)} {this.state.data?.network?.speed?.up?.units}</Descriptions.Item>
            <Descriptions.Item
                label="Date">{parseDateAndTimeLocal(this.state.data.network.speed.date)}</Descriptions.Item>
        </Descriptions>
        }
      </Card>
    </div>
  }


  render() {
    return (
      <>
        <Modal
          title="Speed Test Running"
          visible={this.state.isSpeedTestProcessing}
          onCancel={() => this.setState({ isSpeedTestProcessing: false })}
        >
          <Col span={12}>
            <Countdown
              title="Finished in"
              value={Date.now() + 60000}
              onFinish={async () => {
                await this.fetchDeviceDetails();
                this.setState({ isSpeedTestProcessing: false });
              }}/>
          </Col>
        </Modal>

        <div>{this.renderDeviceDetails()}</div>

      </>
    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
});


export default connect(mapState, mapDispatch)(EeroEerosDetails);
