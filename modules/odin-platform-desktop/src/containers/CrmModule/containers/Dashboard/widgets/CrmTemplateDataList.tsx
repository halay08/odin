import { Card, List, Tag } from 'antd';
import React from 'react';
import { httpPost } from '../../../../../shared/http/requests';
import ReactApexChart from "react-apexcharts";

interface Props {
  title: string,
  API: string,
  tag: string,
  dateTo: string | Date,
  dateFrom: string | Date,
  chart?: string,
  prefix?: any,
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
  defaultDateFrom: string | Date,
  defaultDateTo: string | Date,
}

const chartOptionsBar: any = {
  chart: {
    type: 'bar',
  },
  plotOptions: {
    bar: {
      horizontal: true,
      dataLabels: {
        position: 'end',
        orientation: 'horizontal'
      },
    }
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'top',
    offsetX: 120,
    style: {
      colors: ['black']
    },
    dropShadow: {
      enabled: false
    }
  },
  xaxis: {
    categories: [10, 20]
  },
  yaxis: {
    show: true,
    showAlways: true,
    showForNullSeries: true,
    forceNiceScale: true,
    floating: false,
    title: {
      text: undefined,
      rotate: -90,
      offsetX: 0,
      offsetY: 0,
      style: {
        color: undefined,
        fontSize: '12px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 600,
        cssClass: 'apexcharts-yaxis-title',
      },
    },
    labels: {
      align: 'right',
      offsetX: 0,
      rotate: 0,
      maxWidth: 250,
      width: 150,
      style: {
        colors: [],
        fontSize: '10px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 400,
        cssClass: 'apexcharts-yaxis-label',
      },
      formatter: (value: string) => {
        return value
      },
      tooltip: {
        enabled: true,
        offsetX: 0,
        formatter: undefined,
        title: {
          formatter: (seriesName: any) => seriesName,
        },
      },
    },
    tooltip: {
      enabled: true,
      offsetX: 0,
    },
  }
}
const chartOptionsStackedBar: any = {
  chart: {
    type: 'bar',
    height: 350,
    stacked: true,
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      horizontal: true,
    },
  },
  stroke: {
    width: 1,
    colors: ['#fff']
  },
  theme: {
    monochrome: {
      enabled: true
    }
  },
  yaxis: {
    title: {
      text: undefined
    },
  },
  tooltip: {
    y: {
      formatter: function (val: any, data: any) {
        let prefix = ''

        // Show prefix
        if (data?.w?.config?.prefix?.index === data?.seriesIndex) {
          prefix = data?.w?.config?.prefix?.value
        }

        return `${prefix}${val}`
      }
    }
  },
  fill: {
    opacity: 1
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'left',
    offsetX: 40
  },
  dataLabels: {
    enabled: true,
    dropShadow: {
      enabled: true
    }
  },
}
const chartOptionsPie: any = {
  chart: {
    type: 'pie',
  },
  theme: {
    monochrome: {
      enabled: true
    }
  },
  legend: {
    position: 'bottom',
    markers: {
      radius: 2
    }
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: any, opts: any) {
      console.log('label', val, opts)
      return `${opts.w?.config?.series[opts.seriesIndex]} (${Math.round(val * 10) / 10}%)`
    },
  },
  responsive: [{
    breakpoint: 280,
    options: {
      chart: {
        width: 100
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
}

class CrmTemplateDataList extends React.Component<Props, State> {

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
    const { title, tag, chart, prefix } = this.props;
    const alternative = tag === 'notinterstedreason'? 'NO_REASON':'';
    const categories: any[] = data && data.map(item => item[tag] || alternative );
    const series: any[] = []

    data && data.forEach(item => {
      if (chart === 'stackedBar') {
        Object.keys(item).filter(prop => prop !== tag).map(prop => {
          const index = series.findIndex(i => i.name === prop)
          if (index > -1) {
            series[index].data.push(parseFloat(item[prop] || 0))
          } else {
            series.push({
              name: prop,
              data: [parseFloat(item[prop])]
            })
          }
        })
      } else {
        Object.keys(item).filter(prop => prop !== tag).map(prop => {
          series.push(parseFloat(item[prop] || 0))
        })
      }
    })

    const isChart = series && series.length > 0 && categories && categories.length > 0

    return (
      <Card
        size="small"
        title={`${title}`}
        style={{ minHeight: 300, height: '100%', overflow: 'auto' }}
      >
        {false && <List // TODO Remove hided data
          bordered
          loading={isLoading}
          dataSource={data}
          style={{marginBottom: 16}}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta
                description={
                  <div style={{ display: 'flex' }}>
                    <Tag color="blue">{item[tag]}</Tag>

                    {Object.keys(item).filter(prop => prop !== tag).map(prop => {
                      let prefix = ''
                      let style = {}

                      switch (prop) {
                        case 'sum':
                          prefix = '£'
                          break
                        case 'count':
                          style = {...style, fontSize: 11, marginTop: 4}
                          break
                        default:
                      }

                      return <div style={{ marginRight: 8, ...style }}>{prop}: {prefix + item[prop]}</div>
                    })}
                  </div>
                }
              />
            </List.Item>
          )}
        />}

        {isChart && chart === 'pie' &&
          <ReactApexChart
            options={{...chartOptionsPie, labels: categories}}
            series={series}
            type="pie"
          />}

        {isChart && chart === 'bar' &&
          <ReactApexChart
            options={{...chartOptionsBar, xaxis: {categories}}}
            series={[{data: series}]}
            type="bar"
            height={350}
          />}

        {isChart && chart === 'stackedBar' &&
          <ReactApexChart
            options={{...chartOptionsStackedBar, xaxis: {categories}, prefix}}
            series={series}
            type="bar"
            height={350}
          />}
      </Card>)
  }
}

export default CrmTemplateDataList;
