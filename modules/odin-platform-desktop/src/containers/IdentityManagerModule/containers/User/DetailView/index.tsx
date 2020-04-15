import { Button, Layout, PageHeader, Tabs, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DeleteUser, deleteUserRequest, EditUser, EditUserPassword, editUserPasswordRequest, editUserRequest, getUserByIdRequest } from '../../../../../core/identityUser/store/actions';
import { IdentityUserReducer } from '../../../../../core/identityUser/store/reducer';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { getUserFromShortListByUserId } from '../../../../../shared/utilities/identityHelpers';
import DetailTabTemplate from '../../../components/DetailTabTemplate';
import UserGroupsListView from '../UserGroupsListView';
import UserRolesListView from '../UserRolesListView';
import { v4 as uuidv4 } from 'uuid';
import * as formFields from '../FormFields';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';

type PathParams = {
  userId: string,
}

type PropsType = RouteComponentProps<PathParams> & {
  match: any,
  identityUserReducer: IdentityUserReducer,
  getUser: any,
  deleteUser: any,
  initializeForm: any,
  editUser: (params: EditUser) => void,
  editUserPassword: (params: EditUserPassword) => void
}

const { TabPane } = Tabs;

const uuid = uuidv4();
class UserDetailView extends React.Component<PropsType> {

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getUser, match } = this.props;
    const userId = match.params.userId;

    if(userId) {
      getUser({ userId: userId }, (result: any) => {
      });
    }

  }

  deleteUser() {
    const { deleteUser, match } = this.props;
    const userId = match.params.userId;
    deleteUser({userId: userId})
  }

  handleEdit() {
    const { identityUserReducer, match, initializeForm } = this.props;
    const userId = match.params.userId;
    const user = getUserFromShortListByUserId(identityUserReducer.shortList, userId);    

    const tempEl: any = user;
    
    let editForm = new Array();
    
    formFields.userEditForm.forEach((element: any) => {
      editForm.push({
        label: element.label,
        property: element.property,
        type: element.type,
        isRequired: element.isRequired,
        message: element.message,
        isHidden: element.isHidden,
        initialValue: tempEl[element.property],
        value: tempEl[element.property],
        options: element.options,
        isDisabled: element.isDisabled,
        allowClear: element.allowClear,
        customValidation: element.customValidation,
        customValidationMessage: element.customValidationMessage,
      })
    })

    initializeForm({
      formUUID: uuid,
      title: 'Edit User',
      recordId: user?.id,
      showModal: true,
      formFields: editForm,
      entityName: 'User',
      isUpdateReq: true,
    })
  }

  handleFormSubmit(params: any) {
    const { editUser, editUserPassword } = this.props;
    if(params.title === 'Edit User') {
      editUser({userId: params.id, body: params.data});
    } else if (params.title === 'Change Password') {
      editUserPassword({userId: params.id, body: params.data});
    }
  }

  handlePasswordChange() {
    const { identityUserReducer, match, initializeForm } = this.props;
    const userId = match.params.userId;
    const user = getUserFromShortListByUserId(identityUserReducer.shortList, userId);    

    const tempEl: any = user;
    
    let editForm = new Array();
    
    formFields.changePasswordForm.forEach((element: any) => {
      editForm.push({
        label: element.label,
        property: element.property,
        type: element.type,
        isRequired: element.isRequired,
        message: element.message,
        isHidden: element.isHidden,
        initialValue: tempEl[element.property],
        value: tempEl[element.property],
        options: element.options,
        isDisabled: element.isDisabled,
        allowClear: element.allowClear,
        customValidation: element.customValidation,
        customValidationMessage: element.customValidationMessage,
      })
    })

    initializeForm({
      formUUID: uuid,
      title: 'Change Password',
      recordId: user?.id,
      showModal: true,
      formFields: editForm,
      entityName: 'User',
      isUpdateReq: true,
    })
  }

  render() {

    const { identityUserReducer, match } = this.props;
    const userId = match.params.userId;
    const user = getUserFromShortListByUserId(identityUserReducer.shortList, userId);

    const detail = [
      { label: 'id', text: user?.id },
      { label: 'First Name', text: user?.firstname },
      { label: 'Last Name', text: user?.lastname },
      { label: 'Email', text: user?.email },
      { label: 'Created At', text: user?.createdAt },
      { label: 'Updated At', text: user?.updatedAt },
    ];

    return (
      
      <Layout className="record-detail-view">
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>
        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => window.history.back()}
          title={"User: " + user?.firstname + ' ' + user?.lastname}
          extra={[
            <Popconfirm
                    title="Are you sure you want to delete user?"
                    onConfirm={() => this.deleteUser()}
                    okText="Yes"
                    cancelText="No"
                  >
              <Button danger key="1">Delete</Button>
            </Popconfirm>,
            <Button type="primary" key="1" onClick={() => this.handleEdit()}>Edit User</Button>
          ]}/>
        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="Roles">
            <TabPane tab="Roles" key="Roles">
              <UserRolesListView />
            </TabPane>
            <TabPane tab="Groups" key="Groups">
              <UserGroupsListView />
            </TabPane>
            <TabPane tab="Details" key="Details">
              <DetailTabTemplate detail={detail}/>
              <Button onClick={() => this.handlePasswordChange()}>Change Password</Button>
            </TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityUserReducer: state.identityUserReducer
});

const mapDispatch = (dispatch: any) => ({
  getUser: (payload: any, cb: any) => dispatch(getUserByIdRequest(payload, cb)),
  deleteUser: (params: DeleteUser) => dispatch(deleteUserRequest(params)),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  editUser: (params: EditUser) => dispatch(editUserRequest(params)),
  editUserPassword: (params: EditUserPassword) => dispatch(editUserPasswordRequest(params))
});

export default withRouter(connect(mapState, mapDispatch)(UserDetailView));
