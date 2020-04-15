import { Button, Layout, PageHeader, Space, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { IdentityUserReducer } from '../../../../../core/identityUser/store/reducer';
import { Link, withRouter } from 'react-router-dom';
import { getUserFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';
import AssignRoleToUserModal from '../AssingRoleToUserModal'
import { setAssignRolesModalVisible } from '../../../../../core/identityRoles/store/actions';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityUserReducer: IdentityUserReducer,
  match: any,
  setModalVisible: any
}

class UserRolesListView extends React.Component<Props> {

  setAssingRoleModalVisible() {
    const { setModalVisible } = this.props;
    setModalVisible(true);
  }

  renderUsersRoles() {
    const { identityUserReducer, match } = this.props;
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
    const userId = match.params.userId;
    const user = getUserFromShortListByUserId(identityUserReducer.shortList, userId);
    const dataSource = user?.roles;
    return (
      <>
        <AssignRoleToUserModal />
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => {this.setAssingRoleModalVisible()}}>Add/Remove Role</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityUserReducer.isRequesting}
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
  identityUserReducer: state.identityUserReducer,
});

const mapDispatch = (dispatch: any) => ({
  setModalVisible: (visible: boolean) => dispatch(setAssignRolesModalVisible(visible))
});

export default withRouter(connect(mapState, mapDispatch)(UserRolesListView));
