import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Table } from 'antd';
import React from 'react';
import { httpGet } from '../../../shared/http/requests';
import { parseDateToLocalFormat } from '../../../shared/utilities/dateHelpers';

interface Props {
  record: DbRecordEntityTransform,
  filterBy: 'MANDATE' | 'PAYMENT' | 'REFUND'
}

interface State {
  data: { [key: string]: any }[];
  isLoading: boolean;
}

class GoCardlessActivityFeed extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      isLoading: false,
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.fetchGoCardlessActivity();
    }
  }

  private async fetchGoCardlessActivity() {

    const { record, filterBy } = this.props;

    if(record) {

      let query: string | undefined = undefined;
      this.setState({ isLoading: true });

      if(filterBy === 'MANDATE') {
        query = `links_mandate=${getProperty(record, 'ExternalRef')}`
      } else if(filterBy === 'PAYMENT') {
        query = `links_payment=${getProperty(record, 'ExternalRef')}`
      } else if (filterBy === 'REFUND'){
        query = `links_refund=${getProperty(record, 'ExternalRef')}`
      }

      if(query) {

        await httpGet(
          `BillingModule/v1.0/gocardless/events/search/?${query}`,
        ).then(res => {
            this.setState({ data: res.data.data, isLoading: false })
          },
        ).catch(err => {

          console.error('Error while fetching GoCardless activity: ', err);

          this.setState({ isLoading: false });
        });
      } else {

        this.setState({ isLoading: false });
      }
    }
  }

  getTableColumns() {
    return [
      {
        title: 'Type',
        dataIndex: 'resource_type',
        key: 'resource_type',
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
      },
      {
        title: 'Cause',
        dataIndex: 'cause',
        key: 'cause',
      },
      {
        title: 'Description',
        dataIndex: 'details_description',
        key: 'details_description',
      },
      {
        title: 'Origin',
        dataIndex: 'origin',
        key: 'origin',
      },
      {
        title: 'Created at',
        dataIndex: 'created_at',
        key: 'created_at',
      },
    ];
  }

  getTableData(data: { [key: string]: any }[]) {
    if(data && data.length > 0) {
      return data.map((elem) => {

        return {
          key: elem.id,
          resource_type: elem.resource_type,
          action: elem.action,
          cause: elem.details_cause,
          details_description: elem.details_description,
          origin: elem.details_origin,
          created_at: parseDateToLocalFormat(elem.createdAt),
        }
      });
    }
  }

  render() {
    const { data, isLoading } = this.state;
    console.log('BILLING ELEMENT: ', data)
    return (
      <div>
        <div style={{ marginTop: '10px' }}>
          <Table size="small" loading={isLoading} columns={this.getTableColumns()}
                 dataSource={this.getTableData(data)}/>
        </div>
      </div>)
  }
}

export default GoCardlessActivityFeed;