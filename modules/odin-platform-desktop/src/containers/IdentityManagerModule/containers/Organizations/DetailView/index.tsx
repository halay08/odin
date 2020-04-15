import { Button, Col, Form, Input, Layout, Row } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import { getOrganizationByIdRequest, saveOrganizationRequest } from '../../../../../core/identityUser/store/actions';
import { errorNotification } from '../../../../../shared/system/notifications/store/reducers';

interface Props {
  userReducer: any;
  getOrganizationData: any;
  saveOrganization: any;
  notifyError: any;
}

interface State {
  name: string,
  billingReplyToEmail: string,
  customerServiceReplyToEmail: string,
  webUrl: string
}

class OrganizationsDetailView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    const { userReducer, getOrganizationData } = props;
    this.state = {
      name: '',
      billingReplyToEmail: '',
      customerServiceReplyToEmail: '',
      webUrl: '',
    }
    getOrganizationData({ id: userReducer.user.organization.id }, (resp: any) => {
      this.setState({
        name: resp.results.name,
        billingReplyToEmail: resp.results.billingReplyToEmail,
        customerServiceReplyToEmail: resp.results.customerServiceReplyToEmail,
        webUrl: resp.results.webUrl,
      })
    })
  }

  formRef = React.createRef<FormInstance>();

  saveChanges = async () => {
    const { notifyError, saveOrganization, userReducer } = this.props;
    try {
      if(!!this.formRef.current) {
        await this.formRef.current.validateFields();
        const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
        const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;
        if(hasErrors) {
          return notifyError({
            message: 'form has errors, fix them and resubmit',
            validation: null,
            data: null,
          });
        } else {
          saveOrganization({ data: this.state, id: userReducer.user.organization.id }, (resp: any) => {
            this.setState({
              name: resp.results.name,
              billingReplyToEmail: resp.results.billingReplyToEmail,
              customerServiceReplyToEmail: resp.results.customerServiceReplyToEmail,
              webUrl: resp.results.webUrl,
            })
          })
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  setFormValues = () => {
    this.formRef.current?.setFieldsValue({
      name: this.state.name,
      billingReplyToEmail: this.state.billingReplyToEmail,
      customerServiceReplyToEmail: this.state.customerServiceReplyToEmail,
      webUrl: this.state.webUrl,
    });
  }

  renderForm() {
    this.setFormValues()
    return (
      <Form
        layout={'vertical'}
        style={{ width: 'calc(100% - 6px)', paddingBottom: '1rem' }}
        ref={this.formRef}
        initialValues={this.state}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item className="form-item" label="Name" name='name' initialValue={this.state.name}>
              <Input
                placeholder="Name"
                onChange={(e) => this.setState({ name: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Billing Reply To Email"
              name='billingReplyToEmail'
            >
              <Input
                placeholder="Billing Reply To Email"
                onChange={(e) => this.setState({ billingReplyToEmail: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Customer Service Reply To Email"
              name='customerServiceReplyToEmail'
            >
              <Input
                placeholder="Customer Service Reply To Email"
                onChange={(e) => this.setState({ customerServiceReplyToEmail: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Web Url"
              name='webUrl'
            >
              <Input
                placeholder="Web Url"
                onChange={(e) => this.setState({ webUrl: e.target.value })}/>
            </Form.Item>

          </Col>
        </Row>
        <div style={{ float: 'right' }}>
          <Button key="1" type="primary" onClick={() => this.saveChanges()}>Save Changes</Button>
        </div>
      </Form>
    );
  }

  render() {

    return (
      <Layout className="record-detail-view">{this.renderForm()}</Layout>
    );
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
});

const mapDispatch = (dispatch: any) => ({
  notifyError: (params: any) => dispatch(errorNotification(params)),
  getOrganizationData: (params: any, cb: any) => dispatch(getOrganizationByIdRequest(params, cb)),
  saveOrganization: (params: any, cb: any) => dispatch(saveOrganizationRequest(params, cb)),
});

export default connect(mapState, mapDispatch)(OrganizationsDetailView);
