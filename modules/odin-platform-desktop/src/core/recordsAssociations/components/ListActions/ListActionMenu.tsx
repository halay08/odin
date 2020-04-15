import { DownOutlined } from '@ant-design/icons';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { RelationTypeEnum } from '@d19n/models/dist/schema-manager/db/record/association/types/db.record.association.constants';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { Button, Dropdown, Menu } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import PaymentMethodForm from '../../../../containers/BillingModule/containers/PaymentMethod/PaymentMethodForm';
import CreateContactModal from '../../../../containers/CrmModule/containers/Contact/CreateContact';
import ProductSelector from '../../../../containers/OrderModule/containers/Order/AddProducts/PriceBookProductSelector';
import GenerateWorkOrder from '../../../../containers/OrderModule/containers/Order/GenerateWorkOrder';
import SplitOrder from '../../../../containers/OrderModule/containers/Order/SplitOrder';
import PriceBookProductSelector from '../../../../containers/ProductModule/AddProducts/PriceBookProductSelector';
import ActivateCustomerDeviceOnt from '../../../../containers/ServiceModule/ActivateCustomerDeviceOnt';
import SwapCustomerDeviceOnt from '../../../../containers/ServiceModule/SwapCustomerDeviceOnt';
import { canUserCreateRecord, canUserDeleteRecord } from '../../../../shared/permissions/rbacRules';
import history from '../../../../shared/utilities/browserHisory';
import { getModuleAndEntityNameFromRecord } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import BookingModal from '../../../appointments/components/BookingModal';
import { listUsers } from '../../../identity/store/actions';
import { getPipelinesByModuleAndEntity } from '../../../pipelines/store/actions';
import OdinFormModal from '../../../records/components/Forms/FormModal';
import { initializeRecordForm } from '../../../records/components/Forms/store/actions';
import { getRecordByIdRequest, IGetRecordById } from '../../../records/store/actions';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../../records/store/constants';
import { getSchemaByIdRequest, ISchemaById } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../store/actions';
import { IRecordAssociationsReducer } from '../../store/reducer';
import LookUpDrawer from '../Lookup/LookUpDrawer';
import LookUpCreateModal from '../LookUpCreateModal';

const LOOKUP_AND_CREATE = 'LOOKUP_AND_CREATE';
const CREATE_ONLY = 'CREATE_ONLY';
const LOOKUP_ONLY = 'LOOKUP_ONLY';


const {
  SERVICE_APPOINTMENT,
  PAYMENT_METHOD,
  PRODUCT,
} = SchemaModuleEntityTypeEnums;


interface Props {
  record: DbRecordEntityTransform,
  relation: DbRecordAssociationRecordsTransform,
  recordAssociationReducer: IRecordAssociationsReducer,
  schemaType?: SchemaTypeEntity,
  hidden?: string[],
  userReducer: any,
  schemaReducer: SchemaReducerState,
  getSchema: any,
  initializeForm: any,
  getAssociations: any,
  getRecordById: any,
  getUsers: any,
  getPipelines: any
  isCreateHidden?: boolean
  customActionOverride?: boolean
}

interface State {
  uuid: string,
  createContactVisible: boolean,
  schema: any,
  excludeFromCreate: string | undefined,
  associatingRecordId: string | undefined,
  createBroadbandVisible: boolean,
  swapCustomerDeviceOntVisible: boolean
}


