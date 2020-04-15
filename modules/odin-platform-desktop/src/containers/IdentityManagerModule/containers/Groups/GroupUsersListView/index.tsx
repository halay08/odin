import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { getGroupFromShortListByGroupId } from '../../../../../shared/utilities/identityHelpers';
import { setAssignUserModalVisible } from '../../../../../core/identityUser/store/actions';
import { IdentityGroupsReducer } from '../../../../../core/identityGroups/store/reducer';
import AssignUsersToGroupModal from '../AssignUsersToGroupModal';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityGroupsReducer: IdentityGroupsReducer,
  match: any,
  setModalVisible: any
}

class GroupUsersListView extends React.Component<Props> {

  setAssingRoleModalVisible() {
    const { setModalVisible } = this.props;
    setModalVisible(true);
  }

  renderGroupUsers() {
    const { identityGroupsReducer, match } = this.props;
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
    const groupId = match.params.groupId;
    const group = getGroupFromShortListByGroupId(identityGroupsReducer.shortList, groupId);
    const dataSource = group?.users;
    return (
      <>
        <AssignUsersToGroupModal />
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => {this.setAssingRoleModalVisible()}}>Add/Remove Users</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityGroupsReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderGroupUsers()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
    identityGroupsReducer: state.identityGroupsReducer,
});

const mapDispatch = (dispatch: any) => ({
  setModalVisible: (visible: boolean) => dispatch(setAssignUserModalVisible(visible))
});

export default withRouter(connect(mapState, mapDispatch)(GroupUsersListView));
