import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Card, Descriptions } from 'antd';
import React from 'react';
import { parseDateLocalizedHours } from '../../../../shared/utilities/dateHelpers';


interface Props {
  record: DbRecordEntityTransform | undefined
}

class RecordCollaborators extends React.Component<Props> {

  render() {

    const { record } = this.props;

    return (
      <>
        <Card size="small" title="Collaborators" bordered style={{ marginBottom: 10 }}>
          <Descriptions size="small" column={1}>
            <Descriptions.Item
              label="Creator">{!!record && record.createdBy ? record.createdBy['fullName'] : null}</Descriptions.Item>
            <Descriptions.Item
              label="Modifier">{!!record && record.lastModifiedBy ? record.lastModifiedBy['fullName'] : null}</Descriptions.Item>
            <Descriptions.Item
              label="Owner">{!!record && record.ownedBy ? record.ownedBy['fullName'] : null}</Descriptions.Item>
            <Descriptions.Item
              label="Created">{!!record ? parseDateLocalizedHours(record.createdAt) : ''}</Descriptions.Item>
            <Descriptions.Item
              label="Last Modified">{!!record ? parseDateLocalizedHours(record.updateAt) : ''}</Descriptions.Item>
          </Descriptions>
        </Card>
      </>
    )
  }
}

export default RecordCollaborators;
