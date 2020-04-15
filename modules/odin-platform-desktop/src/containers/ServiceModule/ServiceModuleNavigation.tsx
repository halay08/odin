import { WifiOutlined } from '@ant-design/icons';
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
import CustomerDeviceOntDetail from './CustomerDeviceOnt';
import CustomerDeviceRouterDetail from './CustomerDeviceRouter';
import CustomerPhonePortingDetail from './CustomerPhonePorting/Detail';

const { SERVICE_MODULE } = SchemaModuleTypeEnums;

export const ServiceModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={SERVICE_MODULE} component={
    <SubMenu {...props} key={SERVICE_MODULE} icon={<WifiOutlined/>} title="Service" >
      <Menu.Item key={`${SERVICE_MODULE}Service`}>
        <span>Services</span>
        <Link to={`/${SERVICE_MODULE}/Service`}/>
      </Menu.Item>
      <Menu.Item key={`${SERVICE_MODULE}NetworkDevice`}>
        <span>Network devices</span>
        <Link to={`/${SERVICE_MODULE}/NetworkDevice`}/>
      </Menu.Item>
      <Menu.Item key={`${SERVICE_MODULE}CustomerDeviceOnt`}>
        <span>Customer devices (ONT)</span>
        <Link to={`/${SERVICE_MODULE}/CustomerDeviceOnt`}/>
      </Menu.Item>
      <Menu.Item key={`${SERVICE_MODULE}CustomerDeviceRouter`}>
        <span>Customer devices (Router)</span>
        <Link to={`/${SERVICE_MODULE}/CustomerDeviceRouter`}/>
      </Menu.Item>
      <Menu.Item key={`${SERVICE_MODULE}CustomerPhonePorting`}>
        <span>Customer phone porting</span>
        <Link to={`/${SERVICE_MODULE}/CustomerPhonePorting`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const ServiceModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}`}
      moduleName={SERVICE_MODULE}
      component={<RecordListView moduleName={SERVICE_MODULE} entityName="Service"/>}/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/Service`}
      moduleName={SERVICE_MODULE}
      component={<RecordListView moduleName={SERVICE_MODULE} entityName="Service"/>}/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/Service/:recordId`}
      moduleName={SERVICE_MODULE}
      component={
        <DetailView moduleName={SERVICE_MODULE} entityName="Service">
          <DefaultRecordDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/NetworkDevice`}
      moduleName={SERVICE_MODULE}
      component={<RecordListView moduleName={SERVICE_MODULE} entityName="NetworkDevice"/>}/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/NetworkDevice/:recordId`}
      moduleName={SERVICE_MODULE}
      component={
        <DetailView moduleName={SERVICE_MODULE} entityName="NetworkDevice">
          <DefaultRecordDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/CustomerDeviceOnt`}
      moduleName={SERVICE_MODULE}
      component={<RecordListView moduleName={SERVICE_MODULE} entityName="CustomerDeviceOnt"/>}/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/CustomerDeviceOnt/:recordId`}
      moduleName={SERVICE_MODULE}
      component={
        <DetailView moduleName={SERVICE_MODULE} entityName="CustomerDeviceOnt">
          <CustomerDeviceOntDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/CustomerDeviceRouter`}
      moduleName={SERVICE_MODULE}
      component={<RecordListView moduleName={SERVICE_MODULE} entityName="CustomerDeviceRouter"/>}/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/CustomerDeviceRouter/:recordId`}
      moduleName={SERVICE_MODULE}
      component={
        <DetailView moduleName={SERVICE_MODULE} entityName="CustomerDeviceRouter">
          <CustomerDeviceRouterDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/CustomerPhonePorting`}
      moduleName={SERVICE_MODULE}
      component={<RecordListView moduleName={SERVICE_MODULE} entityName="CustomerPhonePorting"/>}/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/CustomerPhonePorting/:recordId`}
      moduleName={SERVICE_MODULE}
      component={
        <DetailView moduleName={SERVICE_MODULE} entityName="CustomerPhonePorting">
          <CustomerPhonePortingDetail/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${SERVICE_MODULE}/:entityName/:recordId`}
      moduleName={SERVICE_MODULE}
      component={
        <DetailView moduleName={SERVICE_MODULE}>
          <DefaultRecordDetail/>
        </DetailView>
      }/>
    ]
  </Switch>
}


