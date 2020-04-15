import { Card, Statistic } from 'antd';
import React from 'react';
import { httpPost } from '../../../../../shared/http/requests';

interface Props {
  title: string,
  API: string,
  tag: string,
  additionalValueSymbol?:string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
}

class BillingTemplateStatisticCard extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      isLoading: false,
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount(): void {
    this.fetchData({});
  }

  private async fetchData(data: object) {

    this.setState({ isLoading: true });

    await httpPost(
      `${this.props.API}`, data
    ).then(res => {
      console.log('res.data', res.data)
      this.setState({ data: res.data.data, isLoading: false })
    },
    ).catch(err => {
      console.error('Error while fetching: ', err);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { data, isLoading } = this.state;
    const { title, tag, additionalValueSymbol } = this.props;

    return (
      <div>
        {data.map((elem, key) => (
          <Card key={key} loading={isLoading} style={{ height: 100}} >
            <Statistic title={title} value={`${elem[tag]}${additionalValueSymbol||''}`} />
          </Card>
        ))}
      </div>)
  }
}

export default BillingTemplateStatisticCard;
