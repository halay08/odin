import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { IdentityOrganizationUserLogin } from '@d19n/models/dist/identity/organization/user/types/identity.organization.user.login';
import { Button, Col, Form, Input, Layout, Modal, Row, Spin, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { loginCancelRequest, loginRequest } from '../../../../../../core/identity/store/actions';
import { isUserAuthenticated } from '../../../../../../shared/permissions/rbacRules';
import history from '../../../../../../shared/utilities/browserHisory';
import '../../styles.scss'

type PathParams = {
  url: string,
  recordId: string
}
type PropsType = RouteComponentProps<PathParams> & {
  login: any,
  cancelRequest: any,
  userReducer: any,
  navigationReducer: any,
  history: any
}

const { Content } = Layout;
const { Title } = Typography;

const LoginModal = (props: PropsType) => {
  const { userReducer, navigationReducer, login } = props;
  const [ form ] = Form.useForm();

  const onFinish = (values: any) => {
    login(values, () => {
      if(navigationReducer.previousPage) {
        return history.push(navigationReducer.previousPage)
      } else {
        return history.push('/')
      }
    })
  };

  return (
    <Modal
      className="loginModal"
      centered
      visible={!isUserAuthenticated(userReducer) && (props.location.pathname !== '/login' && props.location.pathname !== '/forgot-password' && !props.location.pathname.includes(
        'reset-password')) && navigationReducer.previousPage}
      closable={false}
      cancelButtonProps={{ style: { display: 'none' } }}
      okButtonProps={{ style: { display: 'none' } }}
    >
      <Content>
        <Row className='login-form-row'>
          <Col span={24}>
            <div className='login-container-modal'>
              <Spin spinning={userReducer.isRequesting} tip="Loading...">
                <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>Your session has expired</Title>
                <p style={{ textAlign: 'center' }}>If you would like to continue your session, please sign in.</p>
                <br/>
                <Form
                  name="user-login"
                  className="login-form"
                  initialValues={{ remember: true }}
                  form={form}
                  onFinish={onFinish}

                >
                  <Form.Item
                    name="email"
                    rules={[ { required: true, message: 'Please input your email' } ]}
                  >
                    <Input
                      autoComplete='true'
                      prefix={<UserOutlined className="site-form-item-icon"/>}
                      placeholder="Username"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[ { required: true, message: 'Please input your password' } ]}
                  >
                    <Input
                      autoComplete='true'
                      prefix={<LockOutlined className="site-form-item-icon"/>}
                      type="password"
                      placeholder="Password"
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item style={{ textAlign: 'center' }}>
                    <Link className="login-form-forgot" to={`/forgot-password`}>Forgot password</Link>
                  </Form.Item>

                  <Form.Item shouldUpdate={true} style={{ textAlign: 'center', marginBottom: 0 }}>
                    {() => (<Button
                      type="primary"
                      size="large"
                      className="loginSubmit"
                      htmlType="submit"
                      disabled={form.getFieldsError().filter(({ errors }) => errors.length).length > 0}>
                      Log in
                    </Button>)}
                  </Form.Item>
                </Form>
              </Spin>
            </div>
          </Col>
        </Row>
      </Content>
    </Modal>
  )

}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  navigationReducer: state.navigationReducer,
});

const mapDispatch = (dispatch: any) => ({
  login: (payload: IdentityOrganizationUserLogin, cb: () => {}) => dispatch(loginRequest(payload, cb)),
  cancelRequest: () => dispatch(loginCancelRequest()),
});


export default withRouter(connect(mapState, mapDispatch)(LoginModal));
