import { SettingOutlined } from '@ant-design/icons'
import { Layout, Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import './App.scss';
import { CrmModuleNavigationMenu, CrmModuleRoutes } from './containers/CrmModule/containers/CrmModuleNavigationMenu';
import {
  FieldServiceModuleNavigationMenu,
  FieldServiceModuleRoutes,
} from './containers/FieldServiceModule/FieldServiceModuleNavigationMenu';
import Login from './containers/IdentityManager/containers/UserLogin';
import ForgotPassword from './containers/IdentityManager/containers/UserLogin/containers/ForgotPassword';
import ResetPassword from './containers/IdentityManager/containers/UserLogin/containers/ResetPassword';
import ModuleSelector from './containers/ModuleSelector';
import { logoutRequest } from './core/identity/store/actions';
import permissionCheck from './shared/permissions/permissionCheck';
import Message from './shared/system/messages';
import Notification from './shared/system/notifications';
import history from './shared/utilities/browserHisory';
import RecordDetailView from "./core/records/components/DetailView";
import AddressDetailView from "./containers/CrmModule/containers/Address";
import { SchemaModuleEntityTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";
import { SchemaModuleTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.types";
import { OrderModuleRoutes } from "./containers/OrderModule/containers/OrderModuleNavigationMenu";

const { ADDRESS } = SchemaModuleEntityTypeEnums;
const { CRM_MODULE } = SchemaModuleTypeEnums;


const { Header } = Layout;

interface Props {
  identityReducer: any,
  logout: any,
}

function App(props: Props) {

  const { identityReducer, logout } = props;

  return (
    <div className="app-container">
      <Layout className="page-layout">
        <Notification/>
        <Message/>
        {permissionCheck.hasModuleSelectorAccess(identityReducer) ?
          <Router history={history}>
            {/*<NavigationHistoryTabs/>*/}
            <Header className="header">
              <Menu theme="dark" mode="horizontal" selectable={false}>
                <Menu.Item
                  key="app"
                  onClick={() => history.push('/')}
                  style={{ fontWeight: 700, color: '#fff' }}>
                  {process.env.REACT_APP_ODIN_APP_NAME || 'Odin'}
                </Menu.Item>
                {CrmModuleNavigationMenu()}
                {FieldServiceModuleNavigationMenu()}
                <SubMenu title={`${identityReducer?.user?.firstname} ${identityReducer?.user?.lastname}`}
                         icon={<SettingOutlined/>}>
                  <Menu.Item key='UserSettings' onClick={() => logout()}>
                    <span>Logout</span>
                  </Menu.Item>
                  <Menu.Item disabled>
                    <span
                      style={{ fontWeight: 300, color: '#dedede', fontSize: 10 }}>
                      version: 09092020
                    </span>
                  </Menu.Item>
                </SubMenu>
              </Menu>
            </Header>
          </Router> :
          <Header className="header">
            <Menu theme="dark" mode="horizontal" selectable={false}>
              <Menu.Item style={{ float: 'right' }} key='UserSettings' onClick={() => logout()}>
                <span>Logout</span>
              </Menu.Item>
            </Menu>
          </Header>
        }
        <Router history={history}>
          <Switch>

            <ProtectedModuleSelector identityReducer={identityReducer} exact path="/">
              <ModuleSelector/>
            </ProtectedModuleSelector>

            <Route path="/login">
              <Login/>
            </Route>

            {CrmModuleRoutes}
            {FieldServiceModuleRoutes}
            {OrderModuleRoutes}
            <Route exact path={`/forgot-password`} component={ForgotPassword}/>
            <Route exact path={`/reset-password/:token`} component={ResetPassword}/>
          </Switch>
        </Router>
      </Layout>
    </div>);
}

// @ts-ignore
function ProtectedModuleSelector({ children, ...rest }) {
  return (<Route
    {...rest}
    render={({ location }) => permissionCheck.hasModuleSelectorAccess(rest.identityReducer) ? (children) : (<Redirect
      to={{
        pathname: '/login', state: { from: location },
      }}
    />)}
  />);
}

// @ts-ignore
function ProtectedCrmModule({ children, ...rest }) {
  return (<Route
    {...rest}
    render={({ location }) => permissionCheck.hasCrmAccess(rest.identityReducer) ? (children) : (<Redirect
      to={{
        pathname: '/login', state: { from: location },
      }}
    />)}
  />);
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
});

const mapDispatch = (dispatch: any) => ({
  logout: () => dispatch(logoutRequest()),
});

export default connect(mapState, mapDispatch)(App);
