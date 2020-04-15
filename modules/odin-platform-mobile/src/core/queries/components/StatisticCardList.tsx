import { Card, List } from 'antd';
import React from 'react';
import { httpGet } from '../../../shared/http/requests';

interface Props {
  title: string,
  queryName: string,
  queryParams: string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
}

class QueryStatisticCardList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      isLoading: false,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount(): void {
    this.fetchData();
  }

  private async fetchData() {

    const { queryName, queryParams } = this.props;

    this.setState({ isLoading: true });

    await httpGet(
      `connect/v1.0/queries/run?name=${queryName}&${queryParams}`,
    ).then(res => {
        console.log('QUERY_RES', res);
        this.setState({ data: res.data.data, isLoading: false })
      },
    ).catch(err => {
      console.error('Error while fetching: ', err);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { data, isLoading } = this.state;
    const { title } = this.props;

    console.log('data', data);

    return (
      <div>
        <List
          loading={isLoading}
          header={title}
          grid={{ gutter: 16, column: 4 }}
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item>
              <Card title={item.stage}>
                <div>Total: {item.total_count}</div>
                <div>Blue: {item.rag_blue_count}</div>
                <div>Green: {item.rag_green_count}</div>
                <div>Amber: {item.rag_amber_count}</div>
                <div>Red: {item.rag_red_count}</div>
              </Card>
            </List.Item>
          )}
        />
      </div>)
  }
}

export default QueryStatisticCardList;
