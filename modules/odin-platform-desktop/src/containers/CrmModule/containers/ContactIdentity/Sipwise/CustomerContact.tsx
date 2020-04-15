import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Descriptions, List, Popconfirm, Typography } from 'antd';
import React, { ReducerAction } from 'react';
import { connect } from 'react-redux';
import {
  deleteSipwiseCustomerContactRequest,
  IDeleteSipwiseCustomerContact,
} from '../../../../../core/service/store/actions';
import { IServiceReducer } from '../../../../../core/service/store/reducer';

interface Props {
  record: DbRecordEntityTransform,
  serviceReducer: IServiceReducer,
  deleteRequest: (params: IDeleteSipwiseCustomerContact) => ReducerAction<any>
}

interface State {
}

class SipwiseCustomerContact extends React.Component<Props, State> {

  renderList() {
    const { record, serviceReducer, deleteRequest } = this.props;
    // @ts-ignore
    const listItem = serviceReducer.list[record?.id];

    if(listItem) {

      const contact = listItem['customerContact'];

      return <Descriptions
        style={{ marginTop: 10 }}
        bordered
        size="small"
        layout="vertical"
        column={3}
        title="Customer Contact"
        extra={<Popconfirm
          title="Are you sure you want to delete this record?"
          onConfirm={() => deleteRequest({
            contact_id: getProperty(record, 'ExternalId'),
            recordId: record.id,
            customerContactId: contact.id,
          })}
          okText="Yes"
          cancelText="No"
        >
          <Button
            size="small"
            type="text"
            key="2" danger>Delete</Button>
        </Popconfirm>}>
        <Descriptions.Item label="id">{contact.id}</Descriptions.Item>
        <Descriptions.Item label="type">{contact.email}</Descriptions.Item>
      </Descriptions>
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
  deleteRequest: (params: IDeleteSipwiseCustomerContact) => dispatch(deleteSipwiseCustomerContactRequest(params)),
});

export default connect(mapState, mapDispatch)(SipwiseCustomerContact);
