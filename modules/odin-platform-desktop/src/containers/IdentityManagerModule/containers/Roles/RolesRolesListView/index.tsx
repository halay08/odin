import { Button, Layout, PageHeader, Popconfirm, Table, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { getRolesLinksRequest, setAssignRolesModalVisible, unassignRoleLinkRequest } from '../../../../../core/identityRoles/store/actions';
import { IdentityRbacRoleReducer } from '../../../../../core/identityRoles/store/reducer';
import AssignRolesToRoleModal from "../AssignRoleToRoleModal";

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  match: any,
  setModalVisible: any,
  getRolesLinks: any,
  unassignRole: any
}

class RolesRolesListView extends React.Component<Props> {

    componentDidMount() {
      this.fetchData();
    }

    fetchData() {

    const { getRolesLinks, match } = this.props;
    const roleId = match.params.roleId;

      if(roleId) {
        getRolesLinks({ roleId: roleId }, (result: any) => {
      });
    }

    }

  setAssingRoleModalVisible() {
    const { setModalVisible } = this.props;
    setModalVisible(true);
  }

  handleUnassignRole(record: any) {
    const { unassignRole, match } = this.props;
    unassignRole({roleId: match.params.roleId, roleToLinkId: record.id})
  }

  renderRolesRoles() {
    const { identityRbacRoleReducer } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Roles/${record?.id}`} component={Typography.Link}>{record.name}</Link>
        ),
      },
      { 
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      },
      {
        title: '',
        dataIndex: 'operation',
        render: (text: any, record: any) => (
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleUnassignRole(record)}>
            <Button danger key='2'>Delete</Button>
          </Popconfirm>
        ),
      },
    ];
    
    const dataSource = identityRbacRoleReducer.rolesLinksList;
    return (
      <>
        <AssignRolesToRoleModal />
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => {this.setAssingRoleModalVisible()}}>Add Roles</Button>,
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
        {this.renderRolesRoles()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
    identityRbacRoleReducer: state.identityRbacRoleReducer,
});

const mapDispatch = (dispatch: any) => ({
  setModalVisible: (visible: boolean) => dispatch(setAssignRolesModalVisible(visible)),
  getRolesLinks: (params: any) => dispatch(getRolesLinksRequest(params)),
  unassignRole: (params: any) => dispatch(unassignRoleLinkRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(RolesRolesListView));
