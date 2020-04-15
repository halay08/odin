import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Alert, Modal, Spin } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { cancelAppointmentRequest } from '../../../../../core/appointments/store/actions';
import { IAppointmentReducer } from '../../../../../core/appointments/store/reducer';
import {
  createRecordsRequest,
  ICreateRecords,
  IUpdateRecordById,
  updateRecordByIdRequest,
} from '../../../../../core/records/store/actions';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import StepView from '../../../../../shared/components/StepView';
import { getRelatedListData } from '../../../../../shared/utilities/recordAssociationHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import CancellationReasonForm from './containers/CancellationReasonForm';

const { FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;
const CANCELLATION_REASON = 'CancellationReason';

interface Props {
  record: DbRecordEntityTransform,
  stage: PipelineStageEntity | undefined,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  appointmentReducer: IAppointmentReducer,
  cancelAppointment: any,
  getSchema: any,
  createRecord: (params: ICreateRecords, cb?: any) => void,
  updateRecord: (params: IUpdateRecordById, cb?: any) => void,
  onClosEvent?: any,
}

interface State {
  showModal: boolean,
  handlingStep2: boolean,
  saveData: any
}

class WorkOrderCancellationWorkflow extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
      handlingStep2: false,
      saveData: {},
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

    if(prevProps.stage !== this.props.stage) {

      if(this.props.stage) {

        this.initializeForm()

      }

    }
  }

  initializeForm() {

    this.setState({
      showModal: true,
    })
  }

  closeForm() {

    const { onClosEvent } = this.props;

    this.setState({
      showModal: false,
      handlingStep2: false,
    })

    onClosEvent()
  }

  handleSubmit() {

    const { appointmentReducer, recordAssociationReducer, record, getSchema, createRecord } = this.props;
    const saveData = this.state.saveData;

    if(saveData !== undefined) {

      const serviceAppointments = getRelatedListData(
        recordAssociationReducer,
        record.id,
        FIELD_SERVICE_MODULE,
        SERVICE_APPOINTMENT,
      );

      if(serviceAppointments) {
        saveData.AppointmentDate = moment(getProperty(serviceAppointments[0], 'Date')).toISOString();
        saveData.TimeBlock = getProperty(serviceAppointments[0], 'TimeBlock')
      }

      const body = {

        entity: `${FIELD_SERVICE_MODULE}:${CANCELLATION_REASON}`,
        properties: saveData,
        associations: [
          {
            recordId: record.id,
          },
        ],

      }

      // create the cancellation reason
      getSchema({ moduleName: FIELD_SERVICE_MODULE, entityName: CANCELLATION_REASON }, (result: SchemaEntity) => {

        createRecord({
          schema: result,
          createUpdate: [ body ],
        }, ((res: DbRecordEntityTransform) => {
          if(res) {
            this.setState({
              handlingStep2: true,
            })
            this.handleStepSubmitFinal()
          }
        }));
      })
    }
  }

  handleStepSubmitFinal() {

    const { schemaReducer, record, stage, updateRecord } = this.props;

    const workOrderSchema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    if(workOrderSchema && stage) {

      const body = {

        entity: record.entity,
        stageId: stage.id,

      }


      updateRecord({
        schema: workOrderSchema,
        recordId: record.id,
        createUpdate: body,
      }, (res: DbRecordEntityTransform) => {

        this.closeForm();

      });
    }

  }

  render() {

    const { stage } = this.props;

    return (
      <>
        <Modal className="cancel-appointment-modal"
               title="Cancel Work Order"
               visible={this.state.showModal}
               footer={null}
               onCancel={() => this.closeForm()}
        >
          {this.state.handlingStep2 ?
            <Spin tip="Loading...">
              <Alert
                message="Updating work order"
                description={`Updating the stage of the work order to ${stage?.name}`}
                type="info"
              />
            </Spin>
            :
            <StepView
              onSubmit={(cb: any) => this.handleSubmit()}
              previousDisabled
              steps={[
                {
                  name: 'Cancellation Reason',
                  content: <CancellationReasonForm saveData={(e: any) => this.setState({ saveData: e })}/>,
                },
              ]}
            />}
        </Modal>
      </>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  appointmentReducer: state.appointmentReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
  createRecord: (params: ICreateRecords, cb: any) => dispatch(createRecordsRequest(params, cb)),
  updateRecord: (params: IUpdateRecordById, cb: any) => dispatch(updateRecordByIdRequest(params, cb)),
  cancelAppointment: (params: any) => dispatch(cancelAppointmentRequest(params)),
});

export default connect(mapState, mapDispatch)(WorkOrderCancellationWorkflow);
