import { CalendarOutlined } from '@ant-design/icons';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Route } from 'react-router-dom';
import DetailView from '../../core/records/components/DetailView';
import EngineerInstallWorkOrders from './containers/EngineerWorkOrders/InstallWorkOrderList';
import EngineerSurveyWorkOrders from './containers/EngineerWorkOrders/SurveyWorkOrderList';
import WorkOrderDetailView from './containers/WorkOrder/DetailView';
import WorkOrderOrderItemView from './containers/WorkOrder/OrderItemView';
import WorkOrderSurveyDetailView from './containers/WorkOrder/SurveyDetailView';

const { FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { WORK_ORDER } = SchemaModuleEntityTypeEnums;

export const FieldServiceModuleNavigationMenu = () => {
  return (
    <SubMenu key={`${FIELD_SERVICE_MODULE}`} icon={<CalendarOutlined/>} title="Field Service">
      <Menu.Item key={`${FIELD_SERVICE_MODULE}WorkOrder`}>
        <span>Install / Service Work orders</span>
        <Link to={`/${FIELD_SERVICE_MODULE}/WorkOrder`}/>
      </Menu.Item>
      <Menu.Item key={`${FIELD_SERVICE_MODULE}WorkOrderSurvey`}>
        <span>Survey Work orders</span>
        <Link to={`/${FIELD_SERVICE_MODULE}/WorkOrder/Survey`}/>
      </Menu.Item>
    </SubMenu>
  )
};

export const FieldServiceModuleRoutes = [
  <Route path={`/${FIELD_SERVICE_MODULE}/WorkOrder/Survey`} exact>
    <EngineerSurveyWorkOrders moduleName={FIELD_SERVICE_MODULE} entityName={WORK_ORDER}/>
  </Route>,
  <Route path={`/${FIELD_SERVICE_MODULE}/WorkOrder/:recordId/Survey`} exact>
    <DetailView moduleName={FIELD_SERVICE_MODULE} entityName={WORK_ORDER}>
      <WorkOrderSurveyDetailView/>
    </DetailView>
  </Route>,
  <Route path={`/${FIELD_SERVICE_MODULE}/WorkOrder`} exact>
    <EngineerInstallWorkOrders moduleName={FIELD_SERVICE_MODULE} entityName={WORK_ORDER}/>
  </Route>,
  <Route path={`/${FIELD_SERVICE_MODULE}/WorkOrder/:recordId`} exact>
    <DetailView moduleName={FIELD_SERVICE_MODULE} entityName={WORK_ORDER}>
      <WorkOrderDetailView/>
    </DetailView>
  </Route>,
  <Route path={`/${FIELD_SERVICE_MODULE}/WorkOrder/:parentRecordId/OrderItem/:recordId`} exact>
    <DetailView moduleName="OrderModule" entityName="OrderItem">
      <WorkOrderOrderItemView/>
    </DetailView>
  </Route>,
];

