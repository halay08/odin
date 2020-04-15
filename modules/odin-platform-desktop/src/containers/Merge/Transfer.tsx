import { Card, Transfer } from 'antd';
import React from 'react';
import { connect } from 'react-redux';

const mockData: any[] = [];
for(let i = 0; i < 20; i++) {
  mockData.push({
    key: i.toString(),
    title: `content${i + 1}`,
    description: `description of content${i + 1}`,
    disabled: i % 3 < 1,
  });
}

const oriTargetKeys = mockData.filter(item => +item.key % 3 > 1).map(item => item.key);

interface Props {

}

interface State {

}

class TransferAssociations extends React.Component<Props, State> {
  state = {
    targetKeys: oriTargetKeys,
    selectedKeys: [],
    disabled: false,
  };

  handleChange = (nextTargetKeys: any, direction: any, moveKeys: any) => {
    this.setState({ targetKeys: nextTargetKeys });

    console.log('targetKeys: ', nextTargetKeys);
    console.log('direction: ', direction);
    console.log('moveKeys: ', moveKeys);
  };

  handleSelectChange = (sourceSelectedKeys: any, targetSelectedKeys: any) => {
    this.setState({ selectedKeys: [ ...sourceSelectedKeys, ...targetSelectedKeys ] });

    console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    console.log('targetSelectedKeys: ', targetSelectedKeys);
  };

  handleScroll = (direction: any, e: any) => {
    console.log('direction:', direction);
    console.log('target:', e.target);
  };

  handleDisable = (disabled: any) => {
    this.setState({ disabled });
  };

  render() {
    const { targetKeys, selectedKeys, disabled } = this.state;
    return (
      <>
        <Card title="Merge Associations">
          <Transfer
            dataSource={mockData}
            titles={[ 'Source', 'Target' ]}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            onScroll={this.handleScroll}
            render={item => item.title}
            disabled={disabled}
            style={{ marginBottom: 16 }}
          />
        </Card>
      </>
    );
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({});


export default connect(mapState, mapDispatch)(TransferAssociations);
