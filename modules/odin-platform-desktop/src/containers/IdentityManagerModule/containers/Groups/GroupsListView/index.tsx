import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { v4 as uuidv4 } from 'uuid';
import * as formFields from '../FormFields';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { createGroupRequest, CreateNewGroup, getGroupsDataRequest } from '../../../../../core/identityGroups/store/actions';
import { IdentityGroupsReducer } from '../../../../../core/identityGroups/store/reducer';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityGroupsReducer: IdentityGroupsReducer,
  getGroupsList: any,
  initializeForm: any,
  formReducer: SharedFormReducer,
  createNewGroup: (params: CreateNewGroup) => void
}

const uuid = uuidv4();

class GroupsListView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { getGroupsList } = this.props;
    getGroupsList();
  }

  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Group',
      formFields: formFields.formFields,
      entityName: 'Groups',
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createNewGroup, formReducer } = this.props;

    if(params.data && !formReducer.isUpdateReq) {

      const body = {
        name: params.data.name,
        description: params.data.description
      };

      createNewGroup({ body })

    }
  }

  renderGroups() {
    const { identityGroupsReducer } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Groups/${record?.id}`}>{record.name}</Link>
        ),
      },
      { 
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      },
      { 
        title: 'Groups',
        dataIndex: 'groups',
        key: 'groups',
        sorter: (a: any, b: any) => a.groups.localeCompare(b.groups),
      }
    ];
    const dataSource = identityGroupsReducer.list;
    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => this.showCreateForm()}>New Group</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityGroupsReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderGroups()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityGroupsReducer: state.identityGroupsReducer,
  formReducer: state.formReducer,
});

const mapDispatch = (dispatch: any) => ({  
  getGroupsList: () => dispatch(getGroupsDataRequest()),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createNewGroup: (params: CreateNewGroup) => dispatch(createGroupRequest(params)),
});

export default connect(mapState, mapDispatch)(GroupsListView);
