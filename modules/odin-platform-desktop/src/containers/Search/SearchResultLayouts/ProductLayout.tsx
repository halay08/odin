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

class ProductLayout extends React.Component<Props, State> {
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


  render() {
    const result = this.props.result;

    return (
      <div>

        {/* Product # */}
        <p>
          <span>Product #</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{result.recordNumber}</span>
        </p>

        {/* Title */}
        <p>
          <span>Title</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{result.title}</span>
        </p>

        {/* Additional information ------------------------------------------------------- */}
        <div className={this.state.collapsed ? 'resultCollapseOpened' : 'resultCollapseClosed'}>

          {/* Price */}
          <p>
            <span>Unit Price</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{result.properties.UnitPrice}</span>
          </p>

          {/* Contract type */}
          <p>
            <span>Contract Type</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{result.properties.ContractType}</span>
          </p>

        </div>
        <Button
          style={{width: '100%'}}
          size="small"
          onClick={
            (e) => this.setState({collapsed: !this.state.collapsed})
          }
        >{this.state.collapsed ? '-' : '+'}</Button>

      </div>
    )
  }
}

export default ProductLayout
