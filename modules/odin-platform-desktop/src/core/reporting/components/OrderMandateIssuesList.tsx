import { Card, List, Tag, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { httpGet } from '../../../shared/http/requests';

interface Props {
  title: string,
  path: string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
}

class OrderMandateIssuesList extends React.Component<Props, State> {

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

    const { path } = this.props;

    this.setState({ isLoading: true });

    await httpGet(
      `ConnectModule/v1.0/reporting/${path}`,
    ).then(res => {
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
          header={`${title} ${data ? data.length : 0}`}
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                title={<Link to={`/CrmModule/Contact/${item.contact_id}`}
                             component={Typography.Link}>{item.full_name}</Link>}
                description={
                  <div style={{ display: 'flex' }}>
                    <div>{item.order_title}</div>
                    <Tag color="blue">{item.stage_name}</Tag>
                    <div style={{ marginRight: 8 }}>{item.order_created}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>)
  }
}

export default OrderMandateIssuesList;
