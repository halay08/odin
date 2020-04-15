import { Card, Col, Layout, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { HomeOutlined, ShoppingCartOutlined, CalendarOutlined } from '@ant-design/icons';
import "./index.scss"

const ModuleSelector = () => {
  return (
    <Layout style={{ padding: '10px' }}>
      <Row>

        {/* PREMISES */}
        <Col span={12} style={{padding:'10px', textAlign:'center'}}>
          <Link to='/CrmModule/Premise'>
            <Card title={
              <Row>
                <Col span={24}><HomeOutlined className="moduleSelectorIcon"/></Col>
                <Col span={24}><span>Search Premises</span></Col>
              </Row>
            } bordered>
              Search premises, log visits, convert leads.
            </Card>
          </Link>
        </Col>

        {/* ORDERS */}
        <Col span={12} style={{padding:'10px', textAlign:'center', opacity:'0.3'}}>
          {/*<Link to='/'>*/}
            <Card title={
              <Row>
                <Col span={24}><ShoppingCartOutlined className="moduleSelectorIcon"/></Col>
                <Col span={24}><span>Create Orders</span></Col>
              </Row>
            } bordered>
              Create orders, add Products and Add-ons.
            </Card>
          {/*</Link>*/}
        </Col>

        {/* WORK ORDERS - Install/Service */}
        <Col span={12} style={{padding:'10px', textAlign:'center'}}>
          <Link to='/FieldServiceModule/WorkOrder'>
            <Card title={
              <Row>
                <Col span={24}><CalendarOutlined className="moduleSelectorIcon"/></Col>
                <Col span={24}><span>Work Orders<br/>(Install / Service)</span></Col>
              </Row>
            } bordered>
              See a list of install and service work orders.
            </Card>
          </Link>
        </Col>

        {/* WORK ORDERS - Survey */}
        <Col span={12} style={{padding:'10px', textAlign:'center'}}>
          <Link to='/FieldServiceModule/WorkOrder/Survey'>
            <Card title={
              <Row>
                <Col span={24}><CalendarOutlined className="moduleSelectorIcon"/></Col>
                <Col span={24}><span>Work Orders<br/>(Survey)</span></Col>
              </Row>
            } bordered>
              <span>See a list of<br/>survey work orders</span>
            </Card>
          </Link>
        </Col>
      </Row>
    </Layout>
  )
};

export default withRouter(connect()(ModuleSelector));
