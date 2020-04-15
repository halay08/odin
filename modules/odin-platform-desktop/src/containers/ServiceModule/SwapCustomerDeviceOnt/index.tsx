import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import EmbeddedForm from '../../../core/records/components/Forms/EmbeddedForm';
import { FormReducer } from '../../../core/records/components/Forms/store/reducer';
import { createRecordsRequest, getRecordByIdRequest, IGetRecordById } from '../../../core/records/store/actions';
import { IRecordReducer } from '../../../core/records/store/reducer';
import {
  deleteRecordAssociationById,
  getRecordAssociationsRequest,
  IDeleteRecordAssociation,
  IGetRecordAssociations,
  updateOrCreateRecordAssociations,
} from '../../../core/recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../core/schemas/store/reducer';
import StepView from '../../../shared/components/StepView';
import {
  changeStepNumber,
  IStepViewChangeStepNumber,
  IStepViewValidation,
  setStepValidationArray,
} from '../../../shared/components/StepView/store/actions';
import { httpPost } from '../../../shared/http/requests';
import { displayMessage } from '../../../shared/system/messages/store/reducers';
import { getRecordFromShortListById } from '../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../shared/utilities/schemaHelpers';


interface Props {
  passDataToParent: any,
  stepViewReducer: any,
  excludeFromCreate?: string,
  swapCustomerDeviceOntVisible: boolean,
  record: DbRecordEntityTransform,
  alertMessage: any,
  relatedRecord: DbRecordEntityTransform[],
  recordFormReducer: FormReducer,
  relation: DbRecordAssociationRecordsTransform,
  deleteRecordAssociation: any,
  createRecord: any,
  getAssociations: any,
  getRecordById: any,
  recordReducer: IRecordReducer,
  createAssociations: any,
  getSchema: any,
  schemaReducer: SchemaReducerState,
  setValidationData: (params: IStepViewValidation[]) => void
  changeStep: (params: IStepViewChangeStepNumber) => void
}

interface State {
  deactivateLoading: boolean,
  schema: SchemaEntity | undefined,
  activateLoading: boolean,
  checkStatusLoading: boolean,
  deleteAssociation: boolean,
  associatedRecordTitle: string | undefined,
  isOntTaken: boolean,
  errorRecordId: string | undefined
}

const uuid = uuidv4();

const { SERVICE_MODULE } = SchemaModuleTypeEnums;