class ListActionMenu extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      uuid: uuidv4(),
      createContactVisible: false,
      schema: {},
      excludeFromCreate: undefined,
      associatingRecordId: undefined,
      createBroadbandVisible: false,
      swapCustomerDeviceOntVisible: false,
    }
  }

  private async initializeCreateForm() {
    const { initializeForm, getSchema, relation, record, getUsers, getPipelines, schemaType } = this.props;

    getUsers();

    getSchema({ schemaId: relation?.schema?.id }, (result: SchemaEntity) => {

      getPipelines({ schema: result });

      if(record.entity === 'CrmModule:Account' && result.entityName === 'Contact') {

        this.setState({
          schema: result,
          createContactVisible: true,
          excludeFromCreate: 'Account',
          associatingRecordId: record.id,
        })

      } else if(record.entity === 'CrmModule:Address' && result.entityName === 'Contact') {

        this.setState({
          schema: result,
          createContactVisible: true,
          excludeFromCreate: 'Premise',
          associatingRecordId: record.id,
        })

      } else if(record.entity === 'OrderModule:OrderItem' && result.entityName === 'CustomerDeviceOnt') {

        this.setState({
          schema: result,
          createBroadbandVisible: true,
          associatingRecordId: record.id,
        })

      } else {

        initializeForm({
          formUUID: this.state.uuid,
          title: `Create ${relation?.schema?.entityName}`,
          showFormModal: true,
          isCreateReq: true,
          schema: result,
          selected: null,
          recordType: schemaType?.name,
          sections: [
            {
              name: result.name,
              schema: result,
              associations: [ { recordId: record.id, title: record.title, recordNumber: record.recordNumber } ],
            },
          ],
          modified: [
            {
              schemaId: relation?.schema?.id,
              associations: [
                {
                  recordId: record.id,
                },
              ],
            },
          ],
        });
      }

    });
  }

  private renderActions() {
    // Render diff actions based on the record , related record
    const { relation, record, userReducer } = this.props;

    // when there is an association for ONE_TO_ONE and there are more than one records
    // hide the actions.
    if(relation?.schemaAssociation?.type === SchemaAssociationCardinalityTypes.ONE_TO_ONE) {
      const entityName = relation?.schema?.entityName ? relation?.schema?.entityName : '';
      // exclude service appointments
      if(relation.dbRecords && relation.dbRecords.length > 0 && ![
        'ServiceAppointment',
        'Product',
      ].includes(entityName) && [
        'OrderItem',
        'WorkOrder',
      ].includes(getModuleAndEntityNameFromRecord(record).entityName)) {
        if([ 'OrderItem__CustomerDeviceOnt' ].includes(relation.schemaAssociation.label as string)) {
          return <Button
            disabled={relation ? !canUserDeleteRecord(userReducer, relation?.schema, record) : false}
            onClick={() => this.setState({ swapCustomerDeviceOntVisible: true })}>swap</Button>
        } else {
          return;
        }
      }
    }

    if(relation?.schemaAssociation?.relationType === RelationTypeEnum.PARENT) {
      return this.renderChildActions();
    }

    if(relation?.schemaAssociation?.relationType === RelationTypeEnum.CHILD) {
      return this.renderParentActions();
    }
  }

  private renderParentActions() {
    const { userReducer, record, relation, hidden, customActionOverride } = this.props;

    if(customActionOverride) {
      <LookUpCreateModal record={record} relation={relation} />
    }

    switch (relation?.schemaAssociation?.parentActions) {
      case LOOKUP_AND_CREATE:
        return (
          <Dropdown
            trigger={[ 'click' ]}
            overlay={(
              <Menu className="list-action-menu">
                <Menu.Item
                  disabled={!canUserCreateRecord(userReducer, relation.schema)}
                  onClick={() => this.initializeCreateForm()}
                >
                  Create
                </Menu.Item>
                <Menu.Item className="list-action-menu-item">
                  <LookUpDrawer record={record} relation={relation}/>
                </Menu.Item>
              </Menu>
            )}>
            <Button icon={<DownOutlined/>}/>
          </Dropdown>
        )
      case LOOKUP_ONLY:
        if(relation?.schemaAssociation?.label === 'Order__OrderItem') {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <ProductSelector record={record} relation={relation}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>
          )
        } else if(relation?.schemaAssociation?.label === 'OrderItem__Product') {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item
                    disabled={!canUserCreateRecord(userReducer, relation.schema)}
                    onClick={() => history.push(`/OrderModule/OrderItem/${record?.id}/product-amendment`)}
                  >
                    Replace Product
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>
          )

        } else if(relation?.schemaAssociation?.label === 'PriceBook__Product') {

          return (

            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <LookUpDrawer record={record} relation={relation} hidden={hidden}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>
          )

        } else if(relation?.schemaAssociation?.label === 'Feature__Product') {

          return (

            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <LookUpDrawer record={record} relation={relation} hidden={hidden}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>

          );

        } else if(relation?.schema?.entityName === PRODUCT) {

          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <PriceBookProductSelector record={record} relation={relation}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>

          )
        } else {

          if(customActionOverride) {
            return <LookUpCreateModal record={record} relation={relation} />
          } else {

            return (

              <Dropdown
                trigger={[ 'click' ]}
                overlay={(
                  <Menu className="list-action-menu">
                    <Menu.Item className="list-action-menu-item">
                      <LookUpDrawer record={record} relation={relation} hidden={hidden}/>
                    </Menu.Item>
                  </Menu>
                )}
              >
                <Button icon={<DownOutlined/>}/>
              </Dropdown>

            );
          }

        }
      case CREATE_ONLY:

        if(relation?.schemaAssociation?.label === 'Order__SplitOrder') {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <SplitOrder record={record}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>

          );
        } else if(relation?.schemaAssociation?.label === 'Order__Invoice') {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item
                    disabled={!record.stage?.isSuccess}
                    onClick={() => history.push(`/OrderModule/Order/${record?.id}/activate`)}
                  >
                    Create Invoice
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>

          )
        } else if(relation?.schema?.entityName === PAYMENT_METHOD) {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <PaymentMethodForm record={record}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>
          )
        } else if(relation?.schemaAssociation?.label === 'Order__WorkOrder') {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <GenerateWorkOrder record={record}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>

          )
        } else if(relation?.schema?.entityName === SERVICE_APPOINTMENT) {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item className="list-action-menu-item">
                    <BookingModal record={record} relation={relation} hidden={hidden}/>
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>
          );
        } else {
          return (
            <Dropdown
              trigger={[ 'click' ]}
              overlay={(
                <Menu className="list-action-menu">
                  <Menu.Item
                    disabled={!canUserCreateRecord(userReducer, relation.schema)}
                    onClick={() => this.initializeCreateForm()}
                  >
                    Create New
                  </Menu.Item>
                </Menu>
              )}
            >
              <Button icon={<DownOutlined/>}/>
            </Dropdown>
          );
        }
      default:
        return <div/>;
    }
  }

  private renderChildActions() {
    const { userReducer, record, relation, hidden } = this.props;
    const { schemaAssociation } = relation;

    switch (schemaAssociation.childActions) {
      case LOOKUP_AND_CREATE:
        return (
          <Dropdown
            trigger={[ 'click' ]}
            overlay={(
              <Menu className="list-action-menu">
                <Menu.Item
                  disabled={!canUserCreateRecord(userReducer, relation.schema)}
                  onClick={() => this.initializeCreateForm()}
                >
                  Create New
                </Menu.Item>
                <Menu.Item className="list-action-menu-item">
                  <LookUpDrawer record={record} relation={relation}/>
                </Menu.Item>
              </Menu>
            )}>
            <Button icon={<DownOutlined/>}/>
          </Dropdown>
        )
      case LOOKUP_ONLY:
        return (
          <Dropdown
            trigger={[ 'click' ]}
            overlay={(
              <Menu className="list-action-menu">
                <Menu.Item className="list-action-menu-item">
                  <LookUpDrawer record={record} relation={relation} hidden={hidden}/>
                </Menu.Item>
              </Menu>
            )}
          >
            <Button icon={<DownOutlined/>}/>
          </Dropdown>
        );
      case CREATE_ONLY:
        return (
          <Dropdown
            trigger={[ 'click' ]}
            overlay={(
              <Menu className="list-action-menu">
                <Menu.Item
                  disabled={!canUserCreateRecord(userReducer, relation.schema)}
                  onClick={() => this.initializeCreateForm()}
                >
                  Create New
                </Menu.Item>
              </Menu>
            )}
          >
            <Button icon={<DownOutlined/>}/>
          </Dropdown>
        );
      default:
        return <div/>;
    }
  }

  private handleFormSubmit(params: { event: string, res: any }) {
    switch (params.event) {

      case CREATE_DB_RECORD_REQUEST:
        this.fetchAssociations();
        break;

      case UPDATE_DB_RECORD_BY_ID_REQUEST:
        this.fetchAssociations();
        break;
    }
  }

  private fetchAssociations() {
    const { getAssociations, record, relation, schemaReducer, getRecordById } = this.props;
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
      return <div>data fetched</div>;
    }
  }


  render() {
    const { record, relation } = this.props;
    return (
      <>
        <CreateContactModal associatingRecordId={this.state.associatingRecordId}
                            excludeFromCreate={this.state.excludeFromCreate} visible={this.state.createContactVisible}
                            schema={this.state.schema} passDataToParent={(e: any) => {
          this.setState({ createContactVisible: e })
        }}/>
        {relation !== undefined ?
          <SwapCustomerDeviceOnt
            record={record}
            relatedRecord={relation.dbRecords}
            swapCustomerDeviceOntVisible={this.state.swapCustomerDeviceOntVisible}
            passDataToParent={(e: any) => {
              this.setState({ swapCustomerDeviceOntVisible: e })
            }}
            relation={relation}/>
          :
          <></>
        }
        <ActivateCustomerDeviceOnt
          relation={relation}
          record={record}
          schema={this.state.schema}
          passDataToParent={(e: any) => {
            this.setState({ createBroadbandVisible: e })
          }}
          visible={this.state.createBroadbandVisible}
          associatingRecordId={this.state.associatingRecordId}/>

        <OdinFormModal
          formUUID={this.state.uuid}
          onSubmitEvent={(params: { event: string, res: any }) => this.handleFormSubmit(params)}/>

        <div style={{ display: 'flex' }}>
          {this.renderActions()}
        </div>
      </>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  getSchema: (payload: ISchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
});


// @ts-ignore
export default connect(mapState, mapDispatch)(ListActionMenu);
