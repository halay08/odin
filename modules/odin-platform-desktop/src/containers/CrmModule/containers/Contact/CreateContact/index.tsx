import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Input, Space } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import EmbeddedForm from '../../../../../core/records/components/Forms/EmbeddedForm';
import LookUpCreate from '../../../../../core/records/components/LookUpCreate';
import { createRecordsRequest } from '../../../../../core/records/store/actions';
import { updateOrCreateRecordAssociations } from '../../../../../core/recordsAssociations/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import StepView from '../../../../../shared/components/StepView';
import {
  changeStepNumber,
  IStepViewChangeStepNumber,
  IStepViewValidation,
  setStepValidationArray,
} from '../../../../../shared/components/StepView/store/actions';
import { httpPost } from '../../../../../shared/http/requests';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import history from '../../../../../shared/utilities/browserHisory';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import { getPremiseByUdprnAndUmprnRequest } from '../../Premise/store/actions';


interface Props {
  schema: SchemaEntity | undefined,
  visible: boolean,
  passDataToParent: any,
  stepViewReducer: any,
  recordFormReducer: any,
  createRecord: any,
  recordReducer: any,
  createAssociations: any,
  alertMessage: any,
  getPremiseByUdprnAndUmprn: any,
  schemaReducer: SchemaReducerState,
  excludeFromCreate?: string,
  associatingRecordId?: string,
  setValidationData: (params: IStepViewValidation[]) => void
  changeStep: (params: IStepViewChangeStepNumber) => void
}

interface State {
  createContactVisible: boolean,
  createdContactId: string,
  selectedAccountItem: any,
  selectedPremiseItem: any,
  paymentMethodForm: {
    accountNumber: string,
    branchCode: string
  },
  schemaAssociation: any,
  loadPremise: boolean
}

const uuid = uuidv4();

class CreateContactModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      createContactVisible: false,
      createdContactId: '',
      selectedAccountItem: {},
      selectedPremiseItem: {},
      paymentMethodForm: {
        accountNumber: '',
        branchCode: '',
      },
      schemaAssociation: undefined,
      loadPremise: false,
    }
  }

  // Step number is a positive number 1 >=
  setStepViewState(stepNumber: number, isTrue: boolean) {

    const { setValidationData, stepViewReducer, changeStep } = this.props;
    let tempStepData = stepViewReducer.stepComponentsData;

    if(tempStepData[stepNumber]) {

      tempStepData[stepNumber].isNextDisabled = isTrue;
      setValidationData(tempStepData);

      changeStep({ stepNumber });

    }

  }

  onNextButtonClick(params: any, cb: any) {
    const { recordFormReducer, createRecord, schema, createAssociations, getPremiseByUdprnAndUmprn, schemaReducer, associatingRecordId } = this.props;
    switch (params.entityName) {
      case 'Contact':
        let modified: any = []
        if(associatingRecordId) {
          modified = recordFormReducer.modified;
          modified[0].associations = [
            { recordId: associatingRecordId },
          ]
          this.setState({
            loadPremise: true,
          })
        } else {
          modified = [ ...recordFormReducer.payload, ...recordFormReducer.modified ]
        }
        createRecord({
          schema: schema,
          upsert: recordFormReducer.upsert,
          createUpdate: modified,
        }, (res: DbRecordEntityTransform) => {
          if(res) {
            this.setState({
              createdContactId: res.id,
            })
            cb(true);
            this.setStepViewState(1, true);
          } else {
            cb(false);
          }
        });
        break;
      case 'Account':
        createAssociations({
          recordId: this.state.createdContactId,
          schema: this.state.schemaAssociation?.schema,
          schemaAssociation: this.state.schemaAssociation?.schemaAssociation,
          createUpdate: [
            { recordId: this.state.selectedAccountItem?.id },
            { recordId: associatingRecordId },
          ],
        }, (res: any) => {
          if(res) {
            cb(true);
            this.setStepViewState(2, true);
            this.setState({
              loadPremise: true,
            })
          } else {
            cb(false);
          }
        });
        break
      case 'Premise':
        const addressSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, 'CrmModule', 'Address');

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
                  'SalesStatus': 'REGISTER_INTEREST',
                  'UDPRN': res.properties.UDPRN,
                  'UMPRN': res.properties.UMPRN,
                  'AvailableSeason': null,
                  'AvailableYear': null,
                  'FullAddress': res.properties.FullAddress,
                  'Premise': res.properties.Premise,
                  'PostTown': res.properties.PostTown,
                },
                associations: [
                  { recordId: this.state.selectedAccountItem?.id ? this.state.selectedAccountItem?.id : associatingRecordId },
                  { recordId: this.state.createdContactId },
                ],
              }
              createRecord({
                schema: addressSchema,
                upsert: false,
                createUpdate: [ newAddress ],
              }, (res: DbRecordEntityTransform) => {
                if(res) {
                  cb(true);
                  this.setStepViewState(3, true);
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

  finishContactCreate = async (cb: any) => {
    const { alertMessage, passDataToParent } = this.props;
    await httpPost(`BillingModule/v1.0/contact/${this.state.createdContactId}/payment-methods`, {
      identityName: 'GOCARDLESS',
      bankDetails: {
        accountNumber: this.state.paymentMethodForm.accountNumber,
        branchCode: this.state.paymentMethodForm.branchCode,
      },
      authorizedDirectDebit: true,
    }).then(({ data }) => {

      if(data.data) {
        history.push(`/CrmModule/Contact/${this.state.createdContactId}`);
        cb(true);
        passDataToParent(false);
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

  skipStep() {

    const { stepViewReducer, setValidationData, alertMessage, changeStep } = this.props;
    const tempArr = stepViewReducer.stepComponentsData;

    tempArr[stepViewReducer.currentStep + 1].isNextDisabled = true;
    setValidationData(tempArr);

    changeStep({ stepNumber: stepViewReducer.currentStep + 1 })

    alertMessage({ body: 'record association created', type: 'success' });
    this.setState({
      loadPremise: true,
    })
  }

  renderSteps() {
    const { stepViewReducer, recordReducer, schema, excludeFromCreate, associatingRecordId } = this.props;
    const stepsArray = [
      {
        name: 'Contact',
        content: <EmbeddedForm
          isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
          isCreateRecord moduleName={'CrmModule'} entityName={'Contact'} formUUID={uuid} schema={schema}/>,
        entityName: 'Contact',
      },
      {
        name: 'Account',
        content: this.state.createdContactId ?
          <LookUpCreate
            isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
            record={recordReducer.shortList[this.state.createdContactId]}
            entityName={'Account'}
            moduleName={'CrmModule'}
            checkboxItemSelect={(e: any) => this.setState({ selectedAccountItem: e })}
            setSchemaAssociationData={(e: any) => this.setState({ schemaAssociation: e.schemaAssociation })}
            associations={[
              { recordId: this.state.createdContactId },
              { recordId: associatingRecordId ? associatingRecordId : '' },
            ]}
            skipAssociationSelect={(e: any) => {
              this.skipStep();
              this.setState({ selectedAccountItem: e })
            }}/>
          : <></>,
        entityName: 'Account',
      },
      {
        name: 'Address',
        content: this.state.loadPremise ?
          <LookUpCreate
            isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
            record={recordReducer.shortList[this.state.createdContactId]}
            entityName={'Premise'}
            moduleName={'CrmModule'}
            checkboxItemSelect={(e: any) => this.setState({ selectedPremiseItem: e })}
            setSchemaAssociationData={(e: any) => this.setState({ schemaAssociation: e.schemaAssociation })}/>
          : <></>,
        entityName: 'Premise',
      },
      {
        name: 'Payment method',
        content: <>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input.Password
              placeholder="bank account #"
              onChange={(e) => this.handlePaymentForm('accountNumber', e)}/>
            <Input.Password
              placeholder="sort code"
              onChange={(e) => this.handlePaymentForm('branchCode', e)}/>
          </Space>
        </>,
        entityName: '',
      },
    ];

    if(excludeFromCreate) {
      let tempArr: any = [];
      tempArr = stepsArray.filter(item => item.entityName !== excludeFromCreate);
      return tempArr;
    } else {
      return stepsArray
    }
  }

  resetModalData() {

    const { passDataToParent, setValidationData, stepViewReducer } = this.props;

    passDataToParent(false);
    const tempArr = stepViewReducer.stepComponentsData;

    this.setStepViewState(0, true);
    setValidationData(tempArr);
  }


  render() {

    let { visible, recordFormReducer } = this.props;

    return (
      <>
        <Modal className="cancel-appointment-modal"
               title="Create Contact"
               visible={visible && !recordFormReducer.showFormModal}
               footer={null}
               width={750}
               style={{ top: 20 }}
               onCancel={(e) => {
                 this.resetModalData()
               }}
               maskClosable={false}
        >
          <StepView
            isLookupCreate
            onNextActionClick={(params: any, cb: any) => this.onNextButtonClick(params, cb)}
            onSubmit={(cb: any) => {
              this.finishContactCreate(cb)
            }}
            previousDisabled
            steps={this.renderSteps()}
          />
        </Modal>
      </>
    )
  }
}

const mapState = (state: any) => ({
  stepViewReducer: state.stepViewReducer,
  recordFormReducer: state.recordFormReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  setValidationData: (params: IStepViewValidation[]) => dispatch(setStepValidationArray(params)),
  changeStep: (params: IStepViewChangeStepNumber) => dispatch(changeStepNumber(params)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  getPremiseByUdprnAndUmprn: (params: any, cb: () => {}) => dispatch(getPremiseByUdprnAndUmprnRequest(params, cb)),
});

// @ts-ignore
export default connect(mapState, mapDispatch)(CreateContactModal);
