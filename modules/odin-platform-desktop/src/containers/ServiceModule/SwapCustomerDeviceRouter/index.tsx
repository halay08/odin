import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
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
import { closeSwapModal } from '../../../core/recordsAssociations/components/SwapModal/store/actions';
import { SwapModalReducer } from '../../../core/recordsAssociations/components/SwapModal/store/reducer';
import {
  deleteRecordAssociationById,
  getRecordAssociationsRequest,
  IDeleteRecordAssociation,
  IGetRecordAssociations,
  updateOrCreateRecordAssociations,
} from '../../../core/recordsAssociations/store/actions';
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
  stepViewReducer: any,
  alertMessage: any,
  recordFormReducer: FormReducer,
  deleteRecordAssociation: any,
  createRecord: any,
  getAssociations: any,
  recordReducer: IRecordReducer,
  createAssociations: any,
  schemaReducer: SchemaReducerState,
  swapModalReducer: SwapModalReducer,
  closeSwapModal: any,
  getRecordById: any,
  setValidationData: (params: IStepViewValidation[]) => void
  changeStep: (params: IStepViewChangeStepNumber) => void
}

interface State {
  deleteAssociation: boolean,
  isRouterTaken: boolean,
  errorRecordId: string | undefined,
  speedTest: boolean,
  newRecordId: string | undefined
}

const uuid = uuidv4();

const { SERVICE_MODULE } = SchemaModuleTypeEnums;

const { CUSTOMER_DEVICE_ROUTER, ORDER_ITEM } = SchemaModuleEntityTypeEnums;

