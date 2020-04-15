import {Card, List, Tag, Typography} from 'antd';
import React from 'react';
import dayjs from 'dayjs'
import { Link } from 'react-router-dom';
import { httpPost } from '../../../../../shared/http/requests';
import DayjsDatePicker from '../../../../../shared/components/DayjsDatePicker/DayjsDatePicker'
import {getBrowserPath} from "../../../../../shared/utilities/recordHelpers";
import {parseDateLocalizedHours} from "../../../../../shared/utilities/dateHelpers";
const { RangePicker } = DayjsDatePicker;

interface Props {
  title: string,
  API: string,
  countAPI?: string,
  link: string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
  count: number,
}

class BillingTemplateDataList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      isLoading: false,
      count: 0,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount(): void {
    this.fetchData({});
  }

  private async fetchData(data: object) {
    const { API, countAPI } = this.props;
    this.setState({
      isLoading: true,
    });

    await httpPost(
      `${API}`, data
    ).then(res => {
      this.setState({ data: res.data && Array.isArray(res.data.data) ? res.data.data : [], isLoading: false })
    },
    ).catch(err => {
      console.error('Error while fetching: ', err);
      this.setState({ isLoading: false });
    });

    if(countAPI){
    await httpPost(
      `${countAPI}`, data
    ).then(res => {
      const count = res.data && Array.isArray(res.data.data) ? res.data.data[0] && res.data.data[0].count || 0 : res.data.data?.sum||[]

      this.setState({
        count,
        isLoading: false
      })
    },
  
    ).catch(err => {
      console.error('Error while fetching: ', err);
      this.setState({ isLoading: false });
    });
    }
  }

  render() {
    const { data, count, isLoading } = this.state;
    const { title, link } = this.props;

    // @ts-ignore
    return (
      <Card
        size="small"
        title={`${title}: ${count||data?.length}`}
        bodyStyle={{ height: 'calc(100% - 44px)', overflow: 'auto' }}
        style={{
          height: 300,
        }}
      >
        <List
          loading={isLoading}
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                description={
                  <div style={{ display: 'flex' }}>
                    <Tag color="blue">{item.status}</Tag>
                    <Link to={link.replace(':id', item.id)} component={Typography.Link}>{item.title}</Link>
                    {item.created_at?
                    <div style={{ marginLeft: 16 }}>created: {parseDateLocalizedHours(item.created_at)}</div>:
                    <div></div>}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>)
  }
}

export default BillingTemplateDataList
  ;
