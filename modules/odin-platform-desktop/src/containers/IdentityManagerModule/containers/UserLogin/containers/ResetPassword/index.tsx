import { Button, Col, Form, Input, Layout, Row, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { forgotPasswordRequest, resetPasswordRequest } from '../../../../../../core/identity/store/actions';
import history from '../../../../../../shared/utilities/browserHisory';
import { displayMessage } from '../../../../../../shared/system/messages/store/reducers'
import { FormInstance } from 'antd/lib/form';

const { Content } = Layout;
const {Title} = Typography;
interface Props {
  resetPasswordReq: any,
  match?: any,
  alertMessage?: any
}
interface State {
    token: string,
    password: string,
    confirmPassword: string
}

class ResetPassword extends React.Component<Props, State> {


  formRef = React.createRef<FormInstance>();

  constructor(props: Props) {
      super(props);
      this.state = 
      {
          token: props.match.params.token,
          password: '',
          confirmPassword: ''
      }
  }

  resetPassword = () => {
      const { resetPasswordReq, alertMessage } = this.props;
      const data = {
          password: this.state.password,
          confirmPassword: this.state.confirmPassword
      }
      resetPasswordReq({data: data, token: this.state.token}, (resp: any) => {
          if(resp) {
              alertMessage({ body: 'Your password has been updated', type: 'success' });
              history.push('/login');
          }
      });
  }

  render() {
  return (
    <Layout style={{paddingTop: '100px'}}>
    <Content>
      <Row align='middle' className='login-form-row'>
        <Col xs={{span: 20, offset: 2}} md={{span: 12, offset: 6}} xxl={{span: 8, offset: 8}}>
          <div className='login-container' style={{textAlign: 'center'}}>
            <Title level={3} style={{textAlign: 'center', marginBottom: '30px'}}>Reset password</Title>
            <Form name="password-reset">
              <Form.Item
                name="password"
                rules={[
                  {
                    validator(rule, value, callback) {
                      if(value === undefined) {
                          callback()
                        } else if(value.length < 8 || value.length > 20) {
                          callback('Password must be longer than or equal to 8 characters and shorter than or equal to 20 characters')
                        } else {
                          return callback(undefined);
                        }
                    }
                  }
                ]}
              >
                <Input size="large" type='password' placeholder="Enter Password" onChange={(e) => this.setState({password: e.target.value})}/>
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                rules={[
                  {
                    validator(rule, value, callback) {
                      if(value === undefined) {
                          callback()
                        } else if(value.length < 8 || value.length > 20) {
                          callback('Password must be longer than or equal to 8 characters and shorter than or equal to 20 characters')
                        } else {
                          return callback(undefined);
                        }
                    }
                  }
                ]}
              >
                <Input size="large" style={{marginTop: '0.5rem'}} type='password' placeholder="Confirm Password" onChange={(e) => this.setState({confirmPassword: e.target.value})}/>
              </Form.Item>
            </Form>
            <Button 
              size="large"
              className='submit-email-button' 
              onClick={() => this.resetPassword()} 
              disabled={this.state?.password !== this.state?.confirmPassword || this.state?.password === '' || this.state?.confirmPassword === ''}
            >
              Reset Password
            </Button>
          </div>
        </Col>
        </Row>
      </Content>
    </Layout>
  )}

}

const mapState = (state: any) => ({});

const mapDispatch = (dispatch: any) => ({
  forgotPassword: (params: any, cb: any) => dispatch(forgotPasswordRequest(params, cb)),
  resetPasswordReq: (params: any, cb: any) => dispatch(resetPasswordRequest(params, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params))
});


export default connect(mapState, mapDispatch)(ResetPassword);


