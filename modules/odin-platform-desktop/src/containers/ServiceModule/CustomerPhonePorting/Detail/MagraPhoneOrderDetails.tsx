import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Card, Descriptions } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { httpGet } from '../../../../shared/http/requests';
import { displayMessage } from '../../../../shared/system/messages/store/reducers';

interface Props {
  record: DbRecordEntityTransform,
  alertMessage: any,
}

interface State {
  isSpeedTestProcessing: boolean,
  isLoading: boolean,
  data: any
}

class MagraPhonOrderDetails extends React.Component<Props, State> {

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
        `ServiceModule/v1.0/voice/magra/order/${getProperty(record, 'MagraOrderId')}`,
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

  renderDetails() {
    return <div>
      <Card loading={this.state.isLoading} title="Order Details" style={{ marginBottom: 24 }}>
        {this.state.data &&
        <Descriptions layout='vertical' column={3}>
            <Descriptions.Item label="Order No">{this.state.data.OrderNo}</Descriptions.Item>
            <Descriptions.Item label="Main Bill No">{this.state.data.MainBillNo}</Descriptions.Item>
            <Descriptions.Item label="LoA">{this.state.data.LoA}</Descriptions.Item>
            <Descriptions.Item label="LCP">{this.state.data.LCP}</Descriptions.Item>
            <Descriptions.Item label="Range Holder">{this.state.data.RangeHolder}</Descriptions.Item>
            <Descriptions.Item label="Port Date">{this.state.data.PortDate}</Descriptions.Item>
            <Descriptions.Item label="Status Date">{this.state.data.StatusDate}</Descriptions.Item>
            <Descriptions.Item label="Status">{this.state.data.Status}</Descriptions.Item>
            <Descriptions.Item label="Status Text">{this.state.data.StatusText}</Descriptions.Item>
            <Descriptions.Item label="Target">{this.state.data.Target}</Descriptions.Item>
        </Descriptions>
        }
      </Card>
    </div>
  }


  render() {
    return (
      <div>{this.renderDetails()}</div>
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


export default connect(mapState, mapDispatch)(MagraPhonOrderDetails);
