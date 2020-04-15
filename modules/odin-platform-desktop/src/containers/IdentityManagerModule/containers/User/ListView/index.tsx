import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CreateNewUser, createUserRequest, getUsersDataRequest } from '../../../../../core/identityUser/store/actions';
import { IdentityUserReducer } from '../../../../../core/identityUser/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import * as formFields from '../FormFields';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityUserReducer: IdentityUserReducer,
  getUsersList: any,
  initializeForm: any,
  formReducer: SharedFormReducer,
  createNewUser: (params: CreateNewUser) => void
}

const uuid = uuidv4();

class UsersListView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { getUsersList } = this.props;
    getUsersList();
  }

  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create User',
      formFields: formFields.formFields,
      entityName: 'User',
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createNewUser, formReducer } = this.props;

    if(params.data && !formReducer.isUpdateReq) {

      const body = {
        firstname: params.data.firstname,
        lastname: params.data.lastname,
        email: params.data.email,
        password: params.data.password,
      };

      createNewUser({ body })

    }
  }

  renderUsers() {
    const { identityUserReducer } = this.props;
    const columns = [
      {
        title: 'First Name',
        dataIndex: 'firstname',
        key: 'firstname',
        sorter: (a: any, b: any) => a.firstname.localeCompare(b.firstname),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Users/${record?.id}`}>{record.firstname}</Link>
        ),
      },
      {
        title: 'Last Name',
        dataIndex: 'lastname',
        key: 'lastname',
        sorter: (a: any, b: any) => a.lastname.localeCompare(b.lastname),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        sorter: (a: any, b: any) => a.status.localeCompare(b.status),
      },
    ];
    const dataSource = identityUserReducer.list;
    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => this.showCreateForm()}>New User</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityUserReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderUsers()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityUserReducer: state.identityUserReducer,
  formReducer: state.formReducer,
});

const mapDispatch = (dispatch: any) => ({
  getUsersList: () => dispatch(getUsersDataRequest()),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createNewUser: (params: CreateNewUser) => dispatch(createUserRequest(params)),
});

export default connect(mapState, mapDispatch)(UsersListView);
