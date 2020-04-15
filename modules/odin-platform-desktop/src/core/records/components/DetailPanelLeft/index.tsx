import { DownOutlined } from '@ant-design/icons';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Button, Card, Dropdown, Menu, Popconfirm, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  canUserCloneRecord,
  canUserDeleteRecord,
  canUserUpdateRecord,
} from '../../../../shared/permissions/rbacRules';
import history from '../../../../shared/utilities/browserHisory';
import { getAllSchemaAssociationEntities, getBrowserPath } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { listUsers } from '../../../identity/store/actions';
import { getPipelinesByModuleAndEntity } from '../../../pipelines/store/actions';
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


const { Text } = Typography;

const { NOTE } = SchemaModuleEntityTypeEnums;

interface IProps {
  userReducer: any,
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
  visibleProperties?: string[],
  children?: any
  style?: any
  onDelete?: any
}

interface IState {
  showStatusChangeModal: boolean;
  statusId: number | null;
}

const uuid = uuidv4();

class DetailPanelLeft extends React.Component<IProps, IState> {

  async initializeCloneForm() {

    const {
      record,
      schemaReducer,
      initializeForm,
      getUsers,
      getPipelines,
      getAssociations,
      visibleProperties,
    } = this.props;

    getUsers();

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    if(schema) {

      getPipelines({ schema: schema });

      initializeForm({
        formUUID: uuid,
        title: 'Initializing',
        showInitializing: true,
      });

      getAssociations({
        recordId: record.id,
        schema,
        entities: getAllSchemaAssociationEntities(schema.associations, [ NOTE ]),
      }, (params: { results: DbRecordAssociationRecordsTransform[] }) => {

        // parse associations into related records

        const sectionAssociations: any[] = [];
        const modifiedAssociations: any[] = [];

        for(const key of Object.keys(params.results)) {
          // @ts-ignore
          if(params.results[key].dbRecords) {
            // @ts-ignore
            params.results[key].dbRecords.filter(elem => ![
              'FieldServiceModule:WorkOrder',
              'BillingModule:Invoice',
              'OrderModule:BillingAdjustment',
              'BillingModule:Transaction',
              'CrmModule:Lead',
            ].includes(elem.entity)).map((elem: DbRecordEntityTransform) => {

              sectionAssociations.push({
                recordId: elem.id,
                title: `${elem.entity}: ${elem.title}`,
              });

              modifiedAssociations.push({
                recordId: elem.id,
              });
            });
          }
        }

        initializeForm({
          formUUID: uuid,
          title: `Clone ${schema.entityName}`,
          showFormModal: true,
          showInitializing: false,
          isCreateReq: true,
          schema: schema,
          selected: record,
          recordType: record.type,
          visibleFieldOverride: visibleProperties,
          sections: [ { name: schema.name, schema: schema, associations: sectionAssociations } ],
          modified: [
            {
              schemaId: schema.id,
              type: record.type,
              title: record.title,
              ownerId: record.ownedBy?.id,
              properties: record.properties,
              associations: modifiedAssociations,
            },
          ],
        });
      });
    }
  }

  async initializeUpdateForm() {
    const {
      record,
      schemaReducer,
      initializeForm,
      getUsers,
      hasColumnMappings,
      getPipelines,
      visibleProperties,
    } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    if(schema) {

      getUsers();
      getPipelines({ schema: schema });

      initializeForm({
        formUUID: uuid,
        title: hasColumnMappings ? `Updating Related ${schema.entityName} Properties` : `Update ${schema.entityName}`,
        hasColumnMappings,
        visibleFieldOverride: visibleProperties,
        showFormModal: true,
        isUpdateReq: true,
        schema: schema,
        selected: record,
        recordType: record.type,
        sections: [ { name: schema.name, schema: schema } ],
      });
    }
  }

  private deleteRecord() {

    const { record, schemaReducer, deleteRecord, onDelete } = this.props;

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    if(schema) {
      deleteRecord({
        schema: schema,
        recordId: !!record ? record.id : null,
      }, () => {

        if(onDelete) {

          return onDelete();

        } else {
          history.push(`/${schema.moduleName}/${schema.entityName}`)
        }
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

    const { userReducer, record, schemaReducer, children, hasColumnMappings, style } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    return (
      <div className="detail-panel-left" style={style}>
        <OdinFormModal
          formUUID={uuid}
          onSubmitEvent={(params: { event: string, results: any }) => this.handleFormSubmit(params)}/>

        <Card size="small" className="card" title={`${schema?.entityName} Details`} extra={
          <Dropdown
            trigger={[ 'click' ]}
            overlay={(
              <Menu className="detail-action-menu">

                <Menu.Item
                  disabled={!canUserUpdateRecord(userReducer, schema, record)}
                  onClick={() => this.initializeUpdateForm()}>
                  Edit
                </Menu.Item>

                <Menu.Item
                  disabled={!canUserCloneRecord(userReducer, schema, record)}
                  onClick={() => this.initializeCloneForm()}>
                  Clone
                </Menu.Item>

                <Menu.Item disabled={hasColumnMappings || !canUserDeleteRecord(userReducer, schema, record)}>
                  <Popconfirm
                    title="Are you sure you want to delete this record?"
                    onConfirm={() => this.deleteRecord()}
                    disabled={!canUserDeleteRecord(userReducer, schema, record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Typography.Text>Delete</Typography.Text>
                  </Popconfirm>
                </Menu.Item>

                {hasColumnMappings &&
                <Menu.Item>
                    <Link to={getBrowserPath(record)}>View Master</Link>
                </Menu.Item>
                }
              </Menu>)}>

            <Button icon={<DownOutlined/>}/>

          </Dropdown>}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong>{record?.type}</Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {record?.recordNumber ? <Text strong>{`# ${record?.recordNumber}`}</Text> : <div/>}
            <Text strong>{record?.title}</Text>
          </div>
          <div style={{ marginTop: 16 }}>
            {children}
          </div>
        </Card>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
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


export default connect(mapState, mapDispatch)(DetailPanelLeft);


