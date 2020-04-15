import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import React from 'react';
import { connect } from 'react-redux';
import { getSipwiseFullProfileRequest, IGetSipwiseCustomerContact } from '../../../../../core/service/store/actions';
import SipwiseCustomer from './Customer';
import SipwiseCustomerContact from './CustomerContact';
import SipwiseSubscriber from './Subscriber';

interface Props {
  record: DbRecordEntityTransform,
  getProfile: any
}

interface State {
}

class SipwiseDetail extends React.Component<Props, State> {

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    const { record, getProfile } = this.props;

    getProfile({ recordId: record?.id, contact_id: getProperty(record, 'ExternalId') });

  }

  render() {

    const { record } = this.props;

    return (
      <>
        <SipwiseCustomerContact record={record}/>
        <SipwiseCustomer record={record}/>
        <SipwiseSubscriber record={record}/>
      </>
    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getProfile: (params: IGetSipwiseCustomerContact) => dispatch(getSipwiseFullProfileRequest(params)),
});

export default connect(mapState, mapDispatch)(SipwiseDetail);
