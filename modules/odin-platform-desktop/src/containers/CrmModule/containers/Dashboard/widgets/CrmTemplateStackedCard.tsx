import {Card, Typography} from 'antd';
import React from 'react';
import { httpPost } from '../../../../../shared/http/requests';

const { Text, Title } = Typography;

interface Props {
  title: string,
  API: string,
  tag: string,
  dateTo: string | Date,
  dateFrom: string | Date,
  options?: any,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
  defaultDateFrom: string | Date,
  defaultDateTo: string | Date,
}

class CrmTemplateStackedCard extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      isLoading: false,
      defaultDateFrom: '',
      defaultDateTo: '',
    };

    this.fetchData = this.fetchData.bind(this);
  }

  componentDidMount(): void {
    this.fetchData({
      to: this.props.dateTo,
      from: this.props.dateFrom,
    });
  }

  private async fetchData(data: object) {

    this.setState({
      isLoading: true,
    });

    await httpPost(
        `${this.props.API}`, data,
    ).then(res => {
          this.setState({ data: res?.data?.data, isLoading: false })
        },
    ).catch(err => {
      console.error('Error while fetching: ', err);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { data, isLoading } = this.state;
    const { title, tag, options } = this.props;
    const { prefix, colors, amount, count, labels } = options
    const colorsSize = colors && colors.length

    return (
      <Card
        size="small"
        title={`${title}`}
        style={{ minHeight: 300, height: '100%', overflow: 'auto' }}
      >
        {data.map((item: any, key:any) => (
          <Card
            key={key}
            style={{
              textAlign: 'center',
              marginBottom: 16,
              background: colors ? colors[key % colorsSize] : 'white',
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{labels && labels[item[options.title]] || item[options.title]}</Text>
            </div>
            <div>
              <Text style={{ fontSize: 36, lineHeight: 1.57 }} strong>{prefix + (item[amount]|| 0)}</Text>
            </div>
            <div>
              <Text>total: {item[count]}</Text>
            </div>
          </Card>
        ))}
      </Card>)
  }
}

export default CrmTemplateStackedCard;
