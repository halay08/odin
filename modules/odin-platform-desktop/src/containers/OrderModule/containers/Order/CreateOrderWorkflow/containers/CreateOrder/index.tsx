import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import React from 'react';
import { connect } from 'react-redux';
import EmbeddedForm from '../../../../../../../core/records/components/Forms/EmbeddedForm';
import LookUpCreate from '../../../../../../../core/records/components/LookUpCreate';
import { createRecordsRequest, updateRecordByIdRequest } from '../../../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../../../core/records/store/reducer';
import StepView from '../../../../../../../shared/components/StepView';
import { changeStepNumber, IStepViewChangeStepNumber, IStepViewValidation, setStepValidationArray } from '../../../../../../../shared/components/StepView/store/actions';
import { StepViewReducerState } from '../../../../../../../shared/components/StepView/store/reducer';
import { v4 as uuidv4 } from 'uuid'
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../../../shared/utilities/schemaHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaReducerState } from '../../../../../../../core/schemas/store/reducer';
import { getPremiseByUdprnAndUmprnRequest } from '../../../../../../CrmModule/containers/Premise/store/actions';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { FormReducer } from '../../../../../../../core/records/components/Forms/store/reducer';
import CreateOrderOffer from './containers/CreateOrderOffer';
import { Descriptions, Drawer, Input, Space, Table } from 'antd';
import { httpPost } from '../../../../../../../shared/http/requests';
import { displayMessage } from '../../../../../../../shared/system/messages/store/reducers';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import moment from 'moment';
import { WorkflowReducer } from '../../../../../../../core/workflow/store/reducer';
import { createOrderVisible, IOrderCheckout, orderCheckoutRequest, updateOrderWorkflow } from '../../../../../../../core/workflow/store/actions';
import { getRecordFromShortListById } from '../../../../../../../shared/utilities/recordHelpers';
import AssociationDataTable from '../../../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../../../../../core/recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../../../core/schemas/store/actions';


interface Props {
  createOrderVisible: any,
  recordReducer: IRecordReducer,
  stepViewReducer: StepViewReducerState,
  schemaReducer: SchemaReducerState,
  workflowReducer: WorkflowReducer
  getPremiseByUdprnAndUmprn: any,
  createRecord: any,
  recordFormReducer: FormReducer,
  alertMessage: Function,  
  setValidationData: (params: IStepViewValidation[]) => void
  changeStep: (params: IStepViewChangeStepNumber) => void,
  getAssociations: (params: IGetRecordAssociations) => void,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: (params: ISchemaByModuleAndEntity) => void,
  updateRecord: any
  updateOrderWorkflow: any,
  orderCheckout: (params: IOrderCheckout, cb: any) => void
}

interface State {
  selectedPremiseItem: any,
  createdAddressId: string | undefined,
  createdContactId: string | undefined,
  paymentMethodForm: {
    accountNumber: string | undefined,
    branchCode: string | undefined
  },
  createdPaymenthMethodId: string | undefined,
  isEdit: boolean,
}
const uuid = uuidv4();
const { CRM_MODULE } = SchemaModuleTypeEnums;
const { ORDER, ADDRESS, CONTACT } = SchemaModuleEntityTypeEnums;

class CreateOrderModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = this.getInitialState();
    this.getInitialData();
  }

  getInitialData() {
    const { schemaReducer, getSchema } = this.props;
    let contactSchema = getSchemaFromShortListByModuleAndEntity(
      schemaReducer.shortList,
      CRM_MODULE,
      CONTACT,
    );
    if(contactSchema === undefined) {
      getSchema({moduleName: CRM_MODULE, entityName: CONTACT})
    }
  }

  getInitialState = () => ({
    selectedPremiseItem: undefined,
    createdAddressId: undefined,
    createdContactId: undefined,
    createdPaymenthMethodId: undefined,
    paymentMethodForm: {
      accountNumber: undefined,
      branchCode: undefined
    },
    isEdit: false
  })

  renderSteps() {
    const { stepViewReducer } = this.props;
    
    const stepsArray = [
      {
        name: 'Address',
        content: <LookUpCreate
          isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
          entityName={'Premise'}
          moduleName={CRM_MODULE}
          checkboxItemSelect={(e: any) => this.setState({ selectedPremiseItem: e })}/>,
          entityName: 'Premise',
      },
      {
        name: 'Contact',
        content: this.renderContactStep(),
        entityName: 'Contact',
      },
      {
        name: 'Select Offer',
        content: <CreateOrderOffer sendProductsToParent={(params: any) => this.selectProducts(params)} />,
        entityName: 'Offer',
      },
      {
        name: 'Payment method',
        content: <>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Password
              placeholder="bank account #"
              onChange={(e) => this.handlePaymentForm('accountNumber', e)}
              defaultValue={this.state.paymentMethodForm.accountNumber ? this.state.paymentMethodForm.accountNumber : ''}
              />
            <Input.Password
              placeholder="sort code"
              onChange={(e) => this.handlePaymentForm('branchCode', e)}
              defaultValue={this.state.paymentMethodForm.branchCode ? this.state.paymentMethodForm.branchCode : ''}
              />
          </Space>
        </>,
        entityName: 'PaymentMethod',
      },
      {
        name: 'Summary',
        content: this.renderSummaryStep(),
        entityName: 'Summary',
      },
    ];
    return stepsArray
  }

  renderContactStep() {
    const { stepViewReducer, schemaReducer, recordReducer } = this.props;
    let contactSchema = getSchemaFromShortListByModuleAndEntity(
      schemaReducer.shortList,
      CRM_MODULE,
      CONTACT,
    );
    return(
      <>
      {
        this.state.isEdit ? 
        <AssociationDataTable
          title={ADDRESS}
          record={getRecordFromShortListById(recordReducer.shortList, this.state.createdContactId)}
          moduleName={CRM_MODULE}
          entityName={ADDRESS}
          customActionOverride/> :
          <></>
      }
        <EmbeddedForm  isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
                        isCreateRecord 
                        moduleName={CRM_MODULE} 
                        entityName={CONTACT} 
                        formUUID={uuid} 
                        schema={contactSchema} 
                        record={this.state.isEdit ? getRecordFromShortListById(recordReducer.shortList, this.state.createdContactId) : undefined}/>
      </>
    )
  }

  renderSummaryStep() {
    const { recordReducer, recordAssociationReducer, workflowReducer } = this.props;

    const contactRecord = getRecordFromShortListById(recordReducer.shortList, this.state.createdContactId);
    const associationKey = `${contactRecord?.id}_${CONTACT}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    const addressRecord = associationObj?.[ADDRESS].dbRecords;
    const data = workflowReducer.Order.selectedProductItems.concat(workflowReducer.Order.selectedBaseProductItems);
    return(
      <>
        <Descriptions
          style={{ marginBottom: 14 }}
          size="small"
          layout="horizontal"
          column={1}
        >
          { addressRecord?.map((element: any, index: number) => {
            return (
              <Descriptions.Item label={'Address' + (index === 0 ? '' : index)}>
                {element?.properties.FullAddress}
              </Descriptions.Item>
            )
          }) }
          
        </Descriptions>
        <Descriptions
          style={{ marginBottom: 14 }}
          size="small"
          layout="horizontal"
          column={2}
        >
          <Descriptions.Item label={'Full Name'}>
            {contactRecord?.properties.FirstName + ' ' + contactRecord?.properties.LastName}
          </Descriptions.Item>
          <Descriptions.Item label={'Email'}>
            {contactRecord?.properties.EmailAddress}
          </Descriptions.Item>
        </Descriptions>
        <Table
          columns={[
            {
              dataIndex: 'Name',
              key: 'name',
              render: (text: any, record: any) => (
                record.properties.Name
              ),
            },
            {
              dataIndex: 'UnitPrice',
              key: 'unitPrice',
              render: (text: any, record: any) => (
                record.properties.UnitPrice
              ),
            }
          ]}
          dataSource={data}
          pagination={false}
          showHeader={false}
          expandable={{
            expandedRowRender: record => 
              <>
                {record.properties?.DiscountType ? <p style={{ margin: 0 }}><strong>Discount Type: </strong>{record.properties.DiscountType}</p> : <></>}
                {record.properties?.DiscountValue ? <p style={{ margin: 0 }}><strong>Discount Value: </strong>{record.properties.DiscountValue}</p> : <></>}
                {record.properties?.LegalTerms ? <p style={{ margin: 0 }}><strong>Legal Terms: </strong>{record.properties.LegalTerms}</p> : <></>}
              </>,
          }}
          summary={pageData => {
            let total = 0;
            pageData?.forEach(({ properties }) => {
              total += parseInt(properties?.UnitPrice) ;
            });

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}></Table.Summary.Cell>
                  <Table.Summary.Cell index={1}><strong>Total:</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>{total}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </>
    )
  }

  selectProducts(params: {selectedAddOnProducts: any, selectedBaseProductItems: any}) {
    if(params.selectedBaseProductItems.length) {
      this.setStepViewState(2, false);
    } else {
      this.setStepViewState(2, true);
    }
  }

  handlePaymentForm(prop: string, e: any) {
    const { stepViewReducer } = this.props;
    this.setState({ paymentMethodForm: { ...this.state.paymentMethodForm, [prop]: e.target.value } })
    if(this.state.paymentMethodForm.accountNumber !== undefined &&
      this.state.paymentMethodForm.branchCode !== undefined &&
      this.state.paymentMethodForm.accountNumber !== '' &&
      this.state.paymentMethodForm.branchCode !== '') {
      this.setStepViewState(stepViewReducer.currentStep, false);
    }
  }

  // Step number is a positive number 1 >=
  setStepViewState(stepNumber: number, isTrue: boolean) {

    const { setValidationData, stepViewReducer, changeStep } = this.props;
    let tempStepData = stepViewReducer.stepComponentsData;

    if(tempStepData[stepNumber]) {
      if(tempStepData[stepNumber-1]) tempStepData[stepNumber-1].isNextDisabled = true;
      tempStepData[stepNumber].isNextDisabled = isTrue;
      setValidationData(tempStepData);

      changeStep({ stepNumber });

    }

  }

  onNextButtonClick(params: any, cb: any) {
    const { schemaReducer, getPremiseByUdprnAndUmprn, createRecord, recordFormReducer, getAssociations, updateRecord } = this.props;
    switch(params.entityName) {
      case 'Premise':
        const addressSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, ADDRESS);
        getPremiseByUdprnAndUmprn(
          { udprn: this.state.selectedPremiseItem.properties.UDPRN, umprn: this.state.selectedPremiseItem.properties.UMPRN },
          (res: any) => {
            if(addressSchema) {
              const newAddress = {
                entity: `${addressSchema.moduleName}:${addressSchema.entityName}`,
                schemaId: addressSchema.id,
                title: res.title,
                properties: {
                  'Type': 'BILLING',
                  'AddressLine1': res.properties.AddressLine1,
                  'AddressLine2': res.properties.AddressLine2,
                  'AddressLine3': res.properties.AddressLine3,
                  'City': 'NA',
                  'PostalCode': res.properties.PostalCode,
                  'CountryCode': 'GB',
                  'SalesStatus': res.status ? res.status : 'REGISTER_INTEREST',
                  'UDPRN': res.properties.UDPRN,
                  'UMPRN': res.properties.UMPRN,
                  'AvailableSeason': null,
                  'AvailableYear': null,
                  'FullAddress': res.properties.FullAddress,
                  'Premise': res.properties.Premise,
                  'PostTown': res.properties.PostTown,
                  'Classification': res.ab_plus_class_1
                },
              }
              createRecord({
                schema: addressSchema,
                upsert: false,
                createUpdate: [ newAddress ],
              }, (res: DbRecordEntityTransform) => {
                if(res) {
                  this.setState({
                    createdAddressId: res.id,
                  })
                  cb(true);
                  this.setStepViewState(1, true);
                } else {
                  cb(false);
                }
              })
            } else {
              cb(false);
            }
          },
        )  
      break
      case 'Contact':
        const contactSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, CONTACT);
        let modified: any = []
        modified = recordFormReducer.modified;
        if(modified[0]) {
          modified[0].associations = [
            { recordId: this.state.createdAddressId },
          ]
        }
        if(this.state.isEdit) {
          if(recordFormReducer.modified[0]) {
            updateRecord({
              schema: contactSchema,
              recordId: this.state.createdContactId,
              createUpdate: recordFormReducer.modified[0],
            }, (res: DbRecordEntityTransform) => {
              cb(true);
              this.setStepViewState(2, true);
            });
          } else {
            cb(true);
            this.setStepViewState(2, true);
          }
          if(contactSchema !== undefined && this.state.createdContactId !== undefined) {
            getAssociations({
              recordId: this.state.createdContactId,
              key: CONTACT,
              schema: contactSchema,
              entities: [ ADDRESS ],
            });
          }
        } else {
          createRecord({
            schema: contactSchema,
            upsert: recordFormReducer.upsert,
            createUpdate: modified,
          }, (res: DbRecordEntityTransform) => {
            if(res) {
              this.setState({
                createdContactId: res.id,
              });
              if(contactSchema !== undefined) {
                getAssociations({
                  recordId: res.id,
                  key: CONTACT,
                  schema: contactSchema,
                  entities: [ ADDRESS ],
                });
              }
              cb(true);
              this.setStepViewState(2, true);
            } else {
              cb(false);
            }
          });
        }
        break;
      case 'Offer':
        this.setStepViewState(3, false);
        cb(true);
      break
      case 'PaymentMethod': 
        this.paymentMethodSubmit((callback: any) => {
          if(callback) {
            this.setStepViewState(4, false);
            this.enablePreviousButton(4)
            cb(true);
          } else {
            cb(false);
          }
        })
      break
    }
  }

  enablePreviousButton(stepNumber: number) {
    const { setValidationData, stepViewReducer } = this.props;
    let tempStepData = stepViewReducer.stepComponentsData;

    if(tempStepData[stepNumber]) {
      tempStepData[stepNumber].isPreviousDisabled = false;
      setValidationData(tempStepData);

    }  
  }

  paymentMethodSubmit = async (cb: any) => {
    const { alertMessage } = this.props;
    await httpPost(`BillingModule/v1.0/contact/${this.state.createdContactId}/payment-methods`, {
      identityName: 'GOCARDLESS',
      bankDetails: {
        accountNumber: this.state.paymentMethodForm.accountNumber,
        branchCode: this.state.paymentMethodForm.branchCode,
      },
      authorizedDirectDebit: true,
    }).then(({ data }) => {
      if(data.data) {
        this.setState({
          createdPaymenthMethodId: data.data.id
        })
        cb(true);
        if(moment().utc().isAfter(data.data.createdAt)) {
          alertMessage({
            body: `nothing to do the customers mandate is ${getProperty(
              data.data,
              'Status',
            )}`, type: 'success',
          });
        } else {
          alertMessage({ body: 'A new mandate was created', type: 'success' });
        }
      }
    }).catch(err => {
      cb(false);
      alertMessage({ body: err.message, type: 'error' })
    });
  }

  finishOrderCreate(cb: any){
    const { orderCheckout, workflowReducer } = this.props;
    let tempArr: any = [];
    const data = workflowReducer[ORDER].selectedProductItems.concat(workflowReducer[ORDER].selectedBaseProductItems);
    data.forEach((el: any) => {
      tempArr.push({recordId: el.id})
    })
    const body: IOrderCheckout = {
      addressId: this.state.createdAddressId,
      contactId: this.state.createdContactId,
      products: tempArr
    }

    orderCheckout(body, (res: any) => {
      cb(true)
      this.resetModalData();
    })
    
    
  }

  resetModalData() {

    const { setValidationData, stepViewReducer, createOrderVisible, updateOrderWorkflow } = this.props;
    updateOrderWorkflow({selectedProductItems: []})
    createOrderVisible();
    const tempArr = stepViewReducer.stepComponentsData;
    this.setState(this.getInitialState());
    this.setStepViewState(0, true);
    setValidationData(tempArr);
  }

  onPrevButtonClick(params: any, cb: any) {
    switch(params.entityName) {
      case 'Offer':
        cb(true);
        this.setStepViewState(1, false);
      break
      case 'PaymentMethod': 
        this.setStepViewState(2, false)
        this.enablePreviousButton(2);
        cb(true);
      break
      case 'Summary':
        this.setState({
          isEdit: true
        })
        this.enablePreviousButton(3);
        cb(true);
      break
    }
  }
 

  render() {
    const { workflowReducer } = this.props;
    return (
      <>
        <Drawer
          className="custom-drawer"
          title={`Create Order`}
          visible={workflowReducer[ORDER].isCreateOrderVisible}
          onClose={(e) => {
            this.resetModalData()
          }}
          width={1000}
        >
          <StepView
            isLookupCreate
            onNextActionClick={(params: any, cb: any) => this.onNextButtonClick(params, cb)}
            onPrevActionClick={((params: any, cb: any) => this.onPrevButtonClick(params, cb))}
            onSubmit={(cb: any) => {
              this.finishOrderCreate(cb)
            }}
            steps={this.renderSteps()}
          />
        </Drawer>
      </>
    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  stepViewReducer: state.stepViewReducer,
  schemaReducer: state.schemaReducer,
  recordFormReducer: state.recordFormReducer,
  workflowReducer: state.workflowReducer,
  recordAssociationReducer: state.recordAssociationReducer
});

const mapDispatch = (dispatch: any) => ({
  createOrderVisible: () => dispatch(createOrderVisible()),
  setValidationData: (params: any) => dispatch(setStepValidationArray(params)),
  getPremiseByUdprnAndUmprn: (params: any, cb: () => {}) => dispatch(getPremiseByUdprnAndUmprnRequest(params, cb)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  changeStep: (params: IStepViewChangeStepNumber) => dispatch(changeStepNumber(params)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  updateRecord: (params: any, cb: any) => dispatch(updateRecordByIdRequest(params, cb)),
  updateOrderWorkflow: (params: any) => dispatch(updateOrderWorkflow(params)),
  orderCheckout: (params: IOrderCheckout, cb: any) => dispatch(orderCheckoutRequest(params, cb))
});

// @ts-ignore
export default connect(mapState, mapDispatch)(CreateOrderModal);
