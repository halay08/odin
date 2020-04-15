import { BorderOuterOutlined } from '@ant-design/icons';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Switch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import PlanningModuleMap from './containers/Map';

const PLANNING_MODULE = 'PlanningModule';
const { PROJECT_MODULE } = SchemaModuleTypeEnums;

export const PlanningModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={PLANNING_MODULE} component={
    <SubMenu {...props} key={PLANNING_MODULE} icon={<BorderOuterOutlined/>} title="Planning">
      <Menu.Item key={`${PLANNING_MODULE}Map`}>
        <span>Map</span>
        <Link to={`/${PLANNING_MODULE}/Map`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const PlanningModuleRoutes = () => {

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${PLANNING_MODULE}/Map/:featureType?/:featureId?`}
      moduleName={PLANNING_MODULE}
      component={<PlanningModuleMap/>}/>
  </Switch>

}


