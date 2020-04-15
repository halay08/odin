import { Descriptions } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { parseDateToLocalFormat } from '../../../shared/utilities/dateHelpers';

interface IProps {
  detail: any;
}

class DetailTabTemplate extends React.Component<IProps> {
  renderContent() {
    const { detail } = this.props;
    return (
      <Descriptions column={1} layout="horizontal" size="small">
        {detail.map((data: any, index: number) => this.renderData(data, index))}
      </Descriptions>
    );
  }

  renderData(data: any, index: number) {
    switch (data.label) {
      case 'Created At':
        return (
          <Descriptions.Item key={index} label={data.label}>
            {parseDateToLocalFormat(!!data.text ? data.text : '')}
          </Descriptions.Item>
        );
      case 'Updated At':
        return (
          <Descriptions.Item key={index} label={data.label}>
            {parseDateToLocalFormat(!!data.text ? data.text : '')}
          </Descriptions.Item>
        );
      default:
        return (
          <Descriptions.Item key={index} label={data.label}>
            {data.text}
          </Descriptions.Item>
        );
    }
  }

  render() {
    return this.renderContent();
  }
}

const mapState = (state: any) => ({});

export default connect(mapState)(DetailTabTemplate);
