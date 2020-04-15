import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button } from 'antd';
import Modal from 'antd/lib/modal/Modal';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import EmbeddedForm from '../../../core/records/components/Forms/EmbeddedForm';
import { createRecordsRequest } from '../../../core/records/store/actions';
import { getRecordAssociationsRequest, IGetRecordAssociations, updateOrCreateRecordAssociations } from '../../../core/recordsAssociations/store/actions';
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
import { getSchemaFromShortListByModuleAndEntity } from '../../../shared/utilities/schemaHelpers';
import AssociationDataTable from '../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { IRecordAssociationsReducer } from '../../../core/recordsAssociations/store/reducer';


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
  schemaReducer: SchemaReducerState,
  excludeFromCreate?: string,
  associatingRecordId?: string,
  getSchema: any,
  record: any,
  setValidationData: (params: IStepViewValidation[]) => void
  changeStep: (params: IStepViewChangeStepNumber) => void,
  getAssociations: (params: IGetRecordAssociations, cb: any) => void,
  relation: DbRecordAssociationRecordsTransform,
  recordAssociationReducer: IRecordAssociationsReducer
}

interface State {
  createBrodbandVisible: boolean,
  createdONTId: string | undefined,
  customerDeviceRouterSchema: any,
  createdRouterId: any,
  activateLoading: boolean,
  checkStatusLoading: boolean,
  attachedProductModalVisible: boolean,
  attachedProductModalOkButtonDisabled: boolean,
  confirmLoading: boolean
}

const uuid = uuidv4();

const { SERVICE_MODULE, ORDER_MODULE } = SchemaModuleTypeEnums;

const { ORDER_ITEM } = SchemaModuleEntityTypeEnums;

