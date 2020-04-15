import { Button, Layout, PageHeader, Tabs, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { DeleteGroup, deleteGroupRequest, getGroupByIdRequest } from '../../../../../core/identityGroups/store/actions';
import { IdentityGroupsReducer } from '../../../../../core/identityGroups/store/reducer';
import { getGroupFromShortListByGroupId } from '../../../../../shared/utilities/identityHelpers';
import DetailTabTemplate from '../../../components/DetailTabTemplate';
import GroupUsersListView from '../GroupUsersListView';

interface Props {
  match: any,
  identityGroupsReducer: IdentityGroupsReducer,
  getGroup: any,
  deleteGroup: any
}

const { TabPane } = Tabs;

class GroupsDetailView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getGroup, match } = this.props;
    const groupId = match.params.groupId;

    if(groupId) {
      getGroup({ groupId: groupId }, (result: any) => {
      });
    }

  }

  deleteGroup() {
    const { deleteGroup, match } = this.props;
    const groupId = match.params.groupId;
    deleteGroup({groupId: groupId})
  }

  render() {
    const { identityGroupsReducer, match } = this.props;

    const groupId = match.params.groupId;
    const group = getGroupFromShortListByGroupId(identityGroupsReducer.shortList, groupId);

    const detail = [
      { label: 'id', text: group?.id },
      { label: 'Group Name', text: group?.name },
      {
        label: 'Description',
        text: group?.description,
      },
      { label: 'Created At', text: group?.createdAt },
      { label: 'Updated At', text: group?.updatedAt },
    ];


    return (
      <Layout className="record-detail-view">
        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => window.history.back()}
          title={"Group: " + group?.name}
          extra={[
            <Popconfirm
                    title="Are you sure you want to delete group?"
                    onConfirm={() => this.deleteGroup()}
                    okText="Yes"
                    cancelText="No"
                  >
              <Button danger key="1">Delete</Button>
            </Popconfirm>,
          ]}/>
        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="Users">
            <TabPane tab="Users" key="Users">
              <GroupUsersListView />
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
  identityGroupsReducer: state.identityGroupsReducer,
});

const mapDispatch = (dispatch: any) => ({
  getGroup: (params: any) => dispatch(getGroupByIdRequest(params)),
  deleteGroup: (params: DeleteGroup) => dispatch(deleteGroupRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(GroupsDetailView));
