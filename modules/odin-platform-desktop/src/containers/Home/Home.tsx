import React from 'react';
import {Card, Col, Divider, Layout, Row, Typography} from "antd";
import './index.scss';
import {connect} from "react-redux";
import SlackIcon from '../../assets/icons/slack-color-16.png';
import Search from '../Search/Search'
import {UserOutlined} from "@ant-design/icons";
import moment from "moment/moment";

interface Props {
  userReducer: any
}

class Home extends React.Component<Props> {

  render() {
    const {Title} = Typography;
    const userInformation = this.props.userReducer.user;

    return (
      <Layout style={{padding: 8, border: '1px solid #dadada', background: '#cedaea', overflow: 'auto'}}>
        <Row>
          <Col xl={{span: 18, offset: 3}} className="homePageContainer">

            {/* Welcome card */}
            <Card className="homePageWelcomeCard" bordered={true} style={{textAlign: 'center'}}>
              <Title level={1}>
                <UserOutlined className="homePageUserIcon"/>
              </Title>
              <Title level={1} style={{marginTop: '25px'}}>
                {`Hello, ${userInformation?.firstname}!`}
              </Title>
            </Card>

            {/* Three column information layout */}
            <Row style={{marginTop: '30px'}} justify="space-between">

              {/* Odin Search */}
              <Col xs={{span: 24}} md={{span: 14}}>
                <Card bordered={true} className="homePageCard">
                  <Title level={4}>
                    Search
                  </Title>
                  <Divider/>

                  <Search
                    entities={[
                      'CrmModule:Account',
                      'CrmModule:Address',
                      'ProductModule:Product',
                      'OrderModule:Order',
                      'FieldServiceModule:WorkOrder',
                      'BillingModule:Invoice',
                    ]}
                    schema={{id: 'GLOBAL_SEARCH_CARD', moduleName: 'SchemaModule', entityName: 'ALL'}}
                    renderStyle="card"
                  />

                </Card>
              </Col>
              <Col xs={{span: 24}} md={{span: 9}}>

                {/* Recent updates*/}
                <Card bordered={true} className="homePageCard">
                  <Title level={4}>
                    Recent updates
                  </Title>
                  <Divider/>
                  <a href='https://d19nworkspace.slack.com/archives/C01FLGNA421'>
                    <img src={SlackIcon} alt="Slack" style={{marginRight: '8px'}}/>#odin-release-notes
                  </a>
                </Card>

                {/* Odin documentation */}
                {/*
                 <Card bordered={true} className="homePageCard">
                 <Title level={4}>
                 Odin Documentation
                 </Title>
                 <Divider/>
                 <a href="#"><FileTextOutlined style={{marginRight: '8px'}} />Read documentation here</a>
                 </Card>*/}
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
});

export default connect(mapState)(Home)


