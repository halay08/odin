import React from 'react';
import { connect } from "react-redux";
import RecordPageHeader from "../../../../../core/records/components/PageHeader";
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";


interface IProps {
  userReducer: any,
  record: DbRecordEntityTransform,
}

class PageHeader extends React.Component<IProps> {

  extraContent() {
  };

  renderContent() {
    return []
  }

  render() {
    const { record } = this.props;

    return (
      <RecordPageHeader record={record} descriptions={this.renderContent()}
                        extraContent={this.extraContent()}/>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});


export default connect(mapState)(PageHeader);