class ActivateCustomerDeviceOnt extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      createBrodbandVisible: false,
      createdONTId: undefined,
      customerDeviceRouterSchema: undefined,
      createdRouterId: '',
      activateLoading: false,
      checkStatusLoading: false,
      attachedProductModalVisible: false,
      attachedProductModalOkButtonDisabled: false,
      confirmLoading: false
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

  onNextButtonClick = async (params: any, cb: any) => {
    const { recordFormReducer, createRecord, schema, associatingRecordId, getSchema, getAssociations, schemaReducer } = this.props;
    const orderSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, ORDER_MODULE, ORDER_ITEM);
    switch (params.entityName) {
      case 'ONT':
        let modified: any = []
        if(associatingRecordId) {
          modified = recordFormReducer.modified;
          modified[0].associations = [
            { recordId: associatingRecordId },
          ]
        } else {
          modified = [ ...recordFormReducer.payload, ...recordFormReducer.modified ]
        }
        createRecord({
          schema: schema,
          upsert: recordFormReducer.upsert,
          createUpdate: modified,
        }, (res: DbRecordEntityTransform) => {
          if(res.statusCode === 409) {
            if(orderSchema !== undefined) {
              getAssociations({
                recordId: res.data.id,
                key: ORDER_MODULE,
                schema: orderSchema,
                entities: [ ORDER_ITEM ],
              }, (result: any) => {
                if(result.results.OrderItem.dbRecords !== undefined && result.results.OrderItem.dbRecords.length > 0) {
                  this.setState({
                    attachedProductModalVisible: true,
                    createdONTId: res.data.id
                  });
                  getSchema({ moduleName: SERVICE_MODULE, entityName: 'CustomerDeviceRouter' }, (result: any) => {
                    this.setState({
                      customerDeviceRouterSchema: result,
                    })
                  });
                  cb(false);
                } else {
                  this.setState({
                    createdONTId: res.data.id,
                  })
                  getSchema({ moduleName: SERVICE_MODULE, entityName: 'CustomerDeviceRouter' }, (result: any) => {
                    this.setState({
                      customerDeviceRouterSchema: result,
                    })
                    cb(true);
                    this.associateOnt();
                  });
                }
              });
            }
          } else {
            if(res) {
              this.setState({
                createdONTId: res.id,
              })
              getSchema({ moduleName: SERVICE_MODULE, entityName: 'CustomerDeviceRouter' }, (result: any) => {
                this.setState({
                  customerDeviceRouterSchema: result,
                })
                cb(true);
                this.setStepViewState(1, true);
              });
            } else {
              cb(false);
            }
          }
        });
        break;
      case 'Router':
        let modifiedRouter: any = []
        if(associatingRecordId) {
          modifiedRouter = recordFormReducer.modified;
          modifiedRouter[0].associations = [
            { recordId: associatingRecordId },
            { recordId: this.state.createdONTId },
          ]
        } else {
          modifiedRouter = [ ...recordFormReducer.payload, ...recordFormReducer.modified ]
        }
        createRecord({
          schema: this.state.customerDeviceRouterSchema,
          upsert: recordFormReducer.upsert,
          createUpdate: modifiedRouter,
        }, (res: DbRecordEntityTransform) => {
          if(res) {
            this.setState({
              createdRouterId: res.id,
            })
            cb(true);
            this.setStepViewState(2, true);
          } else {
            cb(false);
          }
        });
        break
      case 'Activate':
        cb(true);
        this.setStepViewState(3, true);
        break
    }
  }

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
      this.setStepViewState(2, false);
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
      this.setStepViewState(3, false);
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

  finishBrodbandCreate = async (cb: any) => {
    cb(true)
  }

  renderSteps() {
    const { stepViewReducer, schema, excludeFromCreate, record } = this.props;
    const stepsArray = [
      {
        name: 'Add ONT',
        content: <EmbeddedForm
          isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
          isCreateRecord moduleName={SERVICE_MODULE} entityName={'CustomerDeviceOnt'} formUUID={uuid} schema={schema}/>,
        entityName: 'ONT',
      },
      {
        name: 'Add Router',
        content: this.state.customerDeviceRouterSchema ? <EmbeddedForm
          isNextDisabled={(e: any) => this.setStepViewState(stepViewReducer.currentStep, e)}
          isCreateRecord moduleName={SERVICE_MODULE} entityName={'CustomerDeviceRouter'} formUUID={uuid}
          schema={this.state.customerDeviceRouterSchema}/> : <></>,
        entityName: 'Router',
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

  resetModalData() {

    const { passDataToParent, setValidationData, stepViewReducer } = this.props;

    passDataToParent(false);
    const tempArr = stepViewReducer.stepComponentsData;

    this.setStepViewState(0, true);
    setValidationData(tempArr);

  }

  renderAttachedProduct() {
    const { recordReducer } = this.props;
    
    return (
      this.state.createdONTId !== undefined ? <AssociationDataTable
                                                title={ORDER_ITEM}
                                                record={getRecordFromShortListById(recordReducer.shortList, this.state.createdONTId)}
                                                moduleName={ORDER_MODULE}
                                                entityName={ORDER_ITEM}
                                                customActionOverride/> : <></> 
    )
  }

  associateOnt() {
    const { createAssociations, record, relation } = this.props;
    this.setState({
      confirmLoading: true 
    })
    createAssociations({
      recordId: record.id,
      schema: relation.schema,
      schemaAssociation: relation.schemaAssociation,
      createUpdate: [
        { recordId: this.state.createdONTId },
      ],
    }, (res: any) => {
      this.setState({
        confirmLoading: false,
        attachedProductModalVisible: false
      })
      this.setStepViewState(1, true);
    });
    
  }


  render() {
    let { visible, recordFormReducer, recordAssociationReducer } = this.props;
    const associationKey = `${this.state.createdONTId}_${ORDER_ITEM}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    return (
      <>
        <Modal
          title="ONT"
          visible={this.state.attachedProductModalVisible}
          width={1000}
          onCancel={() => {
            this.setState({
              attachedProductModalVisible: false
            })
          }}
          maskClosable={false}
          footer={null}
        >
          {this.renderAttachedProduct()}
          <div style={{ display: 'flex' }}>
              <Button
                style={{ marginRight: 10 }}
                type="primary"
                ghost
                onClick={() => {
                  this.setState({ attachedProductModalVisible: false })
                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                onClick={() => {
                  this.associateOnt()
                }}
                loading={this.state.confirmLoading}
                disabled={associationObj?.[ORDER_ITEM]?.dbRecords !== undefined ? true : false}
                >
                Associate ONT
              </Button>
            </div>
        </Modal>
        <Modal className="cancel-appointment-modal"
               title="Brodband Activation"
               visible={visible && !recordFormReducer.showFormModal && !this.state.attachedProductModalVisible}
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
              this.finishBrodbandCreate(cb)
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
  recordAssociationReducer: state.recordAssociationReducer
});

const mapDispatch = (dispatch: any) => ({
  setValidationData: (params: IStepViewValidation[]) => dispatch(setStepValidationArray(params)),
  changeStep: (params: IStepViewChangeStepNumber) => dispatch(changeStepNumber(params)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
});

// @ts-ignore
export default connect(mapState, mapDispatch)(ActivateCustomerDeviceOnt);
