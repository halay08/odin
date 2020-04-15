import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Collapse, Descriptions, Divider, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { parseDateToLocalFormat } from '../../../../shared/utilities/dateHelpers';
import { SchemaReducerState } from '../../../schemas/store/reducer';

const { Panel } = Collapse;

interface Props {
  schemaReducer: SchemaReducerState,
  record: DbRecordEntityTransform | undefined,
  columns?: number,
}

class RecordPropertiesSummaryCard extends React.Component<Props> {

  renderListItemContent() {
    const { record, columns } = this.props;
    if(record) {
      return (
        <>
          <div>
            <Collapse defaultActiveKey={[]} ghost>
              <Panel header="view more" key="1">
                <Descriptions column={columns || 1} layout="horizontal" size="small">
                  {Object.keys(record.properties).map((elem, index) => (
                    index > 3 && this.renderDescriptionItemSimple(elem, getProperty(record, elem))
                  ))}
                </Descriptions>
              </Panel>
            </Collapse>

            <Divider/>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text>last
                modified: {record && record.lastModifiedBy ? record.lastModifiedBy.fullName : ''}</Typography.Text>
              <Typography.Text>created: {parseDateToLocalFormat(record.createdAt)}</Typography.Text>
            </div>
          </div>
        </>
      )
    }
  }

  private renderDescriptionItemSimple(key: string, value: any) {
    if(value) {
      return <Descriptions.Item key={key} label={key}>{value}</Descriptions.Item>
    }
  }

  render() {
    return (
      this.renderListItemContent()
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
});


export default connect(mapState)(RecordPropertiesSummaryCard);
