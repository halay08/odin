import { FileOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/es/menu/SubMenu';
import React from 'react';
import { Link } from 'react-router-dom';
import ProtectedModule from '../../core/navigation/ProtectedModule';

const SCHEMA_MODULE = 'SchemaModule';

export const FileManagerModuleNavigationMenu = ({ ...props }) => (
  <ProtectedModule moduleName={SCHEMA_MODULE} component={
    <SubMenu {...props} key={SCHEMA_MODULE} icon={<FileOutlined/>} title="Files" >
      <Menu.Item key={`${SCHEMA_MODULE}File`}>
        <span>Files</span>
        <Link to={`/${SCHEMA_MODULE}/File`}/>
      </Menu.Item>
    </SubMenu>
  }
  />
)


