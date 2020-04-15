import { DashboardOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { Link, Switch, useRouteMatch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import SalesDashboard from './SalesDashboard';


export const DashboardModuleNavigation = ({ ...props }) => (
  <ProtectedModule moduleName={'fullreporting'} component={
    <Menu.Item
      {...props}
      key="dashboard"
      icon={<DashboardOutlined/>}
      >
      <span>Dashboard</span>
      <Link to={'/Dashboard'}/>
    </Menu.Item>
  }/>
)

export const DashboardModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/Dashboard`}
      moduleName={'fullreporting'}
      component={<SalesDashboard/>}/>
  </Switch>
}

