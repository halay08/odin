import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { getRoleFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';
import { IdentityRbacRoleReducer } from '../../../../../core/identityRoles/store/reducer';
import AssignUsersToRoleModal from '../AssignUsersToRoleModal';
import { setAssignUserModalVisible } from '../../../../../core/identityUser/store/actions';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  match: any,
  setModalVisible: any
}

class RolesUsersListView extends React.Component<Props> {

  setAssingRoleModalVisible() {
    const { setModalVisible } = this.props;
    setModalVisible(true);
  }

  renderRolesUsers() {
    const { identityRbacRoleReducer, match } = this.props;
    const columns = [
      { 
        title: 'First Name', 
        dataIndex: 'firstname',
        key: 'firstname',
        sorter: (a: any, b: any) => a.firstname.localeCompare(b.firstname),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Users/${record?.id}`}>{record.firstname}</Link>
        ),
      },
      { 
        title: 'Last Name', 
        dataIndex: 'lastname',
        key: 'lastname',
        sorter: (a: any, b: any) => a.lastname.localeCompare(b.lastname),
      },
      { 
        title: 'Email', 
        dataIndex: 'email',
        key: 'email',
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
      },
      { 
        title: 'Status', 
        dataIndex: 'status',
        key: 'status',
        sorter: (a: any, b: any) => a.status.localeCompare(b.status),
      },
    ];
    const roleId = match.params.roleId;
    const role = getRoleFromShortListByUserId(identityRbacRoleReducer.shortList, roleId);
    const dataSource = role?.users;
    return (
      <>
        <AssignUsersToRoleModal />
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => {this.setAssingRoleModalVisible()}}>Add/Remove Users</Button>,
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
        {this.renderRolesUsers()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
    identityRbacRoleReducer: state.identityRbacRoleReducer,
});

const mapDispatch = (dispatch: any) => ({
  setModalVisible: (visible: boolean) => dispatch(setAssignUserModalVisible(visible))
});

export default withRouter(connect(mapState, mapDispatch)(RolesUsersListView));
