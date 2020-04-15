import { Tag } from 'antd';
import React from 'react';

interface Props {
  ragStatus: number;
}

class RagStatusTag extends React.Component<Props> {

  renderRagTag(ragStatus: number) {
    switch (ragStatus) {
      case 0:
        return <Tag className="record-rag-status-tag" color="blue">Blue</Tag>;
      case 1:
        return <Tag className="record-rag-status-tag" color="green">Green</Tag>;
      case 2:
        return <Tag className="record-rag-status-tag" color="orange">Amber</Tag>;
      case 3:
        return <Tag className="record-rag-status-tag" color="red">Red</Tag>;
      case 4:
        return <Tag className="record-rag-status-tag" color="purple">Purple</Tag>;
      default:
        return <Tag className="record-rag-status-tag">Default</Tag>;
    }
  }

  render() {
    const { ragStatus } = this.props;
    return (
      <span>
        {this.renderRagTag(ragStatus)}
      </span>
    )
  }
}

export default RagStatusTag;