const { CUSTOMER_DEVICE_ONT, CUSTOMER_DEVICE_ROUTER, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

class SwapCustomerDeviceOnt extends React.Component<Props, State> {


  constructor(props: Props) {
    super(props)
    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    deactivateLoading: false,
    schema: undefined,
    activateLoading: false,
    checkStatusLoading: false,
    deleteAssociation: false,
    associatedRecordTitle: '',
    isOntTaken: false,
    errorRecordId: undefined,
  })

  // Step number is a positive number 1 >=
  setStepViewState(stepNumber: number, isTrue: boolean) {
    const { setValidationData, stepViewReducer, changeStep } = this.props;
    let tempStepData = stepViewReducer.stepComponentsData;

    if(tempStepData[stepNumber - 1]) {

      tempStepData[stepNumber - 1].isNextDisabled = isTrue;
      setValidationData(tempStepData);

      changeStep({ stepNumber });

    }
  }

  onNextButtonClick = async (params: any, cb: any) => {
    const { record, recordFormReducer, createRecord, getAssociations, relatedRecord, getRecordById, createAssociations, relation } = this.props
    switch (params.entityName) {
      case 'Deactivate':
        cb(true);
        this.setStepViewState(1, true);
        this.setState({
          associatedRecordTitle: relatedRecord?.[0].title,
        })
        break
      case 'DeleteAssociation':
        cb(true);
        this.setStepViewState(2, true);
        break
      case 'ONT':
        let modified: any = []
        this.props.getSchema(
          { moduleName: SERVICE_MODULE, entityName: CUSTOMER_DEVICE_ROUTER },
          (result: SchemaEntity) => {
            // get OrederItem associations
            getAssociations({
              recordId: record.id,
              key: CUSTOMER_DEVICE_ROUTER,
              schema: result,
              entities: [ CUSTOMER_DEVICE_ROUTER ],
            }, (res: any) => {
              if(res.results[CUSTOMER_DEVICE_ROUTER].dbRecords) {
                modified = recordFormReducer.modified;
                modified[0].associations = [
                  { recordId: record.id },
                ]
                res.results[CUSTOMER_DEVICE_ROUTER].dbRecords.forEach((el: any) => {
                  modified[0].associations.push({ recordId: el.id })
                })
              } else {
                modified = recordFormReducer.modified;
                modified[0].associations = [
                  { recordId: record.id },
                ]
              }
              // create New ONT
              createRecord({
                schema: relation.schema,
                upsert: recordFormReducer.upsert,
                createUpdate: modified,
              }, (res: DbRecordEntityTransform) => {
                if(res) {
                  // check if ONT exists
                  if(res.statusCode && res.statusCode === 409) {
                    // check if ONT is assoicated to any OrderItem
                    getAssociations({
                      recordId: res.data.id,
                      key: CUSTOMER_DEVICE_ONT,
                      schema: relation.schema,
                      entities: [ ORDER_ITEM ],
                    }, (associations: any) => {
                      if(associations.results?.[ORDER_ITEM]?.dbRecords) {
                        // if ONT is associated to OrderItem fetch ONT and let user resolve conflict
                        getRecordById({ schema: relation.schema, recordId: res.data.id });
                        this.setState({
                          isOntTaken: true,
                          errorRecordId: res.data.id,
                        });
                        this.setStepViewState(2, true);
                        cb(false);
                      } else {
                        // if ONT is not associated to any OrderItem update ONT with associations to OrderItem
                        createAssociations({
                          recordId: res.data.id,
                          schema: relation.schema,
                          schemaAssociation: relation.schemaAssociation,
                          createUpdate: [
                            { recordId: record.id },
                          ],
                        }, (res: any) => {
                          if(res) {
                            cb(true);
                            this.setStepViewState(2, true);
                          } else {
                            cb(false);
                          }
                        });
                      }
                    })
                  } else {
                    cb(true);
                    this.setStepViewState(3, true);
                  }
                } else {
                  cb(false);
                }
              });
            });
          },
        )
        break
      case 'Activate':
        cb(true);
        this.setStepViewState(4, true);
        break
    }
  }

  private deleteRecordAssociation() {
    const { relatedRecord, deleteRecordAssociation, relation } = this.props;
    const { schemaAssociation } = relation;
    this.setState({
      deleteAssociation: true,
    });
    deleteRecordAssociation({
      schema: relation.schema,
      schemaAssociation,
      dbRecordAssociationId: relatedRecord && relatedRecord[0]?.dbRecordAssociation ? relatedRecord[0]?.dbRecordAssociation.id : null,
    }, () => {
      this.setStepViewState(1, false);
      this.setState({
        deleteAssociation: false,
      });
    });
  }

  deactivateOnt = async () => {
    const { record, alertMessage } = this.props;

    this.setState({
      deactivateLoading: true,
    });

    await httpPost(
      `ServiceModule/v1.0/network/adtranont/data/${record.id}/deactivate`,
      {},
    ).then(res => {
      console.log(res);
      alertMessage({ body: 'deactivate successful', type: 'success' });
      this.setState({
        deactivateLoading: false,
      })
      this.setStepViewState(0, false);
    }).catch(err => {
      this.setState({
        deactivateLoading: false,
      })
      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
    });
  };

  activateOnt = async () => {
    const { record, alertMessage } = this.props;
    this.setState({
      activateLoading: true,
    });
    await httpPost(
      `ServiceModule/v1.0/network/adtranont/data/${record.id}/activate`,
      {},
    ).then(res => {
      alertMessage({ body: 'provision successful', type: 'success' });
      this.setStepViewState(3, false);
      this.setState({
        activateLoading: false,
      });
    }).catch(err => {
      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      this.setState({
        activateLoading: false,
      });
    });
  }

  checkStatus = async () => {
    const { record, alertMessage } = this.props;
    this.setState({
      checkStatusLoading: true,
    });
    await httpPost(
      `ServiceModule/v1.0/network/adtranont/data/${record.id}/check`,
      {},
    ).then(res => {
      alertMessage({ body: 'check successful', type: 'success' });
      this.setStepViewState(4, false);
      this.setState({
        checkStatusLoading: false,
      });
    }).catch(err => {
      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      this.setState({
        checkStatusLoading: false,
      });
    });
  }

  renderSteps() {
    const { excludeFromCreate, record, stepViewReducer, relation, schemaReducer } = this.props;
    const ontSchema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, relation.schema.id);
    const stepsArray = [
      {
        name: 'Deactivate ONT',
        content: <div>
          <p>{'Please confirm you would like to deactivate the ONT'}</p>
          <p>Item: {record?.title}</p>
          <Button onClick={(e) => this.deactivateOnt()} loading={this.state.deactivateLoading}
                  disabled={!stepViewReducer.stepComponentsData[0]?.isNextDisabled}>Deactivate</Button>
        </div>,
        entityName: 'Deactivate',
      },
      {
        name: 'Delete Association',
        content: <div>
          <p>{'Please confirm you would like to delete the association'}</p>
          <p>Item: {this.state.associatedRecordTitle}</p>
          <Button onClick={(e) => this.deleteRecordAssociation()} loading={this.state.deleteAssociation}
                  disabled={!stepViewReducer.stepComponentsData[1]?.isNextDisabled}>Delete</Button>
        </div>,
        entityName: 'DeleteAssociation',
      },
      {
        name: 'Add ONT',
        content: !this.state.isOntTaken ? <EmbeddedForm
            isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
            isCreateRecord moduleName={SERVICE_MODULE} entityName={CUSTOMER_DEVICE_ONT} formUUID={uuid}
            schema={ontSchema}/> :
          this.ontAlredyExists(),
        entityName: 'ONT',
      },
      {
        name: 'Activate',
        content: <div>
          <p>{'Please confirm you would like to activate the ONT'}</p>
          <p>Item: {record?.title}</p>
          <Button onClick={(e) => this.activateOnt()} loading={this.state.activateLoading}>Activate</Button>
        </div>,
        entityName: 'Activate',
      },
      {
        name: 'Check Status',
        content: <div>
          <p>{'Please confirm you would like check the status of the ONT'}</p>
          <p>Item: {record?.title}</p>
          <Button onClick={(e) => this.checkStatus()} loading={this.state.checkStatusLoading}>Check Status</Button>
        </div>,
        entityName: 'Status',
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

  ontAlredyExists() {
    const { recordReducer } = this.props;
    if(this.state.errorRecordId === undefined) return <></>;
    const record = getRecordFromShortListById(recordReducer.shortList, this.state.errorRecordId);
    return (
      <>
        <div>Conflict, record already exists with properties.</div>
        <div>Please solve confilcts in record below and try again.</div>
        {record ?
          <Link to={`/${SERVICE_MODULE}/${CUSTOMER_DEVICE_ONT}/${record?.id}`}>{record?.recordNumber}</Link> : <></>}
      </>
    )
  }

  resetModalData() {
    const { passDataToParent, setValidationData, stepViewReducer } = this.props;
    passDataToParent(false);

    const tempArr = stepViewReducer.stepComponentsData;
    this.setStepViewState(1, true);

    setValidationData(tempArr);
    this.setState(this.getInitialState());

  }

  finishOntSwap(cb: any) {
    cb(true)
  }

  render() {
    const { swapCustomerDeviceOntVisible, recordFormReducer } = this.props
    return (
      <>
        <Modal className="cancel-appointment-modal"
               title="Swap ONT Device"
               visible={swapCustomerDeviceOntVisible && !recordFormReducer.showFormModal}
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
              this.finishOntSwap(cb)
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
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  deleteRecordAssociation: (payload: IDeleteRecordAssociation, cb: any) => dispatch(deleteRecordAssociationById(
    payload,
    cb,
  )),
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
  setValidationData: (params: IStepViewValidation[]) => dispatch(setStepValidationArray(params)),
  changeStep: (params: IStepViewChangeStepNumber) => dispatch(changeStepNumber(params)),
});

// @ts-ignore
export default connect(mapState, mapDispatch)(SwapCustomerDeviceOnt);
