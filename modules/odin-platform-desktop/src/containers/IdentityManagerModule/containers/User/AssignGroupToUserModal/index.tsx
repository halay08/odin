import { Modal, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getGroupsDataRequest, setAssignGroupsModalVisible } from '../../../../../core/identityGroups/store/actions';
import { IdentityGroupsReducer } from '../../../../../core/identityGroups/store/reducer';
import { AssignGroupsToUser, assignGroupsToUserRequest } from '../../../../../core/identityUser/store/actions';
import { IdentityUserReducer } from '../../../../../core/identityUser/store/reducer';
import { getUserFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';

interface Props {
  identityGroupsReducer: IdentityGroupsReducer,
  getGroupsList: any,
  setModalVisible: any,
  identityUserReducer: IdentityUserReducer,
  match: any,
  assignGroups: any
}

interface State {
  selectedRowKeys: any[]
}

class AssignGroupToUserModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { identityUserReducer, match } = this.props;
    if(prevProps.identityGroupsReducer.assignModalVisible !== this.props.identityGroupsReducer.assignModalVisible) {
      if(this.props.identityGroupsReducer.assignModalVisible) this.fetchData();
      // preselect groups if any
      let tempArr: any = [];
      const userId = match.params.userId;
      const user = getUserFromShortListByUserId(identityUserReducer.shortList, userId);
      user?.groups.forEach((element: any) => {
        tempArr.push(element.id);
        this.setState({
          selectedRowKeys: tempArr,
        })
      });
    }
  }

  fetchData() {
    const { getGroupsList } = this.props;
    getGroupsList();
  }

  onSelectChange = (selectedRowKeys: any) => {
    this.setState({ selectedRowKeys });
  };

  closemodal() {
    const { setModalVisible } = this.props;
    setModalVisible(false);
  }

  assignGroupsToUser() {
    const { assignGroups, match } = this.props;
    assignGroups({ groupIds: this.state.selectedRowKeys, id: match.params.userId })
  }

  render() {
    const { identityGroupsReducer } = this.props;
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
      },
      {
        title: 'Description',
        dataIndex: 'description',
      },
      {
        title: 'Groups',
        dataIndex: 'groups',
      },
    ];
    identityGroupsReducer.list.forEach((element: any) => {
      element.key = element.id;
    });
    return (
      <Modal
        title={'Assign Groups to User'}
        width={1000}
        visible={identityGroupsReducer?.assignModalVisible}
        onCancel={() => this.closemodal()}
        onOk={() => this.assignGroupsToUser()}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys: any) => this.onSelectChange(selectedRowKeys),
            selectedRowKeys: this.state.selectedRowKeys,

          }}
          loading={identityGroupsReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 315px)' }}
          style={{ minHeight: '100%', width: '100%' }}
          size="small"
          dataSource={identityGroupsReducer.list}
          columns={columns}
        ></Table>
      </Modal>
    );
  }
}

const mapState = (state: any) => ({
  identityGroupsReducer: state.identityGroupsReducer,
  identityUserReducer: state.identityUserReducer,
});

const mapDispatch = (dispatch: any) => ({
  getGroupsList: () => dispatch(getGroupsDataRequest()),
  setModalVisible: (visible: boolean) => dispatch(setAssignGroupsModalVisible(visible)),
  assignGroups: (params: AssignGroupsToUser) => dispatch(assignGroupsToUserRequest(params)),
});

export default withRouter(connect(mapState, mapDispatch)(AssignGroupToUserModal));
