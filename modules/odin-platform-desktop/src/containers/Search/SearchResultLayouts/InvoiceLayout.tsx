import React from 'react';
import {DbRecordEntityTransform} from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import {Button} from "antd";

interface Props {
  result: DbRecordEntityTransform,
  onClose: any,
  globalCollapsed: boolean
}

interface State {
  collapsed: boolean
}

class InvoiceLayout extends React.Component<Props, State> {

  constructor(props: any) {
    super(props)
    this.state = {collapsed: false}
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (!prevProps.globalCollapsed && this.props.globalCollapsed) {
      this.setState({collapsed: true})
    }
    if (prevProps.globalCollapsed && !this.props.globalCollapsed) {
      this.setState({collapsed: false})
    }
  }

  render(){
    const result = this.props.result;

    return(
      <div>
        <p>
          <span>Invoice #</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{result.recordNumber}</span>
        </p>
        <p>
          <span>Status</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{result.properties.Status}</span>
        </p>

        <div className={this.state.collapsed ? 'resultCollapseOpened':'resultCollapseClosed'}>
          <p>
            <span>Due date</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{result.properties.DueDate}</span>
          </p>
          <p>
            <span>Total Due</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{result.properties.TotalDue}</span>
          </p>
        </div>

        <Button
          style={{width: '100%'}}
          size="small"
          onClick={
            (e) => this.setState({collapsed: !this.state.collapsed})
          }
        >{this.state.collapsed ? '-' : '+' }</Button>
      </div>
    )
  }
}

export default InvoiceLayout
