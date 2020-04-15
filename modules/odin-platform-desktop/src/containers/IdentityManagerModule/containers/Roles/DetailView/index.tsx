import { Button, Layout, PageHeader, Tabs, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DeleteRole, deleteRoleRequest, getRoleByIdRequest } from '../../../../../core/identityRoles/store/actions';
import { IdentityRbacRoleReducer } from '../../../../../core/identityRoles/store/reducer';
import { getRoleFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';
import DetailTabTemplate from '../../../components/DetailTabTemplate';
import RolesPermissionsListView from '../RolesPermissionsListView';
import RolesRolesListView from '../RolesRolesListView';
import RolesUsersListView from '../RolesUsersListView';

type PathParams = {
  userId: string,
}

type PropsType = RouteComponentProps<PathParams> & {
  match: any,
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  getRole: any,
  deleteRole: any,
}

const { TabPane } = Tabs;
class UserDetailView extends React.Component<PropsType> {

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getRole, match } = this.props;
    const roleId = match.params.roleId;

    if(roleId) {
      getRole({ roleId: roleId }, (result: any) => {
      });
    }

  }

  deleteRole() {
    const { deleteRole, match } = this.props;
    const roleId = match.params.roleId;
    deleteRole({roleId: roleId})
  }

  render() {

    const { identityRbacRoleReducer, match } = this.props;
    const roleId = match.params.roleId;
    const role = getRoleFromShortListByUserId(identityRbacRoleReducer.shortList, roleId);

    const detail = [
      { label: 'id', text: role?.id },
      { label: 'Role Name', text: role?.name },
      {
        label: 'Description',
        text: role?.description,
      },
      { label: 'Created At', text: role?.createdAt },
      { label: 'Updated At', text: role?.updatedAt },
    ];

    return (
      
      <Layout className="record-detail-view">
        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => window.history.back()}
          title={"Role: " + role?.name}
          extra={[
            <Popconfirm
                    title="Are you sure you want to delete role?"
                    onConfirm={() => this.deleteRole()}
                    okText="Yes"
                    cancelText="No"
                  >
              <Button danger key="1">Delete</Button>
            </Popconfirm>,
          ]}/>
        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="Permissions">
            <TabPane tab="Permissions" key="Permissions">
              <RolesPermissionsListView />
            </TabPane>
            <TabPane tab="Users" key="Users">
              <RolesUsersListView />
            </TabPane>
            <TabPane tab="Roles" key="Roles">
              <RolesRolesListView />
            </TabPane>
            <TabPane tab="Details" key="Details">
              <DetailTabTemplate detail={detail}/>
            </TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityRbacRoleReducer: state.identityRbacRoleReducer
});

const mapDispatch = (dispatch: any) => ({
  getRole: (payload: any, cb: any) => dispatch(getRoleByIdRequest(payload, cb)),
  deleteRole: (params: DeleteRole) => dispatch(deleteRoleRequest(params)),
});

export default withRouter(connect(mapState, mapDispatch)(UserDetailView));
