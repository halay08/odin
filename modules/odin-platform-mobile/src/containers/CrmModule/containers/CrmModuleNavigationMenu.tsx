import { IdcardOutlined } from '@ant-design/icons';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Route } from 'react-router-dom';
import RecordDetailView from '../../../core/records/components/DetailView';
import PremiseDetailView from './Premise/DetailView';
import PremiseListView from './Premise/ListView';
import AddressDetailView from "./Address";
import { SchemaModuleEntityTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types";

const { ADDRESS } = SchemaModuleEntityTypeEnums;
const { CRM_MODULE } = SchemaModuleTypeEnums;

export const CrmModuleNavigationMenu = () => {
  return (
    <SubMenu key={`${CRM_MODULE}`} icon={<IdcardOutlined/>} title="CRM">
      <Menu.Item key={`${CRM_MODULE}Premise`}>
        <span>Premises</span>
        <Link to={`/${CRM_MODULE}/Premise`}/>
      </Menu.Item>
    </SubMenu>
  )
};


export const CrmModuleRoutes = [
  <Route path={`/${CRM_MODULE}`} exact>
    <PremiseListView moduleName={CRM_MODULE} entityName="Premise"/>
  </Route>,
  <Route path={`/${CRM_MODULE}/Premise`} exact>
    <PremiseListView moduleName={CRM_MODULE} entityName="Premise"/>
  </Route>,
  <Route path={`/${CRM_MODULE}/${ADDRESS}/:recordId`} exact>
    <RecordDetailView moduleName={CRM_MODULE} entityName={ADDRESS}>
      <AddressDetailView/>
    </RecordDetailView>
  </Route>,
  <Route path={`/${CRM_MODULE}/Premise/:udprn/:umprn`} exact>
    <RecordDetailView moduleName={CRM_MODULE} entityName="Premise">
      <PremiseDetailView/>
    </RecordDetailView>
  </Route>,
];

