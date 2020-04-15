import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link, Switch } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';
import ProtectedRoute from '../../core/navigation/ProtectedRoute';
import DetailView from '../../core/records/components/DetailView';
import RecordListView from '../../core/records/components/ListView';
import DefaultRecordDetail from '../DefaultViews/RecordDetailView';
import FileDetailView from '../Files/containers/File/DetailView';
import SchemaColumnDetailView from './containers/Columns/DetailView';
import SchemasDetailView from './containers/Schemas/DetailView';
import SchemaListView from './containers/Schemas/ListView';

const SCHEMA_MODULE = 'SchemaModule';

export const SchemaManagerModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={SCHEMA_MODULE} component={
    <SubMenu {...props} key={SCHEMA_MODULE} title="Schema Manager">
      <Menu.Item key={`${SCHEMA_MODULE}Schema`}>
        <span>Schemas</span>
        <Link to={`/${SCHEMA_MODULE}/Schema`}/>
      </Menu.Item>
    </SubMenu>}
  />
)

export const SchemaManagerModuleRoutes = () => {
  return <Switch>
    <ProtectedRoute
      exact
      path={`/${SCHEMA_MODULE}/Schema`}
      moduleName={SCHEMA_MODULE}
      component={<SchemaListView/>}/>
    <ProtectedRoute
      exact
      path={`/${SCHEMA_MODULE}/Schema/:schemaId`}
      moduleName={SCHEMA_MODULE}
      component={<SchemasDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${SCHEMA_MODULE}/SchemaColumn/:schemaId/:schemaColumnId`}
      moduleName={SCHEMA_MODULE}
      component={<SchemaColumnDetailView/>}/>
    <ProtectedRoute
      exact
      path={`/${SCHEMA_MODULE}/File`}
      moduleName={SCHEMA_MODULE}
      component={<RecordListView moduleName={SCHEMA_MODULE} entityName={'File'}/>}/>
    <ProtectedRoute
      exact
      path={`/${SCHEMA_MODULE}/File/:recordId`}
      moduleName={SCHEMA_MODULE}
      component={
        <DetailView moduleName={SCHEMA_MODULE} entityName="File">
          <FileDetailView/>
        </DetailView>
      }/>
    <ProtectedRoute
      exact
      path={`/${SCHEMA_MODULE}/:entityName/:recordId`}
      moduleName={SCHEMA_MODULE}
      component={
        <DetailView moduleName={SCHEMA_MODULE}>
          <DefaultRecordDetail/>
        </DetailView>
      }/>
  </Switch>
}


