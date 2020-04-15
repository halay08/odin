import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Descriptions, List, Popconfirm, Typography } from 'antd';
import React, { ReducerAction } from 'react';
import { connect } from 'react-redux';
import { deleteSipwiseSubscriberRequest, IDeleteSipwiseSubscriber } from '../../../../../core/service/store/actions';
import { IServiceReducer } from '../../../../../core/service/store/reducer';

interface Props {
  record: DbRecordEntityTransform,
  serviceReducer: IServiceReducer,
  deleteRequest: (params: IDeleteSipwiseSubscriber) => ReducerAction<any>
}

interface State {
}

class SipwiseSubscriber extends React.Component<Props, State> {

  renderList() {
    const { record, serviceReducer, deleteRequest } = this.props;
    // @ts-ignore
    const listItem = serviceReducer.list[record?.id];

    if(listItem) {

      const subscriber: object[] = listItem['subscriber'];

      return subscriber.map((elem: any) =>
        <Descriptions
          style={{ marginTop: 10 }}
          bordered
          size="small"
          layout="vertical"
          column={3}
          title={`Subscriber`}
          extra={<Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => deleteRequest({
              contact_id: getProperty(record, 'ExternalId'),
              recordId: record.id,
              subscriberId: elem.id,
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
          <Descriptions.Item
            label="full number">{elem.primary_number.cc} {elem.primary_number.ac} {elem.primary_number.sn}</Descriptions.Item>
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
  deleteRequest: (params: IDeleteSipwiseSubscriber) => dispatch(deleteSipwiseSubscriberRequest(params)),
});

export default connect(mapState, mapDispatch)(SipwiseSubscriber);
