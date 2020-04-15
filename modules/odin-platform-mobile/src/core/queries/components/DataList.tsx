import { Card, List, Tag, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { httpGet } from '../../../shared/http/requests';
import { parseDateLocalizedHours } from '../../../shared/utilities/dateHelpers';

interface Props {
  title: string,
  queryName: string,
  queryParams: string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
}

class QueryDataList extends React.Component<Props, State> {

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

    return (
      <Card style={{ height: 300, overflow: 'auto' }}>
        <List
          loading={isLoading}
          header={title}
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={<Link to={`/${item.module_name}/${item.entity_name}/${item.id}`}
                             component={Typography.Link}>{item.title}</Link>}
                description={
                  <div style={{ display: 'flex' }}>
                    <Tag color="blue">{item.stage_name}</Tag>
                    <div style={{ marginRight: 8 }}>created: {parseDateLocalizedHours(item.created_at)}</div>
                    <div style={{ marginRight: 8 }}>updated: {parseDateLocalizedHours(item.updated_at)}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>)
  }
}

export default QueryDataList;
