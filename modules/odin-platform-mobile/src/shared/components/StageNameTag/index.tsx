import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Tag } from 'antd';
import React from 'react';

interface Props {
  text: any,
  record: DbRecordEntityTransform
}

class StageNameTag extends React.Component<Props> {

  /* Get stage, return background and foreground color */
  getStageColor(stagePosition: number): string {
    switch (stagePosition) {
      case 1:
        return 'cyan';

      case 2:
        return 'blue';

      case 3:
        return 'geekblue';

      case 4:
        return 'purple';

      case 5:
        return 'lime';

      case 6:
        return 'gold';

      case 7:
        return 'orange';

      case 8:
        return 'volcano';

      default:
        return '';
    }
  }

  renderStageTag() {

    const { text, record } = this.props;

    if(record && record.stage) {
      if(record.stage.isSuccess) {
        return <Tag className="record-stage-tag" color="green">{text}</Tag>
      } else if(record.stage.isFail) {
        return <Tag className="record-stage-tag" color="red">{text}</Tag>
      } else if(record.stage.position) {
        return <Tag className='record-stage-tag' color={this.getStageColor(record.stage.position)}>{text}
        </Tag>
      } else {
        return <Tag className='record-stage-tag' color="default">{text}</Tag>
      }
    }
  }


  render() {
    return (
      <div>
        {this.renderStageTag()}
      </div>
    )
  }
}

export default StageNameTag;
