import {Button, Col, Input, Layout, Row, Spin, Typography} from 'antd';
import React from 'react';
import {connect} from 'react-redux';
import {forgotPasswordRequest} from '../../../../../../core/identity/store/actions';
import {displayMessage} from '../../../../../../shared/system/messages/store/reducers';
import '../../styles.scss'

const {Content} = Layout;
const {Title} = Typography;

interface Props {
  forgotPassword: any,
  alertMessage: any
}

interface State {
  email: string
}

class ForgotPassword extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      email: ''
    }
  }

  handleOnChange = (email: string) => {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) {
      this.setState({email: email});
    } else {
      this.setState({email: ''});
    }
  }

  submitEmail = () => {
    const {forgotPassword, alertMessage} = this.props;
    forgotPassword({email: this.state?.email}, (resp: any) => {
      if (resp) {
        alertMessage({body: 'Link has been sent to your email. Please check you email.', type: 'success'});
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
                <Input
                  type='email'
                  placeholder="Email"
                  size="large"
                  autoFocus
                  onChange={(e) => this.handleOnChange(e.target.value)}
                />
                <Button
                  className='loginSubmit'
                  type="primary"
                  onClick={() => this.submitEmail()}
                  disabled={this.state?.email === ''}
                  size="large"
                  style={{marginTop: '40px', marginBottom:'0'}}
                >
                  Submit Email
                </Button>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    )
  }
}

const mapState = (state: any) => ({});

const mapDispatch = (dispatch: any) => ({
  forgotPassword: (params: any, cb: any) => dispatch(forgotPasswordRequest(params, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params))
});


export default connect(mapState, mapDispatch)(ForgotPassword);


