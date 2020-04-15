import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import ReactGA from 'react-ga';
import { hotjar } from 'react-hotjar';
import { connect } from 'react-redux';
import { Route, Router, Switch } from 'react-router-dom';
import './App.scss';
import {
  BillingModuleNavigationMenu,
  BillingModuleRoutes,
} from './containers/BillingModule/BillingModuleNavigationMenu';
import { CrmModuleNavigationMenu, CrmModuleRoutes } from './containers/CrmModule/CrmModuleNavigationMenu';
import { DashboardModuleNavigation, DashboardModuleRoutes } from './containers/Dashboard/DashboardModuleNavigatoinMenu';
import {
  FieldServiceModuleNavigationMenu,
  FieldServiceModuleRoutes,
} from './containers/FieldServiceModule/FieldServiceModuleNavigationMenu';
import { FileManagerModuleNavigationMenu } from './containers/Files/FileModuleNavigationMenu';
import { HomeModuleRoutes } from './containers/Home/HomeModuleNavigation';
import Login from './containers/IdentityManagerModule/containers/UserLogin';
import ForgotPassword from './containers/IdentityManagerModule/containers/UserLogin/containers/ForgotPassword';
import LoginModal from './containers/IdentityManagerModule/containers/UserLogin/containers/LoginModal';
import ResetPassword from './containers/IdentityManagerModule/containers/UserLogin/containers/ResetPassword';
import {
  IdentityManagerModuleNavigationMenu,
  IdentityManagerModuleRoutes,
} from './containers/IdentityManagerModule/IdentityManagerModuleNavigationMenu';
import { MergeModuleRoutes } from './containers/Merge/MergeModuleNavigation';
import { OrderModuleNavigationMenu, OrderModuleRoutes } from './containers/OrderModule/OrderModuleNavigationMenu';
import {
  PlanningModuleNavigationMenu,
  PlanningModuleRoutes,
} from './containers/PlanningModule/PlanningModuleNavigation';
import { ProductModuleNavigationMenu, ProductModuleRoutes } from './containers/ProductModule/ProductModuleNavigation';
import {
  ProjectModuleNavigationMenu,
  ProjectModuleRoutes,
} from './containers/ProjectModule/ProjectModuleNavigationMenu';
import {
  SchemaManagerModuleNavigationMenu,
  SchemaManagerModuleRoutes,
} from './containers/SchemaManagerModule/SchemaManagerModuleNavigationMenu';
import Search from './containers/Search/Search';
import { ServiceModuleNavigationMenu, ServiceModuleRoutes } from './containers/ServiceModule/ServiceModuleNavigation';
import { SupportModuleNavigationMenu, SupportModuleRoutes } from './containers/SupportModule/SupportModuleNavigation';
import { logoutRequest, updateUserRolesAndPermissionsRequest } from './core/identity/store/actions';
import Helmet from './core/navigation/Helmet';
import NavigationHistoryTabs from './core/navigation/NavigationHistoryTabs';
import RecordQuickView from './core/records/components/QuickView/Drawer';
import { toggleSearchVisibility } from './core/records/store/actions';
import { Error403 } from './shared/pages/403';
import { Error404 } from './shared/pages/404';
import { Error500 } from './shared/pages/500';
import { isUserAuthenticated } from './shared/permissions/rbacRules';
import HotKeyWrapper from './shared/system/hotkeys';
import Message from './shared/system/messages';
import Notification from './shared/system/notifications';
import history from './shared/utilities/browserHisory';


// @ts-ignore
ReactGA.initialize(process.env.REACT_APP_ODIN_GAID, {
  debug: true,
  gaOptions: {
    siteSpeedSampleRate: 100,
  },
})
history.listen((location: any, action: any) => {
  ReactGA.pageview(location.pathname + location.search);
});

// @ts-ignore
hotjar.initialize(process.env.REACT_APP_ODIN_HOTJAR_HJID, process.env.REACT_APP_ODIN_HOTJAR_HJSV);

const { Header } = Layout;

interface Props {
  userReducer: any,
  navigationReducer: any,
  toggleSearchVisibility: any,
  logout: any,
  updateUserRolesAndPermissions: any,
}

class App extends React.Component<Props> {

  timer: NodeJS.Timeout | undefined;


