import React from 'react';
import { Statistic } from 'antd';
import { connect } from "react-redux";
import { IRecordReducer } from "../../../../../core/records/store/reducer";
import { SchemaReducerState } from "../../../../../core/schemas/store/reducer";
import RecordPageHeader from "../../../../../core/records/components/PageHeader";
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import { getProperty } from "@d19n/models/dist/schema-manager/helpers/dbRecordHelpers";


interface IProps {
  userReducer: any,
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState
}

class PageHeader extends React.Component<IProps> {

  extraContent() {
    const { record } = this.props;
    return <div
      style={{
        display: 'flex',
        width: 'max-content',
        justifyContent: 'flex-end',
      }}
    >
      <Statistic
        title="Status"
        value={getProperty(record, 'Status')}
        style={{
          marginRight: 32,
        }}
      />
      <Statistic title="Amount" prefix="£" value={getProperty(record, 'Amount')}/>
    </div>
  };

  renderContent() {
    return [];

  }

  render() {
    const { record } = this.props;
    return (
      <RecordPageHeader record={record} descriptions={this.renderContent()} extraContent={this.extraContent()}/>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});


export default connect(mapState)(PageHeader);





