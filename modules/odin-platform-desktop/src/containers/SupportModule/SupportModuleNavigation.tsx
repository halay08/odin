import { CustomerServiceOutlined } from '@ant-design/icons';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Switch, useRouteMatch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import DetailView from '../../core/records/components/DetailView';
import RecordListView from '../../core/records/components/ListView';
import DefaultRecordDetail from '../DefaultViews/RecordDetailView';

const { SUPPORT_MODULE } = SchemaModuleTypeEnums;

export const SupportModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={SUPPORT_MODULE} component={
    <SubMenu {...props} key={SUPPORT_MODULE} icon={<CustomerServiceOutlined/>} title="Support"
             >
      <Menu.Item key={`${SUPPORT_MODULE}Note`}>
        <span>Notes</span>
        <Link to={`/${SUPPORT_MODULE}/Note`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const SupportModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${SUPPORT_MODULE}/Note`}
      moduleName={SUPPORT_MODULE}
      component={<RecordListView moduleName={SUPPORT_MODULE} entityName="Note"/>}/>
    <ProtectedRoute
      exact
      path={`/${SUPPORT_MODULE}/Note/:recordId`}
      moduleName={SUPPORT_MODULE}
      component={
        <DetailView moduleName={SUPPORT_MODULE} entityName="Note">
          <DefaultRecordDetail/>
        </DetailView>
      }/>
  </Switch>
}

