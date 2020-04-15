import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Badge, Table, Tooltip, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import { httpGet } from '../../../../shared/http/requests';
import { SendGridEventTypes } from './SendGridEventTypes';


const { Text } = Typography;

interface Props {
  record: DbRecordEntityTransform,
}

interface State {
  mailData: any;
  isLoading: boolean;
}

class MailActivityFeed extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mailData: '',
      isLoading: false,
    };

  }

  componentDidMount(): void {
    this.fetchMailActivityByRecord();
  }

  private async fetchMailActivityByRecord() {
    const { record } = this.props;

    if(record) {

      this.setState({ isLoading: true });

      await httpGet(
        `NotificationModule/v1.0/sendgrid/mail-activity/${record.id}`,
      ).then(res => {
          this.setState({ mailData: res.data.data, isLoading: false })
        },
      ).catch(err => {
        console.error('Error while fetching mail activity: ', err);
        this.setState({ isLoading: false });
      });
    }
  }

  getTableColumns() {

    return [
      {
        title: 'Event',
        key: 'event',
        width: 100,
        dataIndex: 'event',
        render: (event: any) => <Tooltip placement="top" title={SendGridEventTypes(event).description}><Badge
          color={SendGridEventTypes(event).color} text={event}/></Tooltip>,
      },
      {
        title: 'Created',
        dataIndex: 'created',
        width: 100,
        key: 'created',
      },
      {
        title: 'E-mail',
        dataIndex: 'email',
        width: 100,
        key: 'email',
      },
      {
        title: 'IP Address',
        dataIndex: 'ipaddress',
        width: 100,
        key: 'ipaddress',
      },
    ];
  }

  getTableData(mailActivity: Array<any>) {

    if(mailActivity.length > 0) {
      return mailActivity.map((activity) => {
        return {
          key: '2',
          event: activity.event,
          created: moment(activity.createdAt).format('MMMM Do YYYY, h:mm:ss a'),
          email: activity.email,
          ipaddress: activity.ip ? activity.ip : '-',
        }
      });
    }

  }

  render() {
    const { isLoading } = this.state;
    return (
      <div style={{ marginTop: '15px' }}>
        <Table size="small" scroll={{ x: 1000, y: 300 }} loading={isLoading} columns={this.getTableColumns()}
               dataSource={this.getTableData(this.state.mailData)}/>
      </div>
    )
  }
}

export default MailActivityFeed;
