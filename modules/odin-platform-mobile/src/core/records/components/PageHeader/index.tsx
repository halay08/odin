import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Button, PageHeader, Popconfirm, Row, Spin, Typography } from 'antd';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import history from '../../../../shared/utilities/browserHisory';
import { changeToCapitalCase } from '../../../../shared/utilities/dataTransformationHelpers';
import { getBrowserPath } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { listUsers } from '../../../identity/store/actions';
import {
  getRecordAssociationByIdRequest,
  getRecordAssociationsRequest,
  IGetRecordAssociationById,
  IGetRecordAssociations,
} from '../../../recordsAssociations/store/actions';
import { DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST } from '../../../recordsAssociations/store/constants';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { deleteRecordByIdRequest, getRecordByIdRequest, IGetRecordById } from '../../store/actions';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../store/constants';
import { IRecordReducer } from '../../store/reducer';
import OdinFormModal from '../Forms/FormModal';
import { initializeRecordForm } from '../Forms/store/actions';
import { getPipelinesByModuleAndEntity } from '../Pipeline/store/actions';

const { NOTE } = SchemaModuleEntityTypeEnums;

interface IProps {
  identityReducer: any,
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  initializeForm: any,
  title?: string,
  descriptions?: any[]
  extraActions?: any[],
  extraContent?: any,
  disableBreadcrumbs?: boolean,
  deleteRecord: any,
  getRecord: any,
  getRelatedRecordById: any,
  getUsers: any,
  getPipelines: any,
  getAssociations: any,
  hasColumnMappings?: boolean,
  disableDelete?: boolean,
  disableClone?: boolean,
  disableEdit?: boolean,
}

interface IState {
  showStatusChangeModal: boolean;
  statusId: number | null;
}

const uuid = uuidv4();

class RecordPageHeader extends React.Component<IProps, IState> {

  async initializeCloneForm() {
    const { record, schemaReducer, initializeForm, getUsers, getPipelines, getAssociations } = this.props;

    getUsers();

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    if(schema) {

      getPipelines({ schema: schema });

      initializeForm({
        formUUID: uuid,
        title: 'Initializing',
        showInitializing: true,
      });

      // getAssociations({
      //   recordId: record.id,
      //   schema,
      //   entities: getAllSchemaAssociationEntities(schema.associations, [ NOTE ]),
      // }, (params: { results: DbRecordAssociationRecordsTransform[] }) => {
      //
      //   // parse associations into related records
      //
      //   const sectionAssociations: any[] = [];
      //   const modifiedAssociations: any[] = [];
      //
      //   for(const key of Object.keys(params.results)) {
      //     // @ts-ignore
      //     if(params.results[key].dbRecords) {
      //       // @ts-ignore
      //       params.results[key].dbRecords.map((elem: DbRecordEntityTransform) => {
      //         sectionAssociations.push({
      //           recordId: elem.id,
      //           title: `${elem.entity}: ${elem.title}`,
      //         });
      //
      //         modifiedAssociations.push({
      //           recordId: elem.id,
      //         });
      //       });
      //     }
      //   }

      const sectionAssociations: any[] = [];
      const modifiedAssociations: any[] = [];

      initializeForm({
        formUUID: uuid,
        title: `Clone ${schema.entityName}`,
        showFormModal: true,
        showInitializing: false,
        isCreateReq: true,
        schema: schema,
        selected: record,
        sections: [ { name: schema.name, schema: schema, associations: sectionAssociations } ],
        modified: [
          {
            schemaId: schema.id,
            title: record.title,
            ownerId: record.ownedBy?.id,
            properties: record.properties,
            associations: modifiedAssociations,
          },
        ],
      });
    }
  }

  async initializeUpdateForm() {
    const { record, schemaReducer, initializeForm, getUsers, hasColumnMappings, getPipelines } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    if(schema) {

      getUsers();
      getPipelines({ schema: schema });

      initializeForm({
        formUUID: uuid,
        title: hasColumnMappings ? `Updating Related ${schema.entityName} Properties` : `Update ${schema.entityName}`,
        hasColumnMappings,
        showFormModal: true,
        isUpdateReq: true,
        schema: schema,
        selected: record,
        sections: [ { name: schema.name, schema: schema } ],
      });
    }
  }

  private deleteRecord() {
    const { record, schemaReducer, deleteRecord } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    if(schema) {
      deleteRecord({
        schema: schema,
        recordId: !!record ? record.id : null,
      }, () => {
        history.push(`/${schema.moduleName}/${schema.entityName}`)
      });
    }
  }

  private handleFormSubmit(params: { event: string, results: any }) {
    const { getRecord, getRelatedRecordById, record, schemaReducer } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    switch (params.event) {
      case DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST:
        getRelatedRecordById({
          schema: schema,
          recordId: record.id,
          dbRecordAssociationId: record?.dbRecordAssociation?.id,
        });
        break;
      case UPDATE_DB_RECORD_BY_ID_REQUEST:
        getRecord({ schema, recordId: params.results.id });
        break;
      case CREATE_DB_RECORD_REQUEST:
        history.push(`${getBrowserPath(params.results)}`);
        break;
    }
  }

  render() {

    const { record, schemaReducer, recordReducer, extraActions, hasColumnMappings, disableDelete, disableClone, disableEdit } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (
      <Fragment>
        <OdinFormModal formUUID={uuid}
                       onSubmitEvent={(params: { event: string, results: any }) => this.handleFormSubmit(params)}/>

        <Spin tip="Loading..." spinning={recordReducer.isRequesting}>
          <PageHeader
            className="page-header"
            onBack={() => history.goBack()}
            title={changeToCapitalCase(schema?.entityName)}
            subTitle={record?.recordNumber}
            extra={[
              <Popconfirm
                title="Are you sure you want to delete this record?"
                onConfirm={() => this.deleteRecord()}
                okText="Yes"
                cancelText="No"
              >
                <Button disabled={hasColumnMappings || disableDelete} key="2" danger>Delete</Button>
              </Popconfirm>,
              <Button disabled={hasColumnMappings || disableClone} key="1" type="primary"
                      onClick={() => this.initializeCloneForm()}>Clone</Button>,
              <Button key="1" type="primary" disabled={disableEdit}
                      onClick={() => this.initializeUpdateForm()}>Edit</Button>,
              extraActions,
            ]}
          >
            <Row>
              <Typography.Title level={4}>{record?.title}</Typography.Title>
            </Row>
          </PageHeader>
        </Spin>
      </Fragment>
    )
  }
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  getRelatedRecordById: (payload: IGetRecordAssociationById) => dispatch(getRecordAssociationByIdRequest(payload)),
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
  deleteRecord: (payload: any, cb: any) => dispatch(deleteRecordByIdRequest(payload, cb)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getAssociations: (params: IGetRecordAssociations, db: any) => dispatch(getRecordAssociationsRequest(params, db)),
});


export default connect(mapState, mapDispatch)(RecordPageHeader);


