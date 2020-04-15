import { ClockCircleOutlined } from '@ant-design/icons';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Button, Card, DatePicker, Drawer, Popconfirm, Spin } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { canUserCreateRecord } from '../../../shared/permissions/rbacRules';
import { parseDateToLocalFormat } from '../../../shared/utilities/dateHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../shared/utilities/schemaHelpers';
import {
  deleteRecordByIdRequest,
  getRecordByIdRequest,
  IDeleteRecordById,
  IGetRecordById,
} from '../../records/store/actions';
import { IRecordReducer } from '../../records/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../recordsAssociations/store/reducer';
import { getSchemaByIdRequest, ISchemaById } from '../../schemas/store/actions';
import { SchemaReducerState } from '../../schemas/store/reducer';
import { createAppointmentRequest, ICreateServiceAppointment, loadAppointmentsRequest } from '../store/actions';

interface Props {
  record: DbRecordEntityTransform,
  relation: DbRecordAssociationRecordsTransform,
  hidden?: string[],
  userReducer: any,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  schemaReducer: SchemaReducerState,
  getSchema: any,
  loadAppointments: any,
  createAppointment: any,
  appointmentReducer: any,
  deleteRecord: any,
  getAssociations: any,
  getRecordById: any
}

interface State {
  visible: boolean,
  start: string,
}

const { SERVICE_APPOINTMENT } = SchemaModuleEntityTypeEnums;

class BookingModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { visible: false, start: moment().format('YYYY-MM-DD') };

    this.handleCloseDrawer = this.handleCloseDrawer.bind(this);
  }

  private initializeModal() {
    const { loadAppointments } = this.props;
    loadAppointments({
      start: moment().format('YYYY-MM-DD'),
      end: moment().add(7, 'days').format('YYYY-MM-DD'),
    });
    this.setState({
      visible: true,
    });
  }

  private handleDateChange(start: string) {
    const { loadAppointments } = this.props;
    this.setState({
      start,
    });
    loadAppointments({
      start: moment(start).format('YYYY-MM-DD'),
      end: moment(start).add(7, 'days').format('YYYY-MM-DD'),
    });
  }

  private handleOk(apt: { Date: string, AM: boolean, PM: boolean }) {
    const { recordAssociationReducer, deleteRecord, record, relation, getSchema } = this.props;
    const { schema } = relation;

    if(record && record.id) {
      const associationKey = `${record?.id}_${SERVICE_APPOINTMENT}`;
      const associationObj: any = recordAssociationReducer.shortList[associationKey];

      if(associationObj[SERVICE_APPOINTMENT].dbRecords) {
        // first delete the current service appointment
        getSchema({ schemaId: schema.id }, (result: SchemaEntity) => {
          deleteRecord(
            {
              schema: result,
              recordId: associationObj[SERVICE_APPOINTMENT].dbRecords[0].id,
            },
            () => {
              console.log('CREATE A NEW APPOINTMENT');
              // Create service appointment for work order
              this.createNewAppointment(apt);
            },
          );
        });
      } else {
        // Create service appointment for work order
        this.createNewAppointment(apt);
      }
    }
  };

  private createNewAppointment(apt: { Date: string, AM: boolean, PM: boolean }) {
    const { record, createAppointment } = this.props;
    if(record) {
      createAppointment({
        workOrderId: record.id,
        createUpdate: {
          Date: apt.Date,
          TimeBlock: apt.AM ? 'AM' : 'PM',
        },
      }, () => {
        this.handleCloseDrawer();
        this.getRecordAssociations();
        // fetch new associations
      });
    }
  };

  private getRecordAssociations() {
    const { getAssociations, record, schemaReducer, getRecordById } = this.props;

    if(record) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
      if(schema) {
        getRecordById({ schema, recordId: record.id });
        getAssociations({
          recordId: record.id,
          key: SERVICE_APPOINTMENT,
          schema,
          entities: [ SERVICE_APPOINTMENT ],
        });
      }
    }

    return <div>data fetched</div>;

  }


  private handleCloseDrawer() {
    this.setState({
      visible: false,
    });
  };

  private renderListTitle() {
    const { recordAssociationReducer } = this.props;
    if(!!recordAssociationReducer.selected && recordAssociationReducer.selected.schema) {
      return `Book ${recordAssociationReducer.selected.schema.entityName}`
    } else {
      return 'Book Appointment';
    }
  };

  private renderConfirmBookingText(date: string | undefined, timeBlock: string) {
    const { recordAssociationReducer } = this.props;

    if(recordAssociationReducer.selected) {
      if(recordAssociationReducer.selected.dbRecords.length > 0) {
        return `This will cancel the current appointment and reserve a new appointment on ${date} for an ${timeBlock} time block`;
      } else {
        return `confirm ${timeBlock} booking`;
      }
    } else {
      return `confirm ${timeBlock} booking`;
    }
  };

  private renderAppointments() {
    const { appointmentReducer } = this.props;
    if(!!appointmentReducer.list) {
      return appointmentReducer.list.map((elem: { Date: string, AM: boolean, PM: boolean }) => (
        <Card title={parseDateToLocalFormat(elem.Date)} bordered={false} className="calendar-day-card">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Popconfirm
              title={this.renderConfirmBookingText(parseDateToLocalFormat(elem.Date), 'AM')}
              onConfirm={() => this.handleOk({ Date: elem.Date, AM: true, PM: false })}
              okText="Yes"
              cancelText="No"
              disabled={!elem.AM}
            >
              <Button disabled={!elem.AM} icon={<ClockCircleOutlined/>} className="time-am">AM</Button>
            </Popconfirm>
            <Popconfirm
              title={this.renderConfirmBookingText(parseDateToLocalFormat(elem.Date), 'PM')}
              onConfirm={() => this.handleOk({ Date: elem.Date, AM: false, PM: true })}
              okText="Yes"
              cancelText="No"
              disabled={!elem.PM}
            >
              <Button disabled={!elem.PM} icon={<ClockCircleOutlined/>} className="time-pm">PM</Button>
            </Popconfirm>
          </div>
        </Card>
      ));
    }
  }

  render() {

    const { schemaReducer, userReducer, record, appointmentReducer } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    return (
      <div>
        <Button
          disabled={!canUserCreateRecord(userReducer, schema)}
          type="text"
          onClick={() => this.initializeModal()}>
          Schedule / Re-schedule
        </Button>
        <Drawer
          title={this.renderListTitle()}
          visible={this.state.visible}
          onClose={() => this.handleCloseDrawer()}
          width={365}
        >
          <Spin spinning={appointmentReducer.isSearching} tip="Finding Appointments...">
            <Spin spinning={appointmentReducer.isCreating} tip="Saving Appointment...">
              <div style={{ padding: 10 }}>
                <DatePicker style={{ width: '100%' }} defaultValue={moment(this.state.start, 'YYYY-MM-DD')}
                            format={'YYYY-MM-DD'}
                            onChange={(date) => this.handleDateChange(moment(date).format('YYYY-MM-DD'))}/>
              </div>
              {this.renderAppointments()}
            </Spin>
          </Spin>
        </Drawer>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  appointmentReducer: state.appointmentReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  deleteRecord: (payload: IDeleteRecordById, cb: any) => dispatch(deleteRecordByIdRequest(payload, cb)),
  loadAppointments: (params: any) => dispatch(loadAppointmentsRequest(params)),
  createAppointment: (params: ICreateServiceAppointment, cb: () => {}) => dispatch(createAppointmentRequest(
    params,
    cb,
  )),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});


export default connect(mapState, mapDispatch)(BookingModal);
