import { Button, Layout, message, Modal, PageHeader, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { v4 as uuidv4 } from 'uuid';
import * as formFields from '../FormFields';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { CreateNewToken, createTokenRequest, getTokensDataRequest } from '../../../../../core/identityTokens/store/actions';
import { IdentityTokensReducer } from '../../../../../core/identityTokens/store/reducer';

const IDENTITY_MANAGER_MODULE = 'IdentityManagerModule';

interface Props {
  identityTokensReducer: IdentityTokensReducer,
  getTokensList: any,
  initializeForm: any,
  formReducer: SharedFormReducer,
  createNewToken: (params: CreateNewToken, cb: any) => void
}

const uuid = uuidv4();

class TokensListView extends React.Component<Props> {

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { getTokensList } = this.props;
    getTokensList();
  }

  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Token',
      formFields: formFields.formFields,
      entityName: 'Tokens',
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createNewToken, formReducer, getTokensList } = this.props;

    if(params.data && !formReducer.isUpdateReq) {

      const body = {
        name: params.data.name,
        description: params.data.description
      };

      createNewToken({ body }, (result: any) => {
        this.successModal(result.data);
        getTokensList();
      })

    }
  }

  copyText = (text: string) => {
    message.success('Token copied to the clipboard');
    navigator.clipboard.writeText(text);
  }

  successModal(data: any) {
    Modal.success({
      title: 'Token successfully saved.',
      content: 'Token: ' + data?.token,
      okText: 'Copy',
      onOk: () => this.copyText(data.token),
    });
  }

  renderTokens() {
    const { identityTokensReducer } = this.props;
    const columns = [
      { 
        title: 'Name', 
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        render: (text: any, record: any) => (
          <Link to={`/${IDENTITY_MANAGER_MODULE}/Tokens/${record?.id}`}>{record.name}</Link>
        ),
      },
      { 
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        sorter: (a: any, b: any) => a.description.localeCompare(b.description),
      }
    ];
    const dataSource = identityTokensReducer.list;
    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>
        <PageHeader
          extra={[
            <Button type="primary" key="1" onClick={() => this.showCreateForm()}>New Token</Button>,
          ]}
        />
        <Table
          size="small"
          loading={identityTokensReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </>
    );
  }

  render() {
    return (
      <Layout className="list-view">
        {this.renderTokens()}
      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  identityTokensReducer: state.identityTokensReducer,
  formReducer: state.formReducer,
});

const mapDispatch = (dispatch: any) => ({  
  getTokensList: () => dispatch(getTokensDataRequest()),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createNewToken: (params: CreateNewToken, cb: any) => dispatch(createTokenRequest(params, cb)),
});

export default connect(mapState, mapDispatch)(TokensListView);
