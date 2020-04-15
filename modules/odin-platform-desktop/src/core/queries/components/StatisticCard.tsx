import { Card, Statistic } from 'antd';
import React from 'react';
import { httpGet } from '../../../shared/http/requests';

interface Props {
  title?: string,
  queryName: string,
  queryParams: string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
}

class QueryStatisticCard extends React.Component<Props, State> {

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
      `ConnectModule/v1.0/queries/run?name=${queryName}&${queryParams}`,
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
      <div>
        {data.map(elem => (
          <Card loading={isLoading}>
            <Statistic title={title || elem.entity_name} value={elem.total_count}/>
          </Card>
        ))}
      </div>)
  }
}

export default QueryStatisticCard;
