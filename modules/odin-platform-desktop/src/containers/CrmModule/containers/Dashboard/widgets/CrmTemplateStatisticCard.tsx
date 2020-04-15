import { Card, Statistic } from 'antd';
import React from 'react';
import { httpPost } from '../../../../../shared/http/requests';

interface Props {
  title: string,
  API: string,
  tag: string,
  dateTo: string | Date,
  dateFrom: string | Date,
  additionalValueSymbol?:string,
  alignCenter?: boolean,
  fullHeight?: boolean,
  colored?: boolean,
  size?: string,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
  defaultDateFrom: string | Date,
  defaultDateTo: string | Date,
}

const cardAlignStyles = {
  height: '100%',
  display:'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

class CrmTemplateStatisticCard extends React.Component<Props, State> {

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

    this.setState({ isLoading: true });

    await httpPost(
      `${this.props.API}`, data
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
    const { title, tag, additionalValueSymbol, colored, alignCenter, fullHeight, size } = this.props;

    return (
      <div style={{height: fullHeight ? '100%' : 'auto'}}>
        {data.map((elem: any, key: any) => (
          <Card
            key={`elem_${key}`}
            loading={isLoading}
            style={{minHeight: 100, height: '100%', textAlign: alignCenter ? 'center' : 'left'}}
            bodyStyle={fullHeight ? cardAlignStyles : {}}
          >
            <Statistic
              title={title}
              value={`${elem[tag]}${additionalValueSymbol||''}`}
              valueStyle={{
                color: colored ? (elem[tag] >= 0 ? 'green' : 'red') : 'black',
                fontSize: size === 'large' ? 36 : 24,
                fontWeight: size === 'large' ? 500 : 400,
              }}
            />
          </Card>
        ))}
      </div>)
  }
}

export default CrmTemplateStatisticCard;
