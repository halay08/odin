import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { getPermissionFromShortListByPermissionId } from '../../../../../shared/utilities/identityHelpers';
import { setAssignRolesModalVisible } from '../../../../../core/identityRoles/store/actions';
import { IdentityRbacPermissionReducer } from '../../../../../core/identityPermissions/store/reducer';
import AssignRoleToPermissionModal from '../AssignRoleToPermissionModal';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityRbacPermissionReducer: IdentityRbacPermissionReducer,
  match: any,
  setModalVisible: any
}

class PermissionRolesListView extends React.Component<Props> {

  setAssingRoleModalVisible() {
    const { setModalVisible } = this.props;
    setModalVisible(true);
  }

  renderUsersRoles() {
    const { identityRbacPermissionReducer, match } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Roles/${record?.id}`}>{record.name}</Link>
        ),
      },
      { 
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      }
    ];
    const permissionId = match.params.permissionId;
    const permission = getPermissionFromShortListByPermissionId(identityRbacPermissionReducer.shortList, permissionId);
    const dataSource = permission?.roles;
    return (
      <>
        <AssignRoleToPermissionModal />
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => {this.setAssingRoleModalVisible()}} disabled>Add/Remove Role</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityRbacPermissionReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderUsersRoles()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
    identityRbacPermissionReducer: state.identityRbacPermissionReducer,
});

const mapDispatch = (dispatch: any) => ({
  setModalVisible: (visible: boolean) => dispatch(setAssignRolesModalVisible(visible))
});

export default withRouter(connect(mapState, mapDispatch)(PermissionRolesListView));
