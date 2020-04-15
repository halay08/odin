import { Layout, PageHeader, Tabs } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import UsersListView from '../User/ListView';
import RolesListView from '../Roles/RolesListView';
import PermissionsListView from '../Permissions/PermissionsListView';
import GroupsListView from '../Groups/GroupsListView';
import TokensListView from '../Tokens/TokensListView';
import ConnectedAppsListView from '../ConnectedApps/ConnectedAppsListView';
import OrganizationsDetailView from '../Organizations/DetailView';

interface Props {
}

const { TabPane } = Tabs;

class IdentityManager extends React.Component<Props> {

  render() {
    return (
      <Layout className="record-detail-view">
        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => window.history.back()}
          title={'Identity Manager'}
          style={{ marginRight: '0', marginLeft: '0' }}
        />
        <div className="detail-body-wrapper identity-manager-wrapper">
          <Tabs>
            <TabPane tab="Users" key="Users">
              <UsersListView />
            </TabPane>
            <TabPane tab="Roles" key="Roles">
              <RolesListView />
            </TabPane>
            <TabPane tab="Permissions" key="Permissions">
              <PermissionsListView />
            </TabPane>
            <TabPane tab="Groups" key="Groups">
              <GroupsListView />
            </TabPane>
            <TabPane tab="Tokens" key="Tokens">
              <TokensListView />
            </TabPane>
            <TabPane tab="Connected Apps" key="ConnectedApps">
              <ConnectedAppsListView />
            </TabPane>
            <TabPane tab="Organization" key="Organization">
              <OrganizationsDetailView />
            </TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
});

const mapDispatch = (dispatch: any) => ({
});

export default connect(mapState, mapDispatch)(IdentityManager);
