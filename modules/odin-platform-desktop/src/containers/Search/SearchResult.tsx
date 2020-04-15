import React from 'react';
import {Card, Col, Row} from "antd";
import {Link} from "react-router-dom";
import {getBrowserPath} from "../../shared/utilities/recordHelpers";
import './index.scss'
import {
  BankOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import AccountLayout from "./SearchResultLayouts/AccountLayout";
import AddressLayout from "./SearchResultLayouts/AddressLayout";
import OrderLayout from "./SearchResultLayouts/OrderLayout";
import WorkOrderLayout from "./SearchResultLayouts/WorkOrderLayout";
import InvoiceLayout from "./SearchResultLayouts/InvoiceLayout";
import ProductLayout from "./SearchResultLayouts/ProductLayout";

interface Props {
  entityName: string,
  searchResult: any,
  onClose: any,
  globalCollapsed: boolean
}

interface State {
  opened: boolean
}

class SearchResult extends React.Component<Props, State> {
  constructor(props: any) {
    super(props)
    this.state = {opened: false}
  }

  renderSearchResultBody = (entityName: string, result: any) => {
    switch (entityName) {
      case 'WorkOrder':
        return <WorkOrderLayout result={result} onClose={this.props.onClose} globalCollapsed={this.props.globalCollapsed}/>
      case 'Order':
        return <OrderLayout result={result} onClose={this.props.onClose} globalCollapsed={this.props.globalCollapsed}/>
      case 'Account':
        return <AccountLayout result={result} onClose={this.props.onClose} globalCollapsed={this.props.globalCollapsed}/>
      case 'Invoice':
        return <InvoiceLayout result={result} onClose={this.props.onClose} globalCollapsed={this.props.globalCollapsed}/>
      case 'Product':
        return <ProductLayout result={result} onClose={this.props.onClose} globalCollapsed={this.props.globalCollapsed}/>
      case 'Address':
        return <AddressLayout result={result} onClose={this.props.onClose} globalCollapsed={this.props.globalCollapsed}/>
      default:
        return result.title
    }
  }

  renderResultIcon = (entityName: string) => {
    switch (entityName) {
      case 'WorkOrder':
        return <CalendarOutlined className="resultHeaderIcon"/>
      case 'Order':
        return <ShoppingCartOutlined className="resultHeaderIcon"/>
      case 'Account':
        return <IdcardOutlined className="resultHeaderIcon"/>
      case 'Address':
        return <EnvironmentOutlined className="resultHeaderIcon"/>
      case 'Product':
        return <BarcodeOutlined className="resultHeaderIcon"/>
      case 'Invoice':
        return <BankOutlined className="resultHeaderIcon"/>
      default:
    }
  }

  render() {
    const {searchResult, entityName} = this.props

    return (
      <Card
        key={searchResult.id}
        size="small"
        style={{marginTop: '15px'}}
        title={
          <Row>
            <Col span={12}>
              {this.renderResultIcon(searchResult.entity.split(':')[1])}
              <span
                style={{fontSize: '1.2em', marginTop: 0, marginLeft: '4px'}}>{searchResult.entity.split(':')[1]}</span>
            </Col>
            <Col span={12} style={{textAlign: 'right'}}>
              <Link to={getBrowserPath(searchResult)} onClick={(e) => this.props.onClose()}>
                View
              </Link>
            </Col>
          </Row>
        }
      >
        {this.renderSearchResultBody(entityName, searchResult)}
      </Card>
    )
  }
}

export default SearchResult