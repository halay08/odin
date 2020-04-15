import { Button, Layout, PageHeader, Tabs, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { DeletePermission, deletePermissionRequest, getPermissionByIdRequest } from '../../../../../core/identityPermissions/store/actions';
import { IdentityRbacPermissionReducer } from '../../../../../core/identityPermissions/store/reducer';
import { getPermissionFromShortListByPermissionId } from '../../../../../shared/utilities/identityHelpers';
import DetailTabTemplate from '../../../components/DetailTabTemplate';
import PermissionRolesListView from '../PermissionRolesListView';

interface Props {
  match: any,
  getPermission: any,
  identityRbacPermissionReducer: IdentityRbacPermissionReducer,
  deletePermission: (params: DeletePermission) => void
}

const { TabPane } = Tabs;

class PermissionsDetailView extends React.Component<Props> {
  
  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getPermission, match } = this.props;
    const permissionId = match.params.permissionId;

    if(permissionId) {
      getPermission({ permissionId: permissionId }, (result: any) => {
      });
    }

  }

  deletePermission() {
    const { deletePermission, match } = this.props;
    const permissionId = match.params.permissionId;
    deletePermission({permissionId: permissionId})
  }

  render() {
    const { identityRbacPermissionReducer, match } = this.props;

    const permissionId = match.params.permissionId;
    const permission = getPermissionFromShortListByPermissionId(identityRbacPermissionReducer.shortList, permissionId);

    const detail = [
      { label: 'id', text: permission?.id },
      { label: 'Permission Name', text: permission?.name },
      { label: 'Permission Type', text: permission?.type },
      {
        label: 'Description',
        text: permission?.description,
      },
      { label: 'Created At', text: permission?.createdAt },
      { label: 'Updated At', text: permission?.updatedAt },
    ];

    return (
      <Layout className="record-detail-view">
        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => window.history.back()}
          title={"Permission: " + permission?.name}
          extra={[
            <Popconfirm
                    title="Are you sure you want to delete permission?"
                    onConfirm={() => this.deletePermission()}
                    okText="Yes"
                    cancelText="No"
                  >
              <Button danger key="1">Delete</Button>
            </Popconfirm>,
          ]}/>
        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="Roles">
            <TabPane tab="Roles" key="Roles">
              <PermissionRolesListView />
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
  identityRbacPermissionReducer: state.identityRbacPermissionReducer,
});

const mapDispatch = (dispatch: any) => ({
  getPermission: (params: any) => dispatch(getPermissionByIdRequest(params)),
  deletePermission: (params: DeletePermission) => dispatch(deletePermissionRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(PermissionsDetailView));
