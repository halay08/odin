import { OrganizationEntity } from '@d19n/models/dist/identity/organization/organization.entity';
import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Empty, Form, Input, Modal, Row, Select, Spin } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import { logPremiseVisitRequest } from '../../../../../containers/CrmModule/containers/Premise/store/actions';
import { LOG_PREMISE_VISIT_REQUEST } from '../../../../../containers/CrmModule/containers/Premise/store/constants';
import { PremiseReducerState } from '../../../../../containers/CrmModule/containers/Premise/store/reducer';
import { errorNotification } from '../../../../../shared/system/notifications/store/reducers';
import {
  IUpdateRelatedRecordAssociation,
  updateRecordAssociationRequest,
} from '../../../../recordsAssociations/store/actions';
import { DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST } from '../../../../recordsAssociations/store/constants';
import { IRecordAssociationsReducer } from '../../../../recordsAssociations/store/reducer';
import { createRecordsRequest, updateRecordByIdRequest } from '../../../store/actions';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../../store/constants';
import { IRecordReducer } from '../../../store/reducer';
import { PipelineReducerState } from '../../Pipeline/store/reducer';
import renderFormField, { FormField, InputChangeParams } from '../FormFields';
import { closeRecordForm, updateFormInput, updateRecordFormState } from '../store/actions';
import { FormReducer } from '../store/reducer';

const { Option } = Select;

export class FormSectionEntity {

  public id?: string | null;
  public organization?: OrganizationEntity;
  public schema?: SchemaEntity;
  public schemaColumns?: SchemaColumnEntity[];
  public name?: string;
  public description?: string;
  public position?: number;
  public columns?: number;

}

interface Props {

  identityReducer: any,
  premiseReducer: PremiseReducerState;
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  pipelineReducer: PipelineReducerState,
  onSubmitEvent: Function,
  formUUID: string,
  updateFormProperties: any,
  createRecord: any,
  updateRecord: any,
  updateRecordAssociation: any,
  logVisit: any,
  notifyError: any,
  recordFormReducer: any,
  closeForm: any,
  updateFormState: any,
  isBatchCreate?: boolean,

}

