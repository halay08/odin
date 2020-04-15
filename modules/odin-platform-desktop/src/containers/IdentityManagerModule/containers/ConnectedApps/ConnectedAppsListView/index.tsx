import { Button, Layout, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { v4 as uuidv4 } from 'uuid';
import * as formFields from '../FormFields';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { createConnectedAppRequest, CreateNewConnectedApp, getConnectedAppsDataRequest } from '../../../../../core/identityConnectedApps/store/actions';
import { IdentityConnectedAppsReducer } from '../../../../../core/identityConnectedApps/store/reducer';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityConnectedAppsReducer: IdentityConnectedAppsReducer,
  getConnectedAppsList: any,
  initializeForm: any,
  formReducer: SharedFormReducer,
  createNewConnectedApp: (params: CreateNewConnectedApp) => void
}

const uuid = uuidv4();

class ConnectedAppsListView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { getConnectedAppsList } = this.props;
    getConnectedAppsList();
  }

  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Connected App',
      formFields: formFields.formFields,
      entityName: 'ConnectedApps',
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createNewConnectedApp, formReducer } = this.props;

    if(params.data && !formReducer.isUpdateReq) {

      const body = {
        name: params.data.name,
        baseUrl: params.data.baseUrl,
        apiKey: params.data.apiKey
      };

      createNewConnectedApp({ body })

    }
  }


  renderConnectedApps() {
    const { identityConnectedAppsReducer } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/ConnectedApps/${record?.id}`}>{record.name}</Link>
        ),
      }
    ];
    const dataSource = identityConnectedAppsReducer.list;
    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => this.showCreateForm()}>New Connected App</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityConnectedAppsReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderConnectedApps()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityConnectedAppsReducer: state.identityConnectedAppsReducer,
  formReducer: state.formReducer,
});

const mapDispatch = (dispatch: any) => ({  
  getConnectedAppsList: () => dispatch(getConnectedAppsDataRequest()),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createNewConnectedApp: (params: CreateNewConnectedApp) => dispatch(createConnectedAppRequest(params)),
});

export default connect(mapState, mapDispatch)(ConnectedAppsListView);
