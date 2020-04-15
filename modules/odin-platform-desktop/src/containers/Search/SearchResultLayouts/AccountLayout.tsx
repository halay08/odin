import React from 'react';
import {DbRecordEntityTransform} from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import {Link} from "react-router-dom";
import {getBrowserPath} from "../../../shared/utilities/recordHelpers";
import {Button} from "antd";

interface Props {
  result: DbRecordEntityTransform,
  onClose: any,
  globalCollapsed: boolean
}

interface State {
  collapsed: boolean
}

class AccountLayout extends React.Component<Props, State> {
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

  renderCommaSeparatedRelatedEntitiesWithLinks = (result: DbRecordEntityTransform, entityName: string, propertyName: string) => {
    if (result[entityName] && result[entityName].dbRecords) {
      return result[entityName].dbRecords.map((elem: DbRecordEntityTransform) =>
        <Link to={getBrowserPath(elem)} onClick={() => this.props.onClose()}>{elem[propertyName]}</Link>
      ).reduce((prev:JSX.Element, current:JSX.Element): any => [prev, (<span>, </span>), current])
    } else return '-'
  }

  renderCommaSeparatedRelatedContactProperty = (result: DbRecordEntityTransform, propertyName: string) => {
    if (result.Contact && result.Contact.dbRecords) {
      return result.Contact.dbRecords.map((elem: DbRecordEntityTransform) =>
        elem.properties[propertyName] ? <span>{elem.properties[propertyName]}</span> : 'None'
      ).reduce((prev:JSX.Element, current:JSX.Element): any => [prev, (<span>, </span>), current])
    } else return '-'
  }

  render(){
    const result = this.props.result;

    return(
      <div>

        {/* Account # */}
        <p>
          <span>Account #</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{result.recordNumber}</span>
        </p>

        {/* Address */}
        <p>
          <span>Address</span>
          <br/>
          <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(result, 'Address', 'title')}</span>
        </p>

        {/* Additional information ------------------------------------------------------- */}
        <div className={this.state.collapsed ? 'resultCollapseOpened' : 'resultCollapseClosed'}>

          {/* Contact */}
          <p>
            <span>Contact</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(result, 'Contact', 'title')}</span>
          </p>

          {/* E-mail */}
          <p>
            <span>E-mail</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedContactProperty(result, 'EmailAddress')}</span>
          </p>

          {/* Phone */}
          <p>
            <span>Phone</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedContactProperty(result, 'Phone')}</span>
          </p>

          {/* Previous Provider */}
          <p>
            <span>Previous Provider</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedContactProperty(result, 'Previous Provider')}</span>
          </p>

          {/* WorkOrder# */}
          <p>
            <span>Order #</span>
            <br/>
            <span style={{fontWeight: 'bold'}}>{this.renderCommaSeparatedRelatedEntitiesWithLinks(result, 'Order', 'recordNumber')}</span>
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

export default AccountLayout
