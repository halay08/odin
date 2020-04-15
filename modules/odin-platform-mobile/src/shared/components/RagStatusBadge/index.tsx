import { Badge } from 'antd';
import React from 'react';
import './styles.scss';

interface Props {
  ragStatus: number;
}

class RagStatusBadge extends React.Component<Props> {

  renderRagBadge(ragStatus: number) {
    switch (ragStatus) {
      case 0:
        return <Badge className="record-rag-status-badge" color="blue" status="success"/>;
      case 1:
        return <Badge className="record-rag-status-badge" color="green"/>;
      case 2:
        return <Badge className="record-rag-status-badge" color="orange"/>;
      case 3:
        return <Badge className="record-rag-status-badge" status="error"/>; // red
      case 4:
        return <Badge className="record-rag-status-badge" color="purple"/>;
      default:
        return <Badge className="record-rag-status-badge" color="grey"/>;
    }
  }

  render() {
    const { ragStatus } = this.props;
    return (
      <span>
        {this.renderRagBadge(ragStatus)}
      </span>
    )
  }
}

export default RagStatusBadge;