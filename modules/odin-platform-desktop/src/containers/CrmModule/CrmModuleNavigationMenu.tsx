import { IdcardOutlined } from '@ant-design/icons';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Switch, useRouteMatch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import RecordDetailView from '../../core/records/components/DetailView';
import RecordListView from '../../core/records/components/ListView';
import DefaultRecordDetail from '../DefaultViews/RecordDetailView';
import AccountDetail from './containers/Account';
import AddressDetailView from './containers/Address';
import ContactDetailView from './containers/Contact';
import ContactIdentityDetailView from './containers/ContactIdentity';
import Dashboard from './containers/Dashboard';
import LeadDetail from './containers/Lead';
import PremiseDetailView from './containers/Premise/DetailView';
import VisitDetailView from './containers/Visit';

const { CRM_MODULE } = SchemaModuleTypeEnums;
const { ACCOUNT, ADDRESS, CONTACT, LEAD, CONTACT_IDENTITY } = SchemaModuleEntityTypeEnums;

export const CrmModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={CRM_MODULE} component={
    <SubMenu {...props} key={CRM_MODULE} icon={<IdcardOutlined/>} title="CRM">
      <Menu.Item key="1">
        <span>Dashboard</span>
        <Link to={`/${CRM_MODULE}`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Account`}>
        <span>Accounts</span>
        <Link to={`/${CRM_MODULE}/Account`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Address`}>
        <span>Addresses</span>
        <Link to={`/${CRM_MODULE}/Address`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Organization`}>
        <span>Organizations</span>
        <Link to={`/${CRM_MODULE}/Organization`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Contact`}>
        <span>Contacts</span>
        <Link to={`/${CRM_MODULE}/Contact`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Lead`}>
        <span>Leads</span>
        <Link to={`/${CRM_MODULE}/Lead`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Premise`}>
        <span>Premises</span>
        <Link to={`/${CRM_MODULE}/Premise`}/>
      </Menu.Item>
      <Menu.Item key={`${CRM_MODULE}Visit`}>
        <span>Visits</span>
        <Link to={`/${CRM_MODULE}/Visit`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const CrmModuleRoutes = () => {
  let match = useRouteMatch();
  console.log('match', match);
  console.log('match.url', match.url);
  console.log('match.path', match.path);

  return <Switch>
    <ProtectedRoute
      exact
      path={`/CrmModule`}
      moduleName={CRM_MODULE}
      component={<Dashboard/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Premise`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName={'Premise'}/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Premise/:udprn/:umprn`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName="Premise">
          <PremiseDetailView/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Visit`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName="Visit"/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Visit/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName="Visit">
          <VisitDetailView/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Lead`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName={LEAD} pipelinesEnabled/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Lead/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName={LEAD}>
          <LeadDetail/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Account`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName={ACCOUNT}/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Account/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName={ACCOUNT}>
          <AccountDetail/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Organization`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName={'Organization'}/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Contact`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName={CONTACT}/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Contact/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName={CONTACT}>
          <ContactDetailView/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/ContactIdentity/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName={CONTACT_IDENTITY}>
          <ContactIdentityDetailView/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Address`}
      moduleName={CRM_MODULE}
      component={<RecordListView moduleName={CRM_MODULE} entityName={ADDRESS}/>}/>
    <ProtectedRoute
      exact
      path={`/CrmModule/Address/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName={ADDRESS}>
          <AddressDetailView/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/related/Contact/:dbRecordAssociationId/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName="Contact">
          <ContactDetailView hasColumnMappings={true} visibleProperties={[ 'Role' ]}/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/related/Address/:dbRecordAssociationId/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE} entityName="Address">
          <AddressDetailView hasColumnMappings={true} visibleProperties={[ 'Type' ]}/>
        </RecordDetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/CrmModule/entityName/:recordId`}
      moduleName={CRM_MODULE}
      component={
        <RecordDetailView moduleName={CRM_MODULE}>
          <DefaultRecordDetail/>
        </RecordDetailView>
      }/>
  </Switch>

}


