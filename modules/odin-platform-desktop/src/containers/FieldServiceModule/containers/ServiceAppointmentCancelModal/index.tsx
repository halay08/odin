import { Alert, Modal } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { cancelAppointmentRequest, closeCancelAppointmentModal } from '../../../../core/appointments/store/actions';
import { IAppointmentReducer } from '../../../../core/appointments/store/reducer';
import StepView from '../../../../shared/components/StepView';
import CancellationReasonForm from './containers/CancellationReasonForm';

interface Props {
  appointmentReducer: IAppointmentReducer,
  closeModal: any,
  cancelAppointment: any
}

interface State {
  saveData: any
}

class ServiceAppointmentCancelModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      saveData: {},
    }
  }

  handleSubmit() {

    const { appointmentReducer, cancelAppointment } = this.props;
    const saveData = this.state.saveData;

    if(saveData !== undefined) {

      saveData.AppointmentDate = moment(appointmentReducer.cancelRelatedRecord?.properties.Date).toISOString();
      saveData.TimeBlock = appointmentReducer.cancelRelatedRecord?.properties.TimeBlock
      cancelAppointment({ id: appointmentReducer.cancelRelatedRecord?.id, saveData: { properties: saveData } })

    }

  }

  render() {

    const { appointmentReducer, closeModal } = this.props;

    return (
      <>
        <Modal className="cancel-appointment-modal"
               title="Cancel Appointment"
               visible={appointmentReducer.cancelModalVisible}
               footer={null}
               onCancel={() => closeModal()}
        >
          <StepView
            onSubmit={(cb: any) => {
              this.handleSubmit()
            }}
            previousDisabled
            steps={[
              {
                name: 'Cancellation Reason',
                content: <CancellationReasonForm saveData={(e: any) => this.setState({ saveData: e })}/>,
              },
              {
                name: 'Cancel Appointment',
                content: <Alert
                  message="Cancelling Appointminet"
                  description="You are about to cancel an appointment. Click submit."
                  type="info"
                />,
              },
            ]}
          />
        </Modal>
      </>
    )
  }
}

const mapState = (state: any) => ({
  appointmentReducer: state.appointmentReducer,
});

const mapDispatch = (dispatch: any) => ({
  closeModal: () => dispatch(closeCancelAppointmentModal()),
  cancelAppointment: (params: any) => dispatch(cancelAppointmentRequest(params)),
});

// @ts-ignore
export default connect(mapState, mapDispatch)(ServiceAppointmentCancelModal);
