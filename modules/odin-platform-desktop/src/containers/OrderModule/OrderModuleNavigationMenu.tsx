import { ShoppingCartOutlined } from '@ant-design/icons';
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
import OrderActivateView from './containers/Order/ActivateView';
import OrderDetailView from './containers/Order/DetailView';
import OrderItemDetailView from './containers/OrderItem/DetailView';
import OrderItemReplaceProductView from './containers/OrderItem/OrderItemReplaceProductView';

const { ORDER_MODULE } = SchemaModuleTypeEnums;
const { ORDER, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

export const OrderModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={ORDER_MODULE} component={
    <SubMenu {...props} key={ORDER_MODULE} icon={<ShoppingCartOutlined/>} title="Orders" >
      <Menu.Item key="1">
        <span>Dashboard</span>
        <Link to={`/${ORDER_MODULE}`}/>
      </Menu.Item>
      <Menu.Item key={`${ORDER_MODULE}Order`}>
        <span>Orders</span>
        <Link to={`/${ORDER_MODULE}/Order`}/>
      </Menu.Item>
      <Menu.Item key={`${ORDER_MODULE}SplitOrder`}>
        <span>Split Orders</span>
        <Link to={`/${ORDER_MODULE}/SplitOrder`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export function OrderModuleRoutes() {

  let match = useRouteMatch();

  return <Switch>
    <ProtectedRoute
      exact
      path={'/OrderModule'}
      moduleName={ORDER_MODULE}
      component={<Dashboard/>}/>
    <ProtectedRoute
      exact
      path={`/OrderModule/Order`}
      moduleName={ORDER_MODULE}
      component={<RecordListView moduleName={ORDER_MODULE} entityName={ORDER} pipelinesEnabled/>}/>
    <ProtectedRoute
      exact
      path={`/OrderModule/Order/:recordId`}
      moduleName={ORDER_MODULE}
      component={
        <DetailView moduleName={ORDER_MODULE} entityName={ORDER}>
          <OrderDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/OrderModule/Order/:recordId/activate`}
      moduleName={ORDER_MODULE}
      component={
        <DetailView moduleName={ORDER_MODULE} entityName={ORDER}>
          <OrderActivateView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/OrderModule/OrderItem/:recordId`}
      moduleName={ORDER_MODULE}
      component={
        <DetailView moduleName={ORDER_MODULE} entityName={ORDER_ITEM}>
          <OrderItemDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/OrderModule/OrderItem/:recordId/product-amendment`}
      moduleName={ORDER_MODULE}
      component={
        <DetailView moduleName={ORDER_MODULE} entityName={ORDER_ITEM}>
          <OrderItemReplaceProductView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/OrderModule/SplitOrder`}
      moduleName={ORDER_MODULE}
      component={<RecordListView moduleName={ORDER_MODULE} entityName={'SplitOrder'}/>}/>
    <ProtectedRoute
      exact
      path={`/OrderModule/:entityName/:recordId`}
      moduleName={ORDER_MODULE}
      component={
        <DetailView moduleName={ORDER_MODULE}>
          <DefaultRecordDetail/>
        </DetailView>
      }/>
  </Switch>
}