class SwapCustomerDeviceRouter extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      deleteAssociation: false,
      isRouterTaken: false,
      errorRecordId: undefined,
      speedTest: false,
      newRecordId: undefined,
    }
  }


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
    const { createRecord, schemaReducer, swapModalReducer, recordFormReducer, getAssociations, getRecordById, createAssociations } = this.props;
    switch (params.entityName) {
      case 'DeleteAssociation':
        cb(true);
        this.setStepViewState(1, true);
        break
      case 'Router':
        const routerSchema = getSchemaFromShortListBySchemaId(
          schemaReducer.shortList,
          swapModalReducer.relation?.schema.id,
        );
        const modified = recordFormReducer.modified;
        const recordId = swapModalReducer.record?.id === undefined ? '' : swapModalReducer.record.id;
        modified[0].associations = [
          { recordId: recordId },
        ]
        // create New Router
        createRecord({
          schema: routerSchema,
          upsert: recordFormReducer.upsert,
          createUpdate: modified,
        }, (res: DbRecordEntityTransform) => {
          if(res) {
            // check if Router exists
            if(res.statusCode && res.statusCode === 409) {
              // check if Router is assoicated to any OrderItem
              getAssociations({
                recordId: res.data.id,
                key: CUSTOMER_DEVICE_ROUTER,
                schema: swapModalReducer.relation?.schema,
                entities: [ ORDER_ITEM ],
              }, (associations: any) => {
                if(associations.results?.[ORDER_ITEM]?.dbRecords) {
                  // if Router is associated to OrderItem fetch Router and let user resolve conflict
                  getRecordById({ schema: swapModalReducer.relation?.schema, recordId: res.data.id });
                  this.setState({
                    isRouterTaken: true,
                    errorRecordId: res.data.id,
                    newRecordId: res.data.id,
                  });
                  this.setStepViewState(1, true);
                  cb(false);
                } else {
                  // if Router is not associated to any OrderItem update Router with associations to OrderItem
                  createAssociations({
                    recordId: res.data.id,
                    schema: swapModalReducer.relation?.schema,
                    schemaAssociation: swapModalReducer.relation?.schemaAssociation,
                    createUpdate: [
                      { recordId: swapModalReducer.record?.id },
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

              this.setState({
                newRecordId: res.id,
              })

              cb(true);
              this.setStepViewState(2, true);
            }
          } else {
            cb(false);
          }
        });
        break
    }
  }

  private deleteRecordAssociation() {
    const { swapModalReducer, deleteRecordAssociation, schemaReducer } = this.props;
    this.setState({
      deleteAssociation: true,
    });
    const routerSchema = getSchemaFromShortListBySchemaId(
      schemaReducer.shortList,
      swapModalReducer.relation?.schema.id,
    );
    deleteRecordAssociation({
      schema: routerSchema,
      schemaAssociation: swapModalReducer.relation?.schemaAssociation,
      dbRecordAssociationId: swapModalReducer.relatedRecord?.dbRecordAssociation?.id,
    }, () => {

      this.setStepViewState(1, false);

      this.setState({
        deleteAssociation: false,
      });

    });
  }

  private speedTest = async () => {
    const { alertMessage, recordReducer } = this.props;
    this.setState({
      speedTest: true,
    });
    if(!this.state.newRecordId) return
    await httpPost(
      `ServiceModule/v1.0/network/eero/eeros/${getProperty(
        recordReducer.shortList[this.state.newRecordId],
        'SerialNumber',
      )}/speedtest`,
      {},
    ).then(res => {
      alertMessage({ body: 'successful', type: 'success' });
      this.setState({
        speedTest: false,
      });
      this.setStepViewState(2, false);

    }).catch(err => {

      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error processing your request', type: 'error' });
      this.setState({
        speedTest: false,
      });
    });
  }


  renderSteps() {
    const { stepViewReducer, schemaReducer, swapModalReducer } = this.props;
    const routerSchema = getSchemaFromShortListBySchemaId(
      schemaReducer.shortList,
      swapModalReducer.relation?.schema.id,
    );
    const stepsArray = [
      {
        name: 'Delete Association',
        content: <div>
          <p>{'Please confirm you would like to delete the association'}</p>
          <p>Item: {swapModalReducer.relatedRecord?.recordNumber}</p>
          <Button onClick={(e) => this.deleteRecordAssociation()}
                  disabled={!stepViewReducer.stepComponentsData[0]?.isNextDisabled}
                  loading={this.state.deleteAssociation}>Delete</Button>
        </div>,
        entityName: 'DeleteAssociation',
      },
      {
        name: 'Add Router',
        content: !this.state.isRouterTaken ? <EmbeddedForm
            isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
            isCreateRecord moduleName={SERVICE_MODULE} entityName={CUSTOMER_DEVICE_ROUTER} formUUID={uuid}
            schema={routerSchema}/> :
          this.routerAlredyExists(),
        entityName: 'Router',
      },
      {
        name: 'Speed Test',
        content: <div>
          <p>{'Please confirm you would like to run a speed test for the router'}</p>
          <p>Item: {swapModalReducer.record?.title}</p>
          <Button onClick={(e) => this.speedTest()} disabled={!stepViewReducer.stepComponentsData[2]?.isNextDisabled}
                  loading={this.state.speedTest}>Test</Button>
        </div>,
        entityName: 'SpeedTest',
      },
    ];

    return stepsArray
  }

  routerAlredyExists() {
    const { recordReducer } = this.props;
    if(this.state.errorRecordId === undefined) return <></>;
    const record = getRecordFromShortListById(recordReducer.shortList, this.state.errorRecordId);
    return (
      <>
        <div>Conflict, record already exists with properties.</div>
        <div>Please solve confilcts in record below and try again.</div>
        <Link to={`/${SERVICE_MODULE}/${CUSTOMER_DEVICE_ROUTER}/${record?.id}`}>{record?.recordNumber}</Link>
      </>
    )
  }


  resetModalData() {
    const { setValidationData, stepViewReducer, closeSwapModal } = this.props;

    const tempArr = stepViewReducer.stepComponentsData;
    closeSwapModal();

    this.setStepViewState(1, true);
    setValidationData(tempArr);

  }

  finishRouterSwap(cb: any) {
    cb(true);
    this.resetModalData();
  }

  render() {
    const { swapModalReducer } = this.props
    const key = swapModalReducer.record?.id === undefined ? '' : swapModalReducer.record.id;
    const showModal = swapModalReducer.showSwapModalList?.[key]
    return (
      <>
        <Modal className="cancel-appointment-modal"
               title="Swap Router Device"
               visible={showModal}
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
              this.finishRouterSwap(cb)
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
  swapModalReducer: state.swapModalReducer,
});

const mapDispatch = (dispatch: any) => ({
  setValidationData: (params: IStepViewValidation[]) => dispatch(setStepValidationArray(params)),
  changeStep: (params: IStepViewChangeStepNumber) => dispatch(changeStepNumber(params)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  deleteRecordAssociation: (payload: IDeleteRecordAssociation, cb: any) => dispatch(deleteRecordAssociationById(
    payload,
    cb,
  )),
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
  closeSwapModal: () => dispatch(closeSwapModal()),
});

// @ts-ignore
export default connect(mapState, mapDispatch)(SwapCustomerDeviceRouter);
