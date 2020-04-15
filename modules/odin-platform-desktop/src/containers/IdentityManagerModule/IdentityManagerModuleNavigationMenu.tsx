import { Menu } from 'antd';
import React from 'react';
import { Link, Switch, useRouteMatch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import ConnectedAppsDetailView from './containers/ConnectedApps/DetailView';
import GroupsDetailView from './containers/Groups/DetailView';
import IdentityManager from './containers/IdentityManager';
import PermissionsDetailView from './containers/Permissions/DetailView';
import RolesDetailView from './containers/Roles/DetailView';
import TokensDetailView from './containers/Tokens/DetailView';
import UserDetailView from './containers/User/DetailView';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';


export const IdentityManagerModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={IDENTITY_MANAGER_MODULE} component={
    <Menu.Item {...props} key={IDENTITY_MANAGER_MODULE}>
      <span>Identity Manager</span>
      <Link to={`/${IDENTITY_MANAGER_MODULE}`}/>
    </Menu.Item>
  }/>
)

export const IdentityManagerModuleRoutes = () => {
  let match = useRouteMatch();

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<IdentityManager/>}/>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}/Users/:userId`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<UserDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}/Roles/:roleId`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<RolesDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}/Permissions/:permissionId`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<PermissionsDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}/Groups/:groupId`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<GroupsDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}/Tokens/:tokenId`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<TokensDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${IDENTITY_MANAGER_MODULE}/ConnectedApps/:connectedAppId`}
      moduleName={IDENTITY_MANAGER_MODULE}
      component={<ConnectedAppsDetailView/>}/>
  </Switch>
}


