import { Button, Layout, PageHeader, Tabs, Popconfirm } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { DeleteConnectedApp, deleteConnectedAppRequest, EditConnectedApp, editConnectedAppRequest, getConnectedAppByIdRequest } from '../../../../../core/identityConnectedApps/store/actions';
import { IdentityConnectedAppsReducer } from '../../../../../core/identityConnectedApps/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { getConnectedAppFromShortListByConnectedAppId } from '../../../../../shared/utilities/identityHelpers';
import DetailTabTemplate from '../../../components/DetailTabTemplate';
import { formFields } from '../FormFields';
import { v4 as uuidv4 } from 'uuid';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
interface Props {
  match: any,
  identityConnectedAppsReducer: IdentityConnectedAppsReducer,
  deleteConnectedApp: (params: DeleteConnectedApp) => void,
  getConnectedApp: any,
  initializeForm: any,
  editConnectedApp: (params: EditConnectedApp) => void,
}

const { TabPane } = Tabs;

const uuid = uuidv4();
class ConnectedAppsDetailView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getConnectedApp, match } = this.props;
    const connectedAppId = match.params.connectedAppId;

    if(connectedAppId) {
      getConnectedApp({ connectedAppId: connectedAppId }, (result: any) => {
      });
    }

  }

  handleEdit = () => {
    const { initializeForm, match, identityConnectedAppsReducer } = this.props;
    const connectedAppId = match.params.connectedAppId;
    const connectedApp = getConnectedAppFromShortListByConnectedAppId(identityConnectedAppsReducer.shortList, connectedAppId);
    const data: any = connectedApp;
    let editForm = new Array();
    formFields.forEach((element: any) => {
      editForm.push({
        label: element.label,
        property: element.property,
        type: element.type,
        isRequired: element.isRequired,
        message: element.message,
        isHidden: element.isHidden,
        value: data[element.property],
        options: element.options,
        customValidation: element.customValidation,
        customValidationMessage: element.customValidationMessage,
      })
    })
    initializeForm({
      formUUID: uuid,
      title: 'Edit User',
      recordId: connectedApp?.id,
      showModal: true,
      formFields: editForm,
      entityName: 'User',
      isUpdateReq: true,
    })
  }

  handleFormSubmit(params: any) {
    const { editConnectedApp } = this.props;
    editConnectedApp({connectedAppId: params.id, body: params.data})
  }

  deleteConnectedApp() {
    const { deleteConnectedApp, match } = this.props;
    const connectedAppId = match.params.connectedAppId;
    deleteConnectedApp({connectedAppId: connectedAppId})
  }

  render() {
    const { identityConnectedAppsReducer, match } = this.props;

    const connectedAppId = match.params.connectedAppId;
    const connectedApp = getConnectedAppFromShortListByConnectedAppId(identityConnectedAppsReducer.shortList, connectedAppId);

    const detail = [
      { label: 'id', text: connectedApp?.id },
      { label: 'Name', text: connectedApp?.name },
      { label: 'Created At', text: connectedApp?.createdAt },
      { label: 'Updated At', text: connectedApp?.updatedAt },
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
          title={"Token: " + connectedApp?.name}
          extra={[
            <Popconfirm
                    title="Are you sure you want to delete Connected App?"
                    onConfirm={() => this.deleteConnectedApp()}
                    okText="Yes"
                    cancelText="No"
                  >
              <Button danger key="1">Delete</Button>
            </Popconfirm>,
            <Button type="primary" key="2" onClick={() => this.handleEdit()}>Edit</Button>,
          ]}/>
        <div className="detail-body-wrapper">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Details" key="1">
              <DetailTabTemplate detail={detail}/>
            </TabPane>
          </Tabs>
        </div>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityConnectedAppsReducer: state.identityConnectedAppsReducer,
});

const mapDispatch = (dispatch: any) => ({
  getConnectedApp: (params: any) => dispatch(getConnectedAppByIdRequest(params)),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  deleteConnectedApp: (params: DeleteConnectedApp) => dispatch(deleteConnectedAppRequest(params)),
  editConnectedApp: (params: EditConnectedApp) => dispatch(editConnectedAppRequest(params)),
});

export default withRouter(connect(mapState, mapDispatch)(ConnectedAppsDetailView));
