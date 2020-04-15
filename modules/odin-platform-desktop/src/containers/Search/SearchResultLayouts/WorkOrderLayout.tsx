import {DbRecordEntityTransform} from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import {Button, Tag} from 'antd';
import React from 'react';
import {Link} from 'react-router-dom';
import {getBrowserPath} from '../../../shared/utilities/recordHelpers';
import "../index.scss"

interface Props {
  result: DbRecordEntityTransform,
  onClose: any,
  globalCollapsed: boolean
}

interface State {
  collapsed: boolean
}

class WorkOrderLayout extends React.Component<Props, State> {

  constructor(props: any) {
    super(props)
    this.state = {collapsed: true}
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
    if (result.OrderItem && result.OrderItem.dbRecords) {
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
    if (result[entityName] && result[entityName].dbRecords) {
      return result[entityName].dbRecords.map((elem: DbRecordEntityTransform) =>
        <Link to={getBrowserPath(elem)} onClick={() => this.props.onClose()}>{elem[propertyName]}</Link>,
      ).reduce((prev: JSX.Element, current: JSX.Element): any => [prev, (<span>, </span>), current])
    } else return '-'
  }

  renderServiceAppointment = (result: DbRecordEntityTransform) => {
    if (result.ServiceAppointment && result.ServiceAppointment.dbRecords) {
      return result.ServiceAppointment.dbRecords.map((elem: DbRecordEntityTransform) => {
        return `${elem.properties.Date} (${elem.properties.TimeBlock})`
      })
    } else return '-'
  }

  render() {
    const result = this.props.result;

    return (
      <div>

        {/* WorkOrder # */}
        <p>
          <span>Work Order #</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>
            <Link to={getBrowserPath(result)} onClick={() => this.props.onClose()}>
              {result.recordNumber}
            </Link>
          </span>
        </p>

        {/* Address */}
        <p>
          <span>Address</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(
            result,
            'Address',
            'title',
          )}</span>
        </p>

        {/* Appointment Date */}
        <p>
          <span>Appointment Date</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{this.renderServiceAppointment(result)}</span>
        </p>

        {/* Additional information ------------------------------------------------------- */}
        <div className={this.state.collapsed ? 'resultCollapseOpened' : 'resultCollapseClosed'}>

          {/* Stage */}
          <p>
            <span>Stage</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{result.stage ? result.stage.name : '-'}</span>
          </p>

          {/* Order Items */}
          <p>
            <span>Order Items</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{this.renderOrderItemsInLinkableTags(result)}</span>
          </p>

          {/* Type */}
          <p>
            <span>Type</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{result.properties ? result.properties.Type : '-'}</span>
          </p>

        </div>

        <Button
          style={{width: '100%'}}
          size="small"
          onClick={(e) => this.setState({collapsed: !this.state.collapsed})}
        >
          {this.state.collapsed ? '-' : '+'}
        </Button>

      </div>
    )
  }
}

export default WorkOrderLayout
