import { CalendarOutlined } from '@ant-design/icons';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
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
import Dashboard from './containers/Dashboard';
import ServiceAppointmentCalendar from './containers/ServiceAppointmentCalendar';
import WorkOrderDetailView from './containers/WorkOrder/DetailView';

const { FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { WORK_ORDER } = SchemaModuleEntityTypeEnums;

export const FieldServiceModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={FIELD_SERVICE_MODULE} component={
    <SubMenu {...props} key={FIELD_SERVICE_MODULE} icon={<CalendarOutlined/>} title="Field Service"
             >
      <Menu.Item key="1">
        <span>Dashboard</span>
        <Link to={`/${FIELD_SERVICE_MODULE}`}/>
      </Menu.Item>
      <Menu.Item key={`${FIELD_SERVICE_MODULE}Calendar`}>
        <span>Calendar</span>
        <Link to={`/${FIELD_SERVICE_MODULE}/Calendar`}/>
      </Menu.Item>
      <Menu.Item key={`${FIELD_SERVICE_MODULE}WorkOrder`}>
        <span>Work orders</span>
        <Link to={`/${FIELD_SERVICE_MODULE}/WorkOrder`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const FieldServiceModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);
  return <Switch>
    <ProtectedRoute
      exact
      path={`/${FIELD_SERVICE_MODULE}`}
      moduleName={FIELD_SERVICE_MODULE}
      component={<Dashboard/>}/>,
    <ProtectedRoute
      exact
      path={`/${FIELD_SERVICE_MODULE}/WorkOrder`}
      moduleName={FIELD_SERVICE_MODULE}
      component={<RecordListView moduleName={FIELD_SERVICE_MODULE} entityName={WORK_ORDER} pipelinesEnabled/>}/>,
    <ProtectedRoute
      exact
      path={`/${FIELD_SERVICE_MODULE}/WorkOrder/:recordId`}
      moduleName={FIELD_SERVICE_MODULE}
      component={
        <DetailView moduleName={FIELD_SERVICE_MODULE} entityName={WORK_ORDER}>
          <WorkOrderDetailView/>
        </DetailView>
      }/>,
    <ProtectedRoute
      exact
      path={`/${FIELD_SERVICE_MODULE}/Calendar`}
      moduleName={FIELD_SERVICE_MODULE}
      component={<ServiceAppointmentCalendar/>}/>,
    <ProtectedRoute
      exact
      path={`/${FIELD_SERVICE_MODULE}/:entityName/:recordId`}
      moduleName={FIELD_SERVICE_MODULE}
      component={
        <DetailView moduleName={FIELD_SERVICE_MODULE}>
          <DefaultRecordDetail/>
        </DetailView>
      }/>
  </Switch>
}