interface State {
  filterUsers: string | undefined
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class OdinFormModal extends React.Component<Props, State> {

  formRef = React.createRef<FormInstance>();

  constructor(props: Props) {
    super(props);

    this.state = {
      filterUsers: undefined,
    }
  }

  handleInputChange = (params: InputChangeParams) => {
    const { recordFormReducer, updateFormProperties } = this.props;
    const { selected } = recordFormReducer;
    // add contact email address to the lead
    const leadFormFields = recordFormReducer.modified.find((elem: any) => elem.entity === 'CrmModule:Lead');
    const contactFormFields = recordFormReducer.modified.find((elem: any) => elem.entity === 'CrmModule:Contact');

    // Add contact email address to the lead form
    if(!!leadFormFields && !!contactFormFields) {
      if(params.id === `${contactFormFields.schemaId}_EmailAddress`) {
        updateFormProperties({
          targetId: `${leadFormFields.schemaId}_EmailAddress`,
          entity: leadFormFields.entity,
          targetValue: params.value,
          record: selected,
        });
      }
    }

    updateFormProperties({
      targetId: params.id,
      entity: params.entity,
      targetValue: params.value,
      record: selected,
      association: params.association,
    });
  };

  handleSubmit = async () => {
    const { createRecord, updateRecord, updateRecordAssociation, logVisit, notifyError, recordFormReducer, closeForm, onSubmitEvent } = this.props;
    const { selected, schema, hasColumnMappings, isUpdateReq, isCreateReq } = recordFormReducer;

    try {
      if(!!this.formRef.current) {
        await this.formRef.current.validateFields();
        const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
        const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;

        if(recordFormReducer.modified.length < 1) {
          return notifyError({
            message: 'no modified form values',
            validation: null,
            data: null,
          });
        } else if(hasErrors) {
          return notifyError({
            message: 'form has errors, fix them and resubmit',
            validation: null,
            data: null,
          });
        } else {
          if(schema.moduleName === SchemaModuleTypeEnums.CRM_MODULE && schema.entityName === 'Visit' && !isUpdateReq) {
            return logVisit({
              schema: recordFormReducer.schema,
              createUpdate: recordFormReducer.modified[0],
            }, (res: any) => {

              console.log('ON_SUBMIT_EVENT', res);
              onSubmitEvent({ event: LOG_PREMISE_VISIT_REQUEST, results: res });
              closeForm();
            });

          } else if(isUpdateReq) {
            // update a record
            if(hasColumnMappings && selected.dbRecordAssociation) {
              return updateRecordAssociation({
                schema: schema,
                recordId: selected.id,
                dbRecordAssociationId: selected.dbRecordAssociation.id,
                createUpdate: {
                  properties: recordFormReducer.modified[0].properties,
                },
              }, (res: DbRecordEntityTransform) => {
                onSubmitEvent({ event: DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST, results: res });
                closeForm();
              });

            } else {
              return updateRecord({
                schema: schema,
                recordId: selected.id,
                format: recordFormReducer.resFormat,
                createUpdate: recordFormReducer.modified[0],
              }, (res: DbRecordEntityTransform) => {
                onSubmitEvent({ event: UPDATE_DB_RECORD_BY_ID_REQUEST, results: res });
                closeForm();
              });
            }

          } else if(isCreateReq) {
            // create a record
            return createRecord({
              schema: recordFormReducer.schema,
              upsert: recordFormReducer.upsert,
              createUpdate: [ ...recordFormReducer.payload, ...recordFormReducer.modified ],
            }, (res: DbRecordEntityTransform) => {
              onSubmitEvent({ event: CREATE_DB_RECORD_REQUEST, results: res });
              closeForm();
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };


  private setInitialValueFromModified(col: SchemaColumnEntity) {
    const { recordFormReducer } = this.props;
    if(!!recordFormReducer.selected) {
      const { properties } = recordFormReducer.selected;
      return properties[col.name];
    } else {
      return null;
    }
  }

  constructFormFields = (section: FormSectionEntity) => {
    const { recordFormReducer } = this.props;
    const { disabledFields, visibleFieldOverride } = recordFormReducer;

    if(!!section.schema?.columns && section.schema.columns) {
      return section.schema.columns.sort((cola, colb) => cola.position - colb.position).map((col) => {

        const initialValue = this.setInitialValueFromModified(col);
        let isHidden = col.isHidden ? col.isHidden : false;
        //  Only show these fields if override
        // If visibleFieldOverride && visibleFieldOverride.length > 0;
        if(visibleFieldOverride && visibleFieldOverride.length > 0) {
          // the field should not be a hidden field set from the server
          if(!isHidden) {
            // Hide all fields
            isHidden = true;
            // show only fields in this array
            isHidden = !visibleFieldOverride.includes(col.name);
          }
        }

        const field: FormField = {
          id: col.id ? col.id.toString() : col.name,
          schemaId: section.schema && section.schema.id ? section.schema.id.toString() : undefined,
          entity: section.schema && section.schema.moduleName ? `${section.schema.moduleName}:${section.schema.entityName}` : undefined,
          type: col.type,
          isHidden,
          name: col.name,
          label: col.label || col.name,
          description: col.description,
          defaultValue: !initialValue ? col.defaultValue : null,
          initialValue,
          options: col.options,
          validators: col.validators,
          isDisabled: disabledFields ? disabledFields.includes(col.name) : false,
          handleInputChange: this.handleInputChange,
        };
        return renderFormField(field);
      })
    }
  };

  private setInitialStage() {
    const { recordFormReducer, pipelineReducer } = this.props;
    const { selected, nextStageId } = recordFormReducer;

    if(!!nextStageId) {
      return nextStageId;
    } else if(selected && selected.stage) {
      return selected.stage.id;
    } else if(pipelineReducer.list) {
      let defaultStage;
      pipelineReducer.list.map((elem: PipelineEntity) => {
        if(elem.stages) {
          const stage = elem.stages.find((elem: PipelineStageEntity) => elem.isDefault);
          defaultStage = stage?.id;
        }
      });
      return defaultStage;
    }
  }

  private renderStageFilterOptions(section: FormSectionEntity) {
    const { pipelineReducer } = this.props;

    if(pipelineReducer.list.length > 0) {
      return (
        <Form.Item
          key='stage'
          name='stage'
          label='stage'
          labelCol={{ span: 24 }}
          initialValue={this.setInitialStage()}
          rules={[ { required: true } ]}
        >
          <Select
            key='stage'
            defaultValue={this.setInitialStage()}
            style={{ width: '100%' }}
            disabled={false}
            onChange={(val) => this.handleInputChange({
              id: `${section.schema?.id}_stage`,
              entity: 'Record',
              value: val,
            })}
          >
            {pipelineReducer.list.map((elem: PipelineEntity) => (
              elem.stages ? elem.stages.map((elem: PipelineStageEntity) => (
                  <Option value={elem.id ? elem.id.toString() : ''}>{elem.name}</Option>
                )) :
                <Option value={''}>No stages</Option>))
            }
          </Select>
        </Form.Item>);
    }
  };


  renderTitleField(section: FormSectionEntity) {
    const { recordFormReducer } = this.props;
    const { selected, isCreateReq } = recordFormReducer;

    if(section.schema?.hasTitle) {
      return (
        <Form.Item
          key='title'
          name='title'
          label='title'
          labelCol={{ span: 24 }}
          initialValue={selected ? selected.title : ''}
          rules={[ { required: isCreateReq && section.schema?.isTitleUnique } ]}
        >
          <Input
            type='text'
            defaultValue={selected ? selected.title : ''}
            placeholder='add record title'
            onChange={(e) => this.handleInputChange({
              id: `${section.schema?.id}_title`,
              entity: 'Record',
              value: e.target.value,
            })}/>
        </Form.Item>
      )
    }
  }

  renderRecordOwnerField(section: FormSectionEntity) {
    const { recordFormReducer, identityReducer } = this.props;
    const { selected } = recordFormReducer;

    let selectedUser;
    if(selected && selected.ownedBy) {
      selectedUser = identityReducer.list.find((usr: OrganizationUserEntity) => usr.id === selected.ownedBy.id);
    }

    return (
      <Form.Item
        key='ownerId'
        name='ownerId'
        label='record owner'
        labelCol={{ span: 24 }}
        initialValue={selected && selected.ownedBy ? selected.ownedBy.id : ''}
        rules={[]}
      >
        <Select
          key={'ownerId'}
          defaultValue={selected && selected.ownedBy ? selected.ownedBy.id : ''}
          style={{ width: '100%' }}
          showSearch
          onSearch={(e) => this.setState({ filterUsers: e })}
          onChange={(val) => this.handleInputChange({
            id: `${section.schema?.id}_ownerId`,
            entity: 'Record',
            value: val,
          })}
        >
          <Option
            key={selectedUser ? selectedUser.id : ''}
            value={selectedUser ? selectedUser.id : ''}>
            {selectedUser ? selectedUser.fullName : 'Select Owner'}
          </Option>
          {identityReducer.list && identityReducer.list.map((elem: OrganizationUserEntity) => (
            <Option key={elem?.id?.toString()} value={elem.id ? elem.id.toString() : ''}>
              {`${elem.firstname} ${elem.lastname}`}
            </Option>
          ))
          }

        </Select>
      </Form.Item>
    )
  }

  renderRagStatusField(section: FormSectionEntity) {
    const { recordFormReducer } = this.props;
    const { selected } = recordFormReducer;

    return (
      <Form.Item
        key='ragStatus'
        name='ragStatus'
        label='rag status'
        labelCol={{ span: 24 }}
        initialValue={selected ? selected.ragStatus : 0}
        rules={[]}
      >
        <Select
          key={'ragStatus'}
          defaultValue={selected ? selected.ragStatus : 0}
          style={{ width: '100%' }}
          onChange={(val) => this.handleInputChange({
            id: `${section.schema?.id}_rag_status`,
            entity: 'Record',
            value: val,
          })}
        >
          <Option value={0}>select status</Option>
          <Option value={1}>Green</Option>
          <Option value={2}>Amber</Option>
          <Option value={3}>Red</Option>
        </Select>
      </Form.Item>
    )
  }

  renderRagStatusDescription(section: FormSectionEntity) {
    const { recordFormReducer } = this.props;
    const { selected, isCreateReq } = recordFormReducer;

    return (
      <Form.Item
        key='ragDescription'
        name='ragDescription'
        label='rag description'
        labelCol={{ span: 24 }}
        initialValue={selected ? selected.ragDescription : ''}
        rules={[]}
      >
        <Input
          type='text'
          defaultValue={selected ? selected.ragDescription : ''}
          placeholder='add rag description'
          onChange={(e) => this.handleInputChange({
            id: `${section.schema?.id}_rag_description`,
            entity: 'Record',
            value: e.target.value,
          })}/>
      </Form.Item>
    )
  }

  private renderSelectInputForAssociations(section: any) {
    return section.associations &&
      (
        <Form.Item
          key='related'
          name='related'
          label='related'
          labelCol={{ span: 24 }}
          rules={[ { required: false } ]}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            defaultValue={section.associations.map((elem: any) => elem.title)}
            placeholder="Please select"
          >
            {section.associations.map((elem: any) => (
              <Option key={elem.recordId} value={elem.recordId}>{elem.title}</Option>
            ))}
          </Select>
        </Form.Item>
      )
  }

  handleAssociationAddedFromFileUpload(elem: DbRecordEntityTransform) {

    console.log('elem', elem);

  }

  render() {
    const { recordReducer, premiseReducer, recordFormReducer, recordAssociationReducer, closeForm, formUUID } = this.props;
    const { hasColumnMappings } = recordFormReducer;

    return (
      <>
        <Modal
          className='dynamic-form-modal'
          width={750}
          style={{ top: 20 }}
          title={recordFormReducer.title}
          visible={recordFormReducer.showInitializing && recordFormReducer.formUUID === formUUID}
          footer={false}
          onCancel={() => closeForm()}
        >
          <Spin/>
        </Modal>


        <Modal
          className='dynamic-form-modal'
          forceRender
          destroyOnClose
          width={750}
          style={{ top: 20 }}
          title={recordFormReducer.title}
          visible={recordFormReducer.showFormModal && recordFormReducer.formUUID === formUUID}
          onOk={this.handleSubmit}
          confirmLoading={premiseReducer.isRequesting || recordReducer.isCreating || recordReducer.isUpdating || recordAssociationReducer.isUpdating}
          onCancel={() => closeForm()}
        >
          {recordFormReducer.sections.length > 0 ?
            <div>
              {recordFormReducer.sections.map((section: FormSectionEntity) => (
                <Form
                  style={{ maxHeight: 500, overflow: 'auto' }}
                  {...layout}
                  labelCol={{ span: 22 }}
                  wrapperCol={{ span: 22 }}
                  ref={this.formRef}
                  key={section.id ? section.id.toString() : section.name}
                  name={section.schema?.id ? section.schema?.id.toString() : section.schema?.name}
                  className="dynamic-form"
                  initialValues={{ remember: true }}
                >
                  {!hasColumnMappings ?
                    <Row>
                      <Col span={24}>
                        {this.renderStageFilterOptions(section)}
                        {this.renderSelectInputForAssociations(section)}
                      </Col>
                      <Col span={24}>
                        {this.constructFormFields(section)}
                      </Col>
                    </Row>
                    :
                    <Row>
                      <Col span={24}>
                        {this.constructFormFields(section)}
                      </Col>
                    </Row>
                  }
                </Form>
              ))}
            </div>
            : (<Empty description='no form fields to show'/>)}
        </Modal>

      </>
    )
  }
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  pipelineReducer: state.pipelineReducer,
  recordFormReducer: state.recordFormReducer,
  premiseReducer: state.premiseReducer,
});

const mapDispatch = (dispatch: any) => ({
  closeForm: () => dispatch(closeRecordForm()),
  updateFormProperties: (value: any) => dispatch(updateFormInput(value)),
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  updateRecord: (params: any, cb: any) => dispatch(updateRecordByIdRequest(params, cb)),
  updateRecordAssociation: (
    params: IUpdateRelatedRecordAssociation,
    cb: any,
  ) => dispatch(updateRecordAssociationRequest(params, cb)),
  notifyError: (params: any) => dispatch(errorNotification(params)),
  logVisit: (visit: any, cb: any) => dispatch(logPremiseVisitRequest(visit, cb)),
  updateFormState: (params: FormReducer) => dispatch(updateRecordFormState(params)),
});


export default connect(mapState, mapDispatch)(OdinFormModal);

