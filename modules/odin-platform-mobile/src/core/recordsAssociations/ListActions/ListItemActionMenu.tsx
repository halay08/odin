import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { canUserDeleteRecord } from '../../../shared/permissions/rbacRules';
import { getSchemaFromShortListBySchemaId } from '../../../shared/utilities/schemaHelpers';
import { initailizeCancelAppointmentModal } from '../../appointments/store/actions';
import { listUsers } from '../../identity/store/actions';
import OdinFormModal from '../../records/components/Forms/FormModal';
import { initializeRecordForm } from '../../records/components/Forms/store/actions';
import { getPipelinesByModuleAndEntity } from '../../records/components/Pipeline/store/actions';
import { deleteRecordByIdRequest, getRecordByIdRequest, IGetRecordById } from '../../records/store/actions';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../records/store/constants';
import { IRecordReducer } from '../../records/store/reducer';
import { getSchemaByIdRequest, ISchemaById } from '../../schemas/store/actions';
import { SchemaReducerState } from '../../schemas/store/reducer';
import {
  deleteRecordAssociationById,
  getRecordAssociationsRequest,
  IDeleteRecordAssociation,
  IGetRecordAssociations,
} from '../store/actions';
import { IRecordAssociationsReducer } from '../store/reducer';

interface Props {
  record: DbRecordEntityTransform,
  relatedRecord: DbRecordEntityTransform,
  relation: DbRecordAssociationRecordsTransform,
  hidden?: string[],
  userReducer: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: any,
  deleteRecord: any,
  initializeForm: any,
  deleteRecordAssociation: any,
  getAssociations: any,
  getUsers: any,
  getPipelines: any,
  getRecordById: any,
  initializeCancelAppointment: any
}

interface State {
  uuid: string;
  confirmDeleteRecord: boolean,
  confirmDeleteRecordAssociation: boolean
}

