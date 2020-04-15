import { Card } from 'antd';
import React, { ReactNode } from 'react';

interface Props {
  title: string,
  defaultTabKey: string,
  tabList: { key: string, tab: ReactNode }[],
  contentList: { [key: string]: ReactNode },
}

class TabsCard extends React.Component<Props> {

  state = {
    key: undefined,
  };

  onTabChange = (key: string, type: string) => {
    console.log(key, type);
    this.setState({ [type]: key });
  };

  render() {

    const { title, defaultTabKey, tabList, contentList } = this.props;

    return (
      <>
        <Card
          style={{ width: '100%' }}
          title={title}
          // extra={}
          tabList={tabList}
          defaultActiveTabKey={defaultTabKey}
          activeTabKey={this.state.key}
          onTabChange={key => {
            this.onTabChange(key, 'key');
          }}
        >
          {contentList[this.state.key || defaultTabKey]}
        </Card>
      </>
    );
  }
}

export default TabsCard;
