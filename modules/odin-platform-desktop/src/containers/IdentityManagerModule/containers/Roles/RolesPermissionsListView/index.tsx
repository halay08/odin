import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { getRoleFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';
import { IdentityRbacRoleReducer } from '../../../../../core/identityRoles/store/reducer';
import AssignPermissionToRoleModal from '../AssignPermissionToRoleModal'
import { setAssignPermissionsModalVisible } from '../../../../../core/identityPermissions/store/actions';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  match: any,
  setModalVisible: any
}

class RolesPermissionsListView extends React.Component<Props> {

  setAssingRoleModalVisible() {
    const { setModalVisible } = this.props;
    setModalVisible(true);
  }

  renderRolesPermissions() {
    const { identityRbacRoleReducer, match } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Permissions/${record?.id}`}>{record.name}</Link>
        ),
      },
      { 
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      },
      { 
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        sorter: (a: any, b: any) => a.type.localeCompare(b.type),
      }
    ];
    const roleId = match.params.roleId;
    const role = getRoleFromShortListByUserId(identityRbacRoleReducer.shortList, roleId);
    const dataSource = role?.permissions;
    return (
      <>
        <AssignPermissionToRoleModal />
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => {this.setAssingRoleModalVisible()}}>Add/Remove Permissions</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityRbacRoleReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderRolesPermissions()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
    identityRbacRoleReducer: state.identityRbacRoleReducer,
});

const mapDispatch = (dispatch: any) => ({
  setModalVisible: (visible: boolean) => dispatch(setAssignPermissionsModalVisible(visible))
});

export default withRouter(connect(mapState, mapDispatch)(RolesPermissionsListView));
