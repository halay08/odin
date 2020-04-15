import { Button, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { sendConfirmationEmail, SendgridEmailEntity } from '../../email/store/actions';


interface Props {
  email: SendgridEmailEntity,
  sendConfirmation: any,
  buttonText?: string,
}

interface State {
  showModal: boolean
}

class SendDynamicEmail extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      showModal: false,
    }
  }

  sendEmail() {

    const { sendConfirmation, email } = this.props;

    sendConfirmation(`NotificationModule/v1.0/sendgrid/dynamic_template`, email);

    this.setState({ showModal: false });

  }


  render() {

    const { email, buttonText } = this.props;
    const { showModal } = this.state;

    return (
      <div>
        <Button onClick={() => this.setState({ showModal: true })}>{buttonText || 'Email'}</Button>

        <Modal title="New Email" visible={showModal} onOk={() => this.sendEmail()}
               onCancel={() => this.setState({ showModal: false })}>
          <p>To: {email.to}</p>
          <pre>{JSON.stringify(email.dynamicTemplateData, null, 2)}</pre>
        </Modal>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any, body: SendgridEmailEntity) => dispatch(sendConfirmationEmail(payload, body)),
});

export default connect(mapState, mapDispatch)(SendDynamicEmail);
