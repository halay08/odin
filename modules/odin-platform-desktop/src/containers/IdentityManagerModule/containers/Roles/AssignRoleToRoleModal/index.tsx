import React from "react";
import { connect } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { Table } from "antd";
import { IdentityRbacRoleReducer } from "../../../../../core/identityRoles/store/reducer";
import {
  AssignRoleToRole, 
  assignRoleToRoleRequest, 
  getRolesDataRequest, 
  setAssignRolesModalVisible } from "../../../../../core/identityRoles/store/actions";
import { withRouter } from "react-router-dom";

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  getRolesList: any,
  setModalVisible: any,
  match: any,
  assignRole: (params: AssignRoleToRole) => void;
}

interface State {
  selectedRowKeys: any[]
}

class AssignRolesToRoleModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: []
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if(prevProps.identityRbacRoleReducer.assignModalVisible !== this.props.identityRbacRoleReducer.assignModalVisible) {
      if(this.props.identityRbacRoleReducer.assignModalVisible) this.fetchData();
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

  assignRoleToRole() {
    const { assignRole, match } = this.props;
    assignRole({roleIds: this.state.selectedRowKeys, roleId: match.params.roleId})
  }

  setDisabledState(data: any) {
    const { identityRbacRoleReducer, match } = this.props
    let userRolesArray: any = [];
    userRolesArray = [match.params.roleId];
    identityRbacRoleReducer.rolesLinksList.forEach((element: any) => {
      userRolesArray.push(element.id)
    });
    if(userRolesArray.indexOf(data.id) > -1) {
      return true
    } else {
      return false
    }
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
      }
    ];
    identityRbacRoleReducer?.list.forEach((element: any) => {
      element.key = element.id;
    });
    return (
      <Modal
        title={"Assign Roles to Role"}
        width={1000}
        visible={identityRbacRoleReducer?.assignModalVisible}
        onCancel={() => this.closemodal()}
        onOk={() => this.assignRoleToRole()}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: any) => this.onSelectChange(selectedRowKeys),
            selectedRowKeys: this.state.selectedRowKeys,
            getCheckboxProps: (record: any) => ({
              disabled: this.setDisabledState(record)
            })
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
});

const mapDispatch = (dispatch: any) => ({
  getRolesList: () => dispatch(getRolesDataRequest()),
  setModalVisible: (visible: boolean) => dispatch(setAssignRolesModalVisible(visible)),
  assignRole: (params: AssignRoleToRole) => dispatch(assignRoleToRoleRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(AssignRolesToRoleModal));