class ListItemActionMenu extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      uuid: uuidv4(),
      confirmDeleteRecord: false,
      confirmDeleteRecordAssociation: false,
    }
  }

  /**
   * We will want to replace this with a dynamic access control rule that can be set
   * by the user for the schema association detach rules
   * @private
   */
  private disableRemovalOfCustomerDeviceOnt() {

    const { relation, relatedRecord } = this.props;
    const { schemaAssociation } = relation

    if([ 'OrderItem__CustomerDeviceOnt' ].includes(schemaAssociation.label as string)) {
      const oltIpAddress = getProperty(relatedRecord, 'OltIpAddress');

      if(oltIpAddress) {
        return true;
      }

    }

    return false;

  }

  private menu() {

    const { relation, record, userReducer } = this.props;
    const { schemaAssociation } = relation;

    // check if the ontdevice has an oltIp then do not let the user remove the device

    if(![ 'OrderItem__Product' ].includes(schemaAssociation.label as string) && !this.disableRemovalOfCustomerDeviceOnt()) {

      if(schemaAssociation.cascadeDeleteChildRecord && schemaAssociation.relationType === RelationTypeEnum.CHILD) {

        if(schemaAssociation.label === 'WorkOrder__ServiceAppointment') {

          return <Button
            icon={<DeleteOutlined/>}
            danger
            disabled={relation ? !canUserDeleteRecord(userReducer, relation?.schema, record) : false}
            onClick={() => this.initializeCancelAppointment()}
          />

        } else {

          return (
            <Button
              icon={<DeleteOutlined/>}
              danger
              disabled={relation ? !canUserDeleteRecord(userReducer, relation?.schema, record) : false}
              onClick={() => this.setState({ confirmDeleteRecord: true })}/>
          )
        }

      } else {

        const swapButton = <Button
          style={{ marginRight: '.5rem' }}
          disabled={relation ? !canUserDeleteRecord(userReducer, relation?.schema, record) : false}
          onClick={() => this.showSwapModal()}
        >swap</Button>

        const removeButton = <Button
          icon={<DeleteOutlined/>}
          danger
          disabled={relation ? !canUserDeleteRecord(
            userReducer,
            relation?.schema,
            record,
          ) : false}
          onClick={() => this.setState({ confirmDeleteRecordAssociation: true })}/>;


        if([ 'OrderItem__CustomerDeviceRouter' ].includes(schemaAssociation.label as string)) {

          return [ swapButton, removeButton ]

        }

        return removeButton
      }
    }
  }

  private showSwapModal() {
    const { relatedRecord, relation, record } = this.props;
  }

  private initializeCancelAppointment() {
    const { initializeCancelAppointment, relatedRecord } = this.props;
    initializeCancelAppointment({
      cancelModalVisible: true,
      cancelRelatedRecord: relatedRecord,
    })
  }

  async initializeUpdateForm() {
    const { relatedRecord, getSchema, initializeForm, getUsers, getPipelines } = this.props;

    getUsers();

    getSchema({ schemaId: relatedRecord.schemaId }, (result: SchemaEntity) => {

      getPipelines({ schema: result });

      initializeForm({
        formUUID: this.state.uuid,
        title: `Update ${result.entityName}`,
        showFormModal: true,
        isUpdateReq: true,
        schema: result,
        selected: relatedRecord,
        sections: [ { name: result.name, schema: result } ],
      });
    });
  }

  private deleteRecord() {
    const { relatedRecord, deleteRecord, getSchema } = this.props;

    getSchema({ schemaId: relatedRecord.schemaId }, (result: SchemaEntity) => {
      deleteRecord({
        schema: result,
        recordId: !!relatedRecord ? relatedRecord.id : null,
      }, () => {
        this.setState({ confirmDeleteRecord: false })
        this.getRecordAssociations();
      });
    });
  }

  private deleteRecordAssociation() {
    const { relatedRecord, deleteRecordAssociation, getSchema, relation } = this.props;
    const { schemaAssociation } = relation;

    getSchema({ schemaId: relatedRecord.schemaId }, (result: SchemaEntity) => {
      deleteRecordAssociation({
        schema: result,
        schemaAssociation,
        dbRecordAssociationId: relatedRecord && relatedRecord.dbRecordAssociation ? relatedRecord.dbRecordAssociation.id : null,
      }, () => {
        this.getRecordAssociations();
      });
    });
  }

  private handleFormSubmit(params: { event: string, res: any }) {
    switch (params.event) {
      case CREATE_DB_RECORD_REQUEST:
        this.getRecordAssociations();
        break;
      case UPDATE_DB_RECORD_BY_ID_REQUEST:
        this.getRecordAssociations();
        break;
    }
  }

  private getRecordAssociations() {
    const { getAssociations, record, schemaReducer, getRecordById, relation } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    if(record) {
      if(record && schema) {
        getRecordById({ schema, recordId: record.id });
        getAssociations({
          recordId: record.id,
          key: relation.schema.entityName,
          schema: relation.schema,
          entities: [ relation.schema.entityName ],
        });
      }
    }
    return;
  }

  render() {
    const { recordReducer, recordAssociationReducer } = this.props;

    return (
      <>
        {/*Confirm deleting a record */}
        <Modal
          title="Delete Record"
          confirmLoading={recordReducer.isDeleting}
          visible={this.state.confirmDeleteRecord}
          onOk={() => this.deleteRecord()}
          onCancel={() => this.setState({ confirmDeleteRecord: false })}
          okText="Confirm"
          cancelText="Cancel"
        >
          <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }}/>
          <p>Are you sure you want to delete the record? it can not be recovered.</p>
        </Modal>

        {/*Confirm delete association with a record*/}
        <Modal
          title="Remove Relationship"
          visible={this.state.confirmDeleteRecordAssociation}
          confirmLoading={recordAssociationReducer.isDeleting}
          onOk={() => this.deleteRecordAssociation()}
          onCancel={() => this.setState({ confirmDeleteRecordAssociation: false })}
          okText="Confirm"
          cancelText="Cancel"
        >
          <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#ffa940' }}/>
          <p>Are you sure you want to delete the relationship to the record?</p>
        </Modal>
        <OdinFormModal formUUID={this.state.uuid}
                       onSubmitEvent={(params: { event: string, res: any }) => this.handleFormSubmit(params)}/>
        {this.menu()}
      </>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  getSchema: (payload: ISchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  deleteRecord: (payload: any, cb: any) => dispatch(deleteRecordByIdRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  deleteRecordAssociation: (payload: IDeleteRecordAssociation, cb: any) => dispatch(deleteRecordAssociationById(
    payload,
    cb,
  )),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  initializeCancelAppointment: (params: any) => dispatch(initailizeCancelAppointmentModal(params)),
});


export default connect(mapState, mapDispatch)(ListItemActionMenu);
