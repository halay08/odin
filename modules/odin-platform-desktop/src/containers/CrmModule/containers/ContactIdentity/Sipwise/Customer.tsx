import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Descriptions, List, Popconfirm, Typography } from 'antd';
import React, { ReducerAction } from 'react';
import { connect } from 'react-redux';
import { deleteSipwiseCustomerRequest, IDeleteSipwiseCustomer } from '../../../../../core/service/store/actions';
import { IServiceReducer } from '../../../../../core/service/store/reducer';

interface Props {
  record: DbRecordEntityTransform,
  serviceReducer: IServiceReducer
  deleteRequest: (params: IDeleteSipwiseCustomer) => ReducerAction<any>
}

interface State {
}

class SipwiseCustomer extends React.Component<Props, State> {

  renderList() {
    const { record, serviceReducer, deleteRequest } = this.props;
    // @ts-ignore
    const listItem = serviceReducer.list[record?.id];

    if(listItem) {

      const customer: object[] = listItem['customer'];

      return customer.map((elem: any) =>
        <Descriptions
          style={{ marginTop: 10 }}
          bordered
          size="small"
          layout="vertical"
          column={3}
          title={`Customer`}
          extra={<Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => deleteRequest({
              contact_id: getProperty(record, 'ExternalId'),
              recordId: record.id,
              customerId: elem.id,
            })}
            okText="Yes"
            cancelText="No"
          >
            <Button
              size="small"
              type="text"
              key="2" danger>Delete</Button>
          </Popconfirm>}>
          <Descriptions.Item label="id">{elem.id}</Descriptions.Item>
          <Descriptions.Item label="status">{elem.status}</Descriptions.Item>
          <Descriptions.Item label="type">{elem.type}</Descriptions.Item>
        </Descriptions>,
      )
    }

    return <List
      dataSource={[]}
      renderItem={item => (
        <List.Item>
          <Typography.Text/>
        </List.Item>
      )}
    />
  }

  render() {
    return (
      this.renderList()
    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  serviceReducer: state.serviceReducer,
});

const mapDispatch = (dispatch: any) => ({
  deleteRequest: (params: IDeleteSipwiseCustomer) => dispatch(deleteSipwiseCustomerRequest(params)),
});

export default connect(mapState, mapDispatch)(SipwiseCustomer);