  setMenuStyle() {
    const { userReducer } = this.props;
    if(userReducer.user && userReducer.user.organization.id === '8c96572c-eee6-4e78-9e3f-8c56c5bb9242') {
      // Set menu color for Netomnia Limited
      return 'netomnia-theme-menu';
    } else {
      return 'youfibre-theme-menu';
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.timer = setInterval(() => this.props.updateUserRolesAndPermissions(), 60000);
    }, 30)
  }

  componentWillUnmount() {
    if(this.timer) clearInterval(this.timer)
    this.timer = undefined;
  }

  handleLogout() {
    const { logout } = this.props;
    logout()
    history.push('/login');
  }

  render() {

    const { userReducer } = this.props;


    return (
      <div className="app-container">
        <Layout className="page-layout">
          <Notification/>
          <Message/>
          <HotKeyWrapper/>
          <Router history={history}>
            <Helmet/>
            <LoginModal/>

            {
              isUserAuthenticated(userReducer) ?

                <>
                  <Search
                    entities={[
                      'CrmModule:Account',
                      'CrmModule:Address',
                      'ProductModule:Product',
                      'OrderModule:Order',
                      'FieldServiceModule:WorkOrder',
                      'BillingModule:Invoice',
                    ]}
                    schema={{ id: 'GLOBAL_SEARCH_DRAWER', moduleName: 'SchemaModule', entityName: 'ALL' }}
                    renderStyle="drawer"
                  />
                  <RecordQuickView/>
                  <Header className="header">
                    <Menu triggerSubMenuAction="click" theme="light" mode="horizontal" selectable={false}
                          className={this.setMenuStyle()}>

                      <Menu.Item
                        key="app"
                        onClick={() => history.push('/')}
                        style={{ fontWeight: 700 }}>
                        {process.env.REACT_APP_ODIN_APP_NAME || 'ODIN'}
                      </Menu.Item>

                      <Menu.Item
                        key="Search"
                        icon={<SearchOutlined/>}
                        onClick={() => this.props.toggleSearchVisibility()}
                        style={{ float: 'right' }}>
                        Search
                      </Menu.Item>

                      <SubMenu title={userReducer?.user?.firstname} style={{ float: 'right' }} icon={<UserOutlined/>}>
                        {<IdentityManagerModuleNavigationMenu/>}
                        {<SchemaManagerModuleNavigationMenu/>}
                        <Menu.Item key='UserSettings' onClick={() => this.handleLogout()}>
                          <span style={{ color: 'red' }}>Logout</span>
                        </Menu.Item>
                        <Menu.Item disabled>
                          <span style={{ fontWeight: 300, color: '#dedede', fontSize: 10 }}>version: v1.0.151</span>
                        </Menu.Item>
                      </SubMenu>

                      <FileManagerModuleNavigationMenu style={{ float: 'right' }}/>
                      <ProjectModuleNavigationMenu style={{ float: 'right' }}/>
                      <PlanningModuleNavigationMenu style={{ float: 'right' }}/>
                      <ServiceModuleNavigationMenu style={{ float: 'right' }}/>
                      <ProductModuleNavigationMenu style={{ float: 'right' }}/>
                      <SupportModuleNavigationMenu style={{ float: 'right' }}/>
                      <BillingModuleNavigationMenu style={{ float: 'right' }}/>
                      <FieldServiceModuleNavigationMenu style={{ float: 'right' }}/>
                      <OrderModuleNavigationMenu style={{ float: 'right' }}/>
                      <CrmModuleNavigationMenu style={{ float: 'right' }}/>
                      <DashboardModuleNavigation style={{ float: 'right' }}/>
                    </Menu>
                  </Header>
                  <NavigationHistoryTabs/>
                </>
                :
                <Menu theme="light" mode="horizontal" selectable={false} className={this.setMenuStyle()}>
                  <Menu.Item
                    key="app"
                    style={{ fontWeight: 700 }}>
                    {process.env.REACT_APP_ODIN_APP_NAME || 'ODIN'}
                  </Menu.Item>
                </Menu>
            }

          </Router>
          <Router history={history}>
            <Switch>
              <Route exact path="/">
                <HomeModuleRoutes/>
              </Route>
              <Route path="/OrderModule">
                <OrderModuleRoutes/>
              </Route>
              <Route path="/CrmModule">
                <CrmModuleRoutes/>
              </Route>
              <Route path="/FileModule">
                <CrmModuleRoutes/>
              </Route>
              <Route path="/FieldServiceModule">
                <FieldServiceModuleRoutes/>
              </Route>
              <Route path="/SupportModule">
                <SupportModuleRoutes/>
              </Route>
              <Route path="/ProductModule">
                <ProductModuleRoutes/>
              </Route>
              <Route path="/BillingModule">
                <BillingModuleRoutes/>
              </Route>
              <Route path="/IdentityManagerModule">
                <IdentityManagerModuleRoutes/>
              </Route>
              <Route path="/SchemaModule">
                <SchemaManagerModuleRoutes/>
              </Route>
              <Route path="/ServiceModule">
                <ServiceModuleRoutes/>
              </Route>
              <Route path="/ProjectModule">
                <ProjectModuleRoutes/>
              </Route>
              <Route path="/Dashboard">
                <DashboardModuleRoutes/>
              </Route>
              <Route path="/PlanningModule">
                <PlanningModuleRoutes/>
              </Route>
              <Route path="/merge">
                <MergeModuleRoutes/>
              </Route>

              <Route exact path="/forgot-password" component={ForgotPassword}/>
              <Route exact path="/reset-password/:token" component={ResetPassword}/>

              <Route path="/login" exact>
                <Login/>
              </Route>
              <Route path="/500">
                <Error500/>
              </Route>
              <Route path="/403">
                <Error403/>
              </Route>
              <Route>
                <Error404/>
              </Route>

            </Switch>
          </Router>
        </Layout>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  navigationReducer: state.navigationReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  logout: () => dispatch(logoutRequest()),
  toggleSearchVisibility: () => dispatch(toggleSearchVisibility()),
  updateUserRolesAndPermissions: () => dispatch(updateUserRolesAndPermissionsRequest()),

});

export default connect(mapState, mapDispatch)(App);
