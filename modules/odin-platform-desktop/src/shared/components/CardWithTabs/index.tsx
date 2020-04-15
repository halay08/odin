import { Card, Tabs } from 'antd';
import React, { ReactNode } from 'react';

const { TabPane } = Tabs;

interface Props {
  title: string,
  defaultTabKey: string,
  tabList: { key: string, tab: ReactNode }[],
  contentList: { [key: string]: ReactNode },
  extra?: any
}

interface State {
}

class CardWithTabs extends React.Component<Props, State> {

  state = {
    key: undefined,
  };

  onTabChange = (key: string, type: string) => {
    this.setState({ [type]: key });
  };

  render() {

    const { title, defaultTabKey, tabList, contentList, extra } = this.props;

    return (
      <Card
        size="small"
        style={{ height: '100%', width: '100%', marginBottom: '1rem' }}
        title={title}
        defaultActiveTabKey={defaultTabKey}
        extra={extra}
      >
        <Tabs size="small" defaultActiveKey={defaultTabKey} activeKey={this.state.key} onTabClick={key => {
          this.onTabChange(key, 'key');
        }} destroyInactiveTabPane>
          {tabList && tabList.map(elem => (
            <TabPane tab={elem.tab} key={elem.key}>
              {contentList[elem.key]}
            </TabPane>
          ))}
        </Tabs>
      </Card>
    );
  }
}

export default CardWithTabs;
