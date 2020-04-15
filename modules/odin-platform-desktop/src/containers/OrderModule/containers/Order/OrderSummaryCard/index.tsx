import { DownOutlined } from '@ant-design/icons';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Descriptions, Dropdown, Layout, Menu, Popconfirm, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { listUsers } from '../../../../../core/identity/store/actions';
import { getPipelinesByModuleAndEntity } from '../../../../../core/pipelines/store/actions';
import OdinFormModal from '../../../../../core/records/components/Forms/FormModal';
import { initializeRecordForm } from '../../../../../core/records/components/Forms/store/actions';
import {
  deleteRecordByIdRequest,
  getRecordByIdRequest,
  IGetRecordById,
} from '../../../../../core/records/store/actions';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../../../../core/records/store/constants';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationDescriptionList from '../../../../../core/recordsAssociations/components/AssociationDescriptionList';
import {
  getRecordAssociationByIdRequest,
  getRecordAssociationsRequest,
  IGetRecordAssociationById,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST } from '../../../../../core/recordsAssociations/store/constants';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { isSystemAdmin } from '../../../../../shared/permissions/rbacRules';
import history from '../../../../../shared/utilities/browserHisory';
import { getAllSchemaAssociationEntities, getBrowserPath } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';

interface Props {
  userReducer: any,
  record: DbRecordEntityTransform,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  initializeForm: any,
  getUsers: any,
  hasColumnMappings?: boolean,
  getPipelines: any,
  visibleProperties?: string[],
  getAssociations: any,
  disableDelete?: boolean,
  disableClone?: boolean,
  disableEdit?: boolean,
  deleteRecord: any,
  getRecord: any,
  getRelatedRecordById: any,
}

const uuid = uuidv4();

const { NOTE } = SchemaModuleEntityTypeEnums;

const { PRODUCT_MODULE, ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { DISCOUNT, ADDRESS, CONTACT, INVOICE, ORDER_ITEM, WORK_ORDER, ACCOUNT } = SchemaModuleEntityTypeEnums;

class OrderSummaryCard extends React.Component<Props> {

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
        sections: [ { name: schema.name, schema: schema } ],
      });
    }
  }

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
          visibleFieldOverride: visibleProperties,
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
    const {
      userReducer,
      record,
      hasColumnMappings,
      disableDelete,
      disableClone,
      disableEdit,
    } = this.props;

    return (
      <Layout>
        <OdinFormModal
          formUUID={uuid}
          onSubmitEvent={(params: { event: string, results: any }) => this.handleFormSubmit(params)}/>
        <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>
          <Card
            className="custom-order-card-wrapper"
            style={{ height: '100%', width: '100%' }}
            title={'Summary'}
            extra={
              <Dropdown trigger={[ 'click' ]} overlay={(
                <Menu>
                  <Menu.Item><Button size="small" type="text" disabled={disableEdit}
                                     onClick={() => this.initializeUpdateForm()}>Edit</Button></Menu.Item>
                  <Menu.Item><Button size="small" type="text" disabled={hasColumnMappings || disableClone}
                                     onClick={() => this.initializeCloneForm()}>Clone</Button></Menu.Item>
                  <Menu.Item>
                    <Popconfirm
                      title="Are you sure you want to delete this record?"
                      onConfirm={() => this.deleteRecord()}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        size="small"
                        type="text"
                        disabled={!isSystemAdmin(userReducer) && hasColumnMappings || disableDelete || record?.stage?.isSuccess || record?.stage?.isFail}
                        key="2" danger>Delete</Button>
                    </Popconfirm>
                  </Menu.Item>
                  {hasColumnMappings && <Menu.Item><Link to={getBrowserPath(record)}>View Master</Link></Menu.Item>}
                </Menu>)}>
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>actions<DownOutlined/>
                </a>
              </Dropdown>}
          >
            <Descriptions
              title="Order Details"
              style={{ marginBottom: 14 }}
              size="small"
              layout="vertical"
              column={4}
            >
              <Descriptions.Item label={'Order Number'}> {record?.recordNumber} </Descriptions.Item>
              <Descriptions.Item label={'Subtotal'}>{getProperty(
                record,
                'Subtotal',
              )}</Descriptions.Item>
              <Descriptions.Item label={'Contract Type'}>{getProperty(
                record,
                'ContractType',
              )}</Descriptions.Item>
              <Descriptions.Item label={'Issued'}>{getProperty(
                record,
                'IssuedDate',
              )}</Descriptions.Item>
              <Descriptions.Item label={'Billing Start'}>{getProperty(
                record,
                'BillingStartDate',
              )}</Descriptions.Item>
              <Descriptions.Item label={'Contract Start'}>{getProperty(
                record,
                'ContractStartDate',
              )}</Descriptions.Item>
              <Descriptions.Item label={'Contract End'}>{getProperty(
                record,
                'ContractEndDate',
              )}</Descriptions.Item>
              <Descriptions.Item label={'Contract Renewals'}>{getProperty(
                record,
                'ContractRenewalCount',
              )}</Descriptions.Item>
            </Descriptions>

            <AssociationDescriptionList
              title="Contact"
              record={record}
              moduleName={CRM_MODULE}
              entityName={CONTACT}
              layout="vertical"
              showRecordTitle
              hasColumnMappings
              addRecordTitleLink
              disableListActions
              column={4}
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'EmailAddress',
                'Phone',
              ]}/>

            <AssociationDescriptionList
              title="Address"
              record={record}
              moduleName={CRM_MODULE}
              entityName={ADDRESS}
              layout="vertical"
              showRecordTitle
              hasColumnMappings
              addRecordTitleLink
              disableListActions
              column={4}
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'Type',
                'SalesStatus',
              ]}/>

            <Descriptions
              title={'Discounts'}
              size="small"
              layout="vertical"
              column={4}
            >
              <Descriptions.Item label={'Order Discount'}>{getProperty(
                record,
                'DiscountValue',
              )}</Descriptions.Item>

              <Descriptions.Item label={'Total Discount'}>{getProperty(
                record,
                'TotalDiscounts',
              )}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Row>
      </Layout>
    )
  }

}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  getAssociations: (params: IGetRecordAssociations, db: any) => dispatch(getRecordAssociationsRequest(params, db)),
  deleteRecord: (payload: any, cb: any) => dispatch(deleteRecordByIdRequest(payload, cb)),
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
  getRelatedRecordById: (payload: IGetRecordAssociationById) => dispatch(getRecordAssociationByIdRequest(payload)),
});

export default connect(mapState, mapDispatch)(OrderSummaryCard);
