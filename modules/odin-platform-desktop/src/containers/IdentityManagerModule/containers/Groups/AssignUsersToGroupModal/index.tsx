import React from "react";
import { connect } from "react-redux";
import Modal from "antd/lib/modal/Modal";
import { Table } from "antd";
import { IdentityUserReducer } from "../../../../../core/identityUser/store/reducer";
import { withRouter } from "react-router-dom";
import { getGroupFromShortListByGroupId } from "../../../../../shared/utilities/identityHelpers";
import { getUsersDataRequest, setAssignUserModalVisible } from "../../../../../core/identityUser/store/actions";
import { IdentityGroupsReducer } from "../../../../../core/identityGroups/store/reducer";
import { AssignUsersToGroup, assignUsersToGroupRequest } from "../../../../../core/identityGroups/store/actions";

interface Props {
  identityGroupsReducer: IdentityGroupsReducer,
  getUsersList: any,
  setModalVisible: any,
  identityUserReducer: IdentityUserReducer,
  match: any,
  assignUsers: any
}

interface State {
  selectedRowKeys: any[]
}

class AssignUsersToGroupModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: []
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { identityGroupsReducer, match } = this.props;
    if(prevProps.identityUserReducer.assignModalVisible !== this.props.identityUserReducer.assignModalVisible) {
      if(this.props.identityUserReducer.assignModalVisible) this.fetchData();
      // preselect users if any
      let tempArr: any = [];
      const groupId = match.params.groupId;
      const group = getGroupFromShortListByGroupId(identityGroupsReducer.shortList, groupId);
      group?.users?.forEach((element: any) => {
        tempArr.push(element.id);
        this.setState({
          selectedRowKeys: tempArr
        })
      });
    }
  }

  fetchData() {
    const { getUsersList } = this.props;
    getUsersList();
  }

  onSelectChange = (selectedRowKeys: any) => {
    this.setState({ selectedRowKeys });
  };

  closemodal() {
    const { setModalVisible } = this.props;
    setModalVisible(false);
  }

  assignUsersToGroup() {
    const { assignUsers, match } = this.props;
    assignUsers({userIds: this.state.selectedRowKeys, id: match.params.groupId})
  }

  render() {
    const { identityUserReducer } = this.props;
    const columns = [
      { 
        title: 'First Name', 
        dataIndex: 'firstname'
      },
      { 
        title: 'Last Name',
        dataIndex: 'lastname'
      },
      { 
        title: 'Email',
        dataIndex: 'email'
      },
      {
        title: 'Status',
        dataIndex: 'status'
      }
    ];
    identityUserReducer?.list.forEach((element: any) => {
      element.key = element.id;
    });
    return (
      <Modal
        title={"Assign Users to Group"}
        width={1000}
        visible={identityUserReducer?.assignModalVisible}
        onCancel={() => this.closemodal()}
        onOk={() => this.assignUsersToGroup()}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: any) => this.onSelectChange(selectedRowKeys),
            selectedRowKeys: this.state.selectedRowKeys,

          }}
          loading={identityUserReducer.isRequesting}
          scroll={{ y: "calc(100vh - 315px)" }}
          style={{ minHeight: "100%", width: "100%" }}
          size="small"
          dataSource={identityUserReducer.list}
          columns={columns}
        ></Table>
      </Modal>
    );
  }
}

const mapState = (state: any) => ({
  identityGroupsReducer: state.identityGroupsReducer,
    identityUserReducer: state.identityUserReducer
});

const mapDispatch = (dispatch: any) => ({
  getUsersList: () => dispatch(getUsersDataRequest()),
  setModalVisible: (visible: boolean) => dispatch(setAssignUserModalVisible(visible)),
  assignUsers: (params: AssignUsersToGroup) => dispatch(assignUsersToGroupRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(AssignUsersToGroupModal));
