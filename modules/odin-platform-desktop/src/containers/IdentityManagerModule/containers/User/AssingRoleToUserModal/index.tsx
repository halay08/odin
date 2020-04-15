import { Modal, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getRolesDataRequest, setAssignRolesModalVisible } from '../../../../../core/identityRoles/store/actions';
import { IdentityRbacRoleReducer } from '../../../../../core/identityRoles/store/reducer';
import { AssignRolesToUser, assignRolesToUserRequest } from '../../../../../core/identityUser/store/actions';
import { IdentityUserReducer } from '../../../../../core/identityUser/store/reducer';
import { getUserFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  getRolesList: any,
  setModalVisible: any,
  identityUserReducer: IdentityUserReducer,
  match: any,
  assignRoles: any
}

interface State {
  selectedRowKeys: any[]
}

class AssignRoleToUserModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { identityUserReducer, match } = this.props;
    if(prevProps.identityRbacRoleReducer.assignModalVisible !== this.props.identityRbacRoleReducer.assignModalVisible) {
      if(this.props.identityRbacRoleReducer.assignModalVisible) this.fetchData();
      // preselect roles if any
      let tempArr: any = [];
      const userId = match.params.userId;
      const user = getUserFromShortListByUserId(identityUserReducer.shortList, userId);
      user?.roles.forEach((element: any) => {
        tempArr.push(element.id);
        this.setState({
          selectedRowKeys: tempArr,
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

  assignRolesToUser() {
    const { assignRoles, match } = this.props;
    assignRoles({ roleIds: this.state.selectedRowKeys, id: match.params.userId })
  }

  render() {
    const { identityRbacRoleReducer } = this.props;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Description',
        dataIndex: 'description',
      },
    ];
    identityRbacRoleReducer.list.forEach((element: any) => {
      element.key = element.id;
    });
    return (
      <Modal
        title={'Assign Roles to User'}
        width={1000}
        visible={identityRbacRoleReducer?.assignModalVisible}
        onCancel={() => this.closemodal()}
        onOk={() => this.assignRolesToUser()}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: any) => this.onSelectChange(selectedRowKeys),
            selectedRowKeys: this.state.selectedRowKeys,

          }}
          loading={identityRbacRoleReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 315px)' }}
          style={{ minHeight: '100%', width: '100%' }}
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
  identityUserReducer: state.identityUserReducer,
});

const mapDispatch = (dispatch: any) => ({
  getRolesList: () => dispatch(getRolesDataRequest()),
  setModalVisible: (visible: boolean) => dispatch(setAssignRolesModalVisible(visible)),
  assignRoles: (params: AssignRolesToUser) => dispatch(assignRolesToUserRequest(params)),
});

export default withRouter(connect(mapState, mapDispatch)(AssignRoleToUserModal));
