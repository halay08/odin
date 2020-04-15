import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button, Tag } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import { getBrowserPath } from '../../../shared/utilities/recordHelpers';
import '../index.scss'

interface Props {
  result: DbRecordEntityTransform,
  onClose: any,
  globalCollapsed: boolean
}

interface State {
  collapsed: boolean
}

class OrderLayout extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = { collapsed: false }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (!prevProps.globalCollapsed && this.props.globalCollapsed) {
      this.setState({collapsed: true})
    }
    if (prevProps.globalCollapsed && !this.props.globalCollapsed) {
      this.setState({collapsed: false})
    }
  }

  renderOrderItemsInLinkableTags = (result: DbRecordEntityTransform) => {
    if(result.OrderItem && result.OrderItem.dbRecords) {
      return result.OrderItem.dbRecords.map((elem: DbRecordEntityTransform) => {
        return (
          <Link key={elem.title} to={getBrowserPath(elem)} onClick={() => this.props.onClose()}>
            <Tag color="blue">{elem.title}</Tag>
          </Link>
        )
      })

    } else return '-'
  }

  renderCommaSeparatedRelatedEntitiesWithLinks = (
    result: DbRecordEntityTransform,
    entityName: string,
    propertyName: string,
  ) => {
    if(result[entityName] && result[entityName].dbRecords) {
      return result[entityName].dbRecords.map((elem: DbRecordEntityTransform) =>
        <Link to={getBrowserPath(elem)} onClick={() => this.props.onClose()}>{elem[propertyName]}</Link>,
      ).reduce((prev: JSX.Element, current: JSX.Element): any => [ prev, (<span>, </span>), current ])
    } else return '-'
  }

  render() {
    const result = this.props.result;

    return (
      <div>
        <p>
          {/* Order # */}
          <span>Order #</span>
          <br/>
          <span style={{ fontWeight: 'bold' }}>{result.recordNumber}</span>
        </p>

        {/* Address */}
        <p>
          <span>Address</span>
          <br/>
          <span style={{ fontWeight: 'bold' }}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(
            result,
            'Address',
            'title',
          )}</span>
        </p>

        {/* Order Items */}
        <p>
          <span>Order Items</span>
          <br/>
          <span style={{ fontWeight: 'bold' }}>{this.renderOrderItemsInLinkableTags(result)}</span>
        </p>

        {/* Additional information ------------------------------------------------------- */}
        <div className={this.state.collapsed ? 'resultCollapseOpened' : 'resultCollapseClosed'}>

          {/* Contact */}
          <p>
            <span>Contact</span>
            <br/>
            <span style={{ fontWeight: 'bold' }}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(
              result,
              'Contact',
              'title',
            )}</span>
          </p>

          {/* Work Order # */}
          <p>
            <span>Work order #</span>
            <br/>
            <span style={{ fontWeight: 'bold' }}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(
              result,
              'WorkOrder',
              'recordNumber',
            )}</span>
          </p>
        </div>

        <Button
          style={{ width: '100%' }}
          size="small"
          onClick={
            (e) => this.setState({ collapsed: !this.state.collapsed })
          }
        >{this.state.collapsed ? '-' : '+'}</Button>

      </div>
    )
  }
}

export default OrderLayout
