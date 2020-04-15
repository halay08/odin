import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { v4 as uuidv4 } from 'uuid';
import * as formFields from '../FormFields';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { IdentityRbacRoleReducer } from '../../../../../core/identityRoles/store/reducer';
import { CreateNewRole, createRoleRequest, getRolesDataRequest } from '../../../../../core/identityRoles/store/actions';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityRbacRoleReducer: IdentityRbacRoleReducer,
  getRolesList: any,
  initializeForm: any,
  formReducer: SharedFormReducer,
  createNewRole: (params: CreateNewRole) => void
}

const uuid = uuidv4();

class RolesListView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { getRolesList } = this.props;
    getRolesList();
  }

  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Role',
      formFields: formFields.formFields,
      entityName: 'Roles',
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createNewRole, formReducer } = this.props;

    if(params.data && !formReducer.isUpdateReq) {

      const body = {
        name: params.data.name,
        description: params.data.description,
      };

      createNewRole({ body })

    }
  }

  renderRoles() {
    const { identityRbacRoleReducer } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Roles/${record?.id}`}>{record.name}</Link>
        ),
      },
      { 
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      }
    ];
    const dataSource = identityRbacRoleReducer.list;
    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => this.showCreateForm()}>New Role</Button>,
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
        {this.renderRoles()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityRbacRoleReducer: state.identityRbacRoleReducer,
  formReducer: state.formReducer,
});

const mapDispatch = (dispatch: any) => ({  
  getRolesList: () => dispatch(getRolesDataRequest()),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createNewRole: (params: CreateNewRole) => dispatch(createRoleRequest(params)),
});

export default connect(mapState, mapDispatch)(RolesListView);
