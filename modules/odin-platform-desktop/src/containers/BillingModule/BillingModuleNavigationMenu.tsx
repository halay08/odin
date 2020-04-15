import { BankOutlined } from '@ant-design/icons';
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
import InvoiceDetailView from './containers/Invoice/DetailView';
import PaymentMethodDetailView from './containers/PaymentMethod/DetailView';
import TransactionDetailView from './containers/Transaction/DetailView';

const { BILLING_MODULE } = SchemaModuleTypeEnums;
const { INVOICE, INVOICE_ITEM, TRANSACTION, PAYMENT_METHOD } = SchemaModuleEntityTypeEnums;

export const BillingModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={BILLING_MODULE} component={
    <SubMenu {...props} key={BILLING_MODULE} icon={<BankOutlined/>} title="Billing" >
      <Menu.Item key={`${BILLING_MODULE}Dashboard`}>
        <span>Dashboard</span>
        <Link to={`/${BILLING_MODULE}`}/>
      </Menu.Item>
      <Menu.Item key={`${BILLING_MODULE}Invoice`}>
        <span>Invoices</span>
        <Link to={`/${BILLING_MODULE}/Invoice`}/>
      </Menu.Item>
      <Menu.Item key={`${BILLING_MODULE}Transaction`}>
        <span>Transactions</span>
        <Link to={`/${BILLING_MODULE}/Transaction`}/>
      </Menu.Item>
      <Menu.Item key={`${BILLING_MODULE}PaymentMethod`}>
        <span>Payment Methods</span>
        <Link to={`/${BILLING_MODULE}/PaymentMethod`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const BillingModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}`}
      moduleName={BILLING_MODULE}
      component={<Dashboard/>}/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/Invoice`}
      moduleName={BILLING_MODULE}
      component={<RecordListView moduleName={BILLING_MODULE} entityName="Invoice"/>}/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/Invoice/:recordId`}
      moduleName={BILLING_MODULE}
      component={
        <DetailView moduleName={BILLING_MODULE} entityName={INVOICE}>
          <InvoiceDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/InvoiceItem/:recordId`}
      moduleName={BILLING_MODULE}
      component={
        <DetailView moduleName={BILLING_MODULE} entityName={INVOICE_ITEM}>
          <DefaultRecordDetail excludeRelations={[]}/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/Transaction`}
      moduleName={BILLING_MODULE}
      component={<RecordListView moduleName={BILLING_MODULE} entityName={TRANSACTION}/>}/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/Transaction/:recordId`}
      moduleName={BILLING_MODULE}
      component={
        <DetailView moduleName={BILLING_MODULE} entityName={TRANSACTION}>
          <TransactionDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/PaymentMethod`}
      moduleName={BILLING_MODULE}
      component={<RecordListView moduleName={BILLING_MODULE} entityName={PAYMENT_METHOD}/>}/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/PaymentMethod/:recordId`}
      moduleName={BILLING_MODULE}
      component={
        <DetailView moduleName={BILLING_MODULE} entityName={PAYMENT_METHOD}>
          <PaymentMethodDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${BILLING_MODULE}/:entityName/:recordId`}
      moduleName={BILLING_MODULE}
      component={
        <DetailView moduleName={BILLING_MODULE}>
          <DefaultRecordDetail/>
        </DetailView>
      }/>
  </Switch>
}

