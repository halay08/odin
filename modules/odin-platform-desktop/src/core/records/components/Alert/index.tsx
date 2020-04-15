import { CheckCircleTwoTone } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Card } from 'antd';
import React from 'react';


interface Props {
  record: DbRecordEntityTransform
}

interface State {
}

class RecordAlert extends React.Component<Props, State> {

  render() {
    return (
      <Card size="small" title="Alerts" bordered style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'center', height: 36 }}>
          <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 36 }}/>
        </div>
      </Card>
    )
  }
}

export default RecordAlert;
