import React from "react";
import { connect } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { Table } from "antd";
import { IdentityRbacRoleReducer } from "../../../../../core/identityRoles/store/reducer";
import { AssignPermissionsToRole, assignPermissionsToRoleRequest } from "../../../../../core/identityRoles/store/actions";
import { withRouter } from "react-router-dom";
import { getRoleFromShortListByUserId } from "../../../../../shared/utilities/identityHelpers";
import { getPermissionsDataRequest, setAssignPermissionsModalVisible } from "../../../../../core/identityPermissions/store/actions";
import { IdentityRbacPermissionReducer } from "../../../../../core/identityPermissions/store/reducer";

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  getPermissionsList: any,
  setModalVisible: any,
  identityRbacPermissionReducer: IdentityRbacPermissionReducer,
  match: any,
  assignPermissions: any
}

interface State {
  selectedRowKeys: any[]
}

class AssignPermissionToRoleModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: []
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { identityRbacRoleReducer, match } = this.props;
    if(prevProps.identityRbacPermissionReducer.assignModalVisible !== this.props.identityRbacPermissionReducer.assignModalVisible) {
      if(this.props.identityRbacPermissionReducer.assignModalVisible) this.fetchData();
      // preselect permissions if any
      let tempArr: any = [];
      const roleId = match.params.roleId;
      const role = getRoleFromShortListByUserId(identityRbacRoleReducer.shortList, roleId);
      role?.permissions?.forEach((element: any) => {
        tempArr.push(element.id);
        this.setState({
          selectedRowKeys: tempArr
        })
      });
    }
  }

  fetchData() {
    const { getPermissionsList } = this.props;
    getPermissionsList();
  }

  onSelectChange = (selectedRowKeys: any) => {
    this.setState({ selectedRowKeys });
  };

  closemodal() {
    const { setModalVisible } = this.props;
    setModalVisible(false);
  }

  assignPermissionsToRole() {
    const { assignPermissions, match } = this.props;
    assignPermissions({permissionIds: this.state.selectedRowKeys, id: match.params.roleId})
  }

  render() {
    const { identityRbacPermissionReducer } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name'
      },
      { 
        title: 'Description',
        dataIndex: 'description'
      },
    ];
    identityRbacPermissionReducer?.list.forEach((element: any) => {
      element.key = element.id;
    });
    return (
      <Modal
        title={"Assign Permissions to Role"}
        width={1000}
        visible={identityRbacPermissionReducer?.assignModalVisible}
        onCancel={() => this.closemodal()}
        onOk={() => this.assignPermissionsToRole()}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: any) => this.onSelectChange(selectedRowKeys),
            selectedRowKeys: this.state.selectedRowKeys,

          }}
          loading={identityRbacPermissionReducer.isRequesting}
          scroll={{ y: "calc(100vh - 315px)" }}
          style={{ minHeight: "100%", width: "100%" }}
          size="small"
          dataSource={identityRbacPermissionReducer.list}
          columns={columns}
        ></Table>
      </Modal>
    );
  }
}

const mapState = (state: any) => ({
    identityRbacRoleReducer: state.identityRbacRoleReducer,
    identityRbacPermissionReducer: state.identityRbacPermissionReducer
});

const mapDispatch = (dispatch: any) => ({
  getPermissionsList: () => dispatch(getPermissionsDataRequest()),
  setModalVisible: (visible: boolean) => dispatch(setAssignPermissionsModalVisible(visible)),
  assignPermissions: (params: AssignPermissionsToRole) => dispatch(assignPermissionsToRoleRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(AssignPermissionToRoleModal));
