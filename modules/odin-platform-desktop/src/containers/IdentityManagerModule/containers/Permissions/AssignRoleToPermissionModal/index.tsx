import React from "react";
import { connect } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { Table } from "antd";
import { IdentityRbacRoleReducer } from "../../../../../core/identityRoles/store/reducer";
import { getRolesDataRequest, setAssignRolesModalVisible } from "../../../../../core/identityRoles/store/actions";
import { withRouter } from "react-router-dom";
import { getPermissionFromShortListByPermissionId } from "../../../../../shared/utilities/identityHelpers";
import { IdentityRbacPermissionReducer } from "../../../../../core/identityPermissions/store/reducer";
import { AssignRolesToPermission, assignRolesToPermissionRequest } from "../../../../../core/identityPermissions/store/actions";

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  getRolesList: any,
  setModalVisible: any,
  identityRbacPermissionReducer: IdentityRbacPermissionReducer,
  match: any,
  assignRoles: any
}

interface State {
  selectedRowKeys: any[]
}

class AssignRoleToPermissionModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: []
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { identityRbacPermissionReducer, match } = this.props;
    if(prevProps.identityRbacRoleReducer.assignModalVisible !== this.props.identityRbacRoleReducer.assignModalVisible) {
      if(this.props.identityRbacRoleReducer.assignModalVisible) this.fetchData();
      // preselect roles if any
      let tempArr: any = [];
      const permissionId = match.params.permissionId;
      const permission = getPermissionFromShortListByPermissionId(identityRbacPermissionReducer.shortList, permissionId);
      permission?.roles?.forEach((element: any) => {
        tempArr.push(element.id);
        this.setState({
          selectedRowKeys: tempArr
        })
      });
    }
  }

  fetchData() {
    const { getRolesList } = this.props;
    getRolesList();
  }

  onSelectChange = (selectedRowKeys: any) => {
    this.setState({ selectedRowKeys });
  };

  closemodal() {
    const { setModalVisible } = this.props;
    setModalVisible(false);
  }

  assignRolesToPermission() {
    const { assignRoles, match } = this.props;
    assignRoles({roleIds: this.state.selectedRowKeys, id: match.params.permissionId})
  }

  render() {
    const { identityRbacRoleReducer } = this.props;
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
    identityRbacRoleReducer.list.forEach((element: any) => {
      element.key = element.id;
    });
    return (
      <Modal
        title={"Assign Roles to Permission"}
        width={1000}
        visible={identityRbacRoleReducer?.assignModalVisible}
        onCancel={() => this.closemodal()}
        onOk={() => this.assignRolesToPermission()}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: any) => this.onSelectChange(selectedRowKeys),
            selectedRowKeys: this.state.selectedRowKeys,

          }}
          loading={identityRbacRoleReducer.isRequesting}
          scroll={{ y: "calc(100vh - 315px)" }}
          style={{ minHeight: "100%", width: "100%" }}
          size="small"
          dataSource={identityRbacRoleReducer.list}
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
  getRolesList: () => dispatch(getRolesDataRequest()),
  setModalVisible: (visible: boolean) => dispatch(setAssignRolesModalVisible(visible)),
  assignRoles: (params: AssignRolesToPermission) => dispatch(assignRolesToPermissionRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(AssignRoleToPermissionModal));
