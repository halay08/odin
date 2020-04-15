import { Card, Layout, Spin, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import { getRecordByIdRequest } from '../../../../../core/records/store/actions';
import { getRecordAssociationsRequest } from '../../../../../core/recordsAssociations/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { getPremiseByUdprnAndUmprnRequest } from '../store/actions';
import RecordPageHeader from './PageHeader';
import { IRecordReducer } from "../../../../../core/records/store/reducer";


interface Props {
  schemaReducer: SchemaReducerState,
  premiseReducer: any,
  recordAssociationReducer: any,
  getRecordById: any,
  loadAssociations: any,
  getPremiseByUdprnAndUmprn: any,
  recordReducer: IRecordReducer,

}

export class PremiseDetailView extends React.Component<Props> {

  componentDidMount(): void {
    this.fetchData();
  }

  fetchData() {

    const { premiseReducer, getPremiseByUdprnAndUmprn } = this.props;

    if(premiseReducer.selected) {

      getPremiseByUdprnAndUmprn({
        udprn: premiseReducer.selected.properties.UDPRN,
        umprn: premiseReducer.selected.properties.UMPRN
      });

    }

  }

  render() {

    const { premiseReducer } = this.props;

    return (

      <Layout className='premise-record-detail-view'>
        <RecordPageHeader record={premiseReducer.selected} refresh={() => this.fetchData()}/>
        <Card title="Premise Details" bordered={false}>
          <Spin spinning={premiseReducer.isRequesting}>
            <RecordProperties columns={1} record={premiseReducer.selected}/>
          </Spin>
        </Card>
      </Layout>

    )
  }
}

const mapState = (state: any) => ({
  premiseReducer: state.premiseReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  getRecordById: (payload: any) => dispatch(getRecordByIdRequest(payload)),
  loadAssociations: (payload: any) => dispatch(getRecordAssociationsRequest(payload)),
  getPremiseByUdprnAndUmprn: (params: any, cb: () => {}) => dispatch(getPremiseByUdprnAndUmprnRequest(params, cb)),
});


export default connect(mapState, mapDispatch)(PremiseDetailView);
