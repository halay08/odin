import { OrganizationUserEntity } from '@d19n/models/dist/identity/organization/user/organization.user.entity';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnValidatorEnums } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Col, Collapse, Form, Input, Row, Select } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import { logPremiseVisitRequest } from '../../../../../containers/CrmModule/containers/Premise/store/actions';
import { LOG_PREMISE_VISIT_REQUEST } from '../../../../../containers/CrmModule/containers/Premise/store/constants';
import { errorNotification } from '../../../../../shared/system/notifications/store/reducers';
import { DB_RECORD_ASSOCIATIONS_UPDATE_REQUEST } from '../../../../recordsAssociations/store/constants';
import { IRecordAssociationsReducer } from '../../../../recordsAssociations/store/reducer';
import { SchemaReducerState } from '../../../../schemas/store/reducer';
import { createRecordsRequest, updateRecordByIdRequest } from '../../../store/actions';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../../store/constants';
import { IRecordReducer } from '../../../store/reducer';
import renderFormField, { FormField, InputChangeParams } from '../FormFields';
import { closeRecordForm, initializeRecordForm, updateFormInput, updateRecordFormState } from '../store/actions';
import { FormReducer } from '../store/reducer';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import {
  IUpdateRelatedRecordAssociation,
  updateRecordAssociationRequest,
} from '../../../../recordsAssociations/store/actions';

interface Props {
  schema?: SchemaEntity | undefined;
  moduleName?: string,
  entityName?: string,
  schemaReducer: SchemaReducerState,
  userReducer: any,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  onSubmitEvent?: any,
  formUUID: string,
  updateFormProperties: any,
  createRecord: any,
  updateRecord: any,
  updateRecordAssociation: any,
  logVisit: any,
  notifyError: any,
  recordFormReducer: any,
  updateFormState: any,
  initializeForm: any,
  closeForm: any,
  isCreateRecord?: boolean,
  isNextDisabled?: Function,
  record?: DbRecordEntityTransform
}

const { Option } = Select;

const { Panel } = Collapse;

interface State {
  filterUsers: string | undefined
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class EmbeddedMobileForm extends React.Component<Props, State> {

  formRef = React.createRef<FormInstance>();

  constructor(props: Props) {
    super(props);
    this.props.initializeForm();
    this.state = {
      filterUsers: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.entityName !== this.props.entityName) {
      this.props.initializeForm();
    }
  }

  handleInputChange = (params: InputChangeParams) => {
    const { recordFormReducer, updateFormProperties, isCreateRecord } = this.props;
    const { selected } = recordFormReducer;

    updateFormProperties({
      targetId: params.id,
      entity: params.entity,
      targetValue: params.value,
      record: selected,
      association: params.association,
    });

    // added this so the form input is not lagging behind validation
    if(isCreateRecord) {
      setTimeout(() =>
          this.handleFormValidation()
        , 10);
    }
  }

  handleFormValidation = async () => {


    const { isNextDisabled } = this.props;

    if(isNextDisabled) {

      try {

        await this.formRef.current?.validateFields()
        const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
        const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;

        if(!hasErrors) {
          isNextDisabled(false);
        } else {
          isNextDisabled(true);
        }

      } catch (e) {
        isNextDisabled(true);
        console.error(e);
      }

    }
  }

  handleSubmit = async () => {
    const {
      createRecord,
      updateRecord,
      updateRecordAssociation,
      logVisit,
      notifyError,
      recordFormReducer,
      onSubmitEvent,
      closeForm
    } = this.props;
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
    const { record } = this.props;
    if(!!record) {
      const { properties } = record;
      return properties[col.name];
    } else {
      return null;
    }
  }

  constructFormFields = (schema: SchemaEntity | undefined, isRequierdField: boolean, columnPostition: number) => {
    const { recordFormReducer } = this.props;
    const { disabledFields, visibleFieldOverride } = recordFormReducer;

    if(!!schema?.columns && schema.columns) {
      return schema.columns.sort((cola, colb) => cola.position - colb.position).map((col) => {

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
          schemaId: schema && schema.id ? schema.id.toString() : undefined,
          entity: schema && schema.moduleName ? `${schema.moduleName}:${schema.entityName}` : undefined,
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
        if(isRequierdField && col.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED)) {
          if(col.columnPosition === columnPostition) return renderFormField(field);
        } else if(!isRequierdField && !col.validators.map(elem => elem.type).includes(SchemaColumnValidatorEnums.REQUIRED)) {
          if(col.columnPosition === columnPostition) return renderFormField(field);
        }
      })
    }
  };

  renderTitleField(schema: SchemaEntity | undefined) {
    const { record, recordFormReducer } = this.props;

    if(schema?.hasTitle || schema?.isTitleUnique) {
      return (
        <Form.Item
          key='title'
          name='title'
          label='Record title'
          labelCol={{ span: 24 }}
          initialValue={record ? record.title : ''}
          rules={[ { required: recordFormReducer.isCreateReq && schema?.isTitleUnique } ]}
        >
          <Input
            type='text'
            defaultValue={record ? record.title : ''}
            placeholder='Add record title'
            onChange={(e) => this.handleInputChange({
              id: `${schema?.id}_title`,
              entity: 'Record',
              value: e.target.value,
            })}/>
        </Form.Item>
      )
    }
  }

  renderRecordOwnerField(schema: SchemaEntity | undefined) {
    const { recordFormReducer, userReducer } = this.props;
    const { selected } = recordFormReducer;

    let selectedUser;
    if(selected && selected.ownedBy) {
      selectedUser = userReducer.list.find((usr: OrganizationUserEntity) => usr.id === selected.ownedBy.id);
    }

    if(schema?.assignable) {
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
              id: `${schema?.id}_ownerId`,
              entity: 'Record',
              value: val,
            })}
          >
            <Option
              key={selectedUser ? selectedUser.id : ''}
              value={selectedUser ? selectedUser.id : ''}>
              {selectedUser ? selectedUser.fullName : 'Select Owner'}
            </Option>
            {userReducer.list && userReducer.list.map((elem: OrganizationUserEntity) => (
              <Option key={elem?.id?.toString()} value={elem.id ? elem.id.toString() : ''}>
                {`${elem.firstname} ${elem.lastname}`}
              </Option>
            ))
            }

          </Select>
        </Form.Item>
      )
    }
  }

  renderSchemaTypeField(schema: SchemaEntity | undefined) {

    const { recordFormReducer } = this.props;
    const { selected, recordType } = recordFormReducer;

    const hasTypes = schema?.types?.length;

    if(schema && hasTypes) {

      return (
        <Form.Item
          key='recordType'
          name='recordType'
          label='Record Type'
          labelCol={{ span: 24 }}
          initialValue={selected ? selected.type : recordType}
          rules={[ { required: true } ]}
        >
          <Select
            key={'recordType'}
            disabled={recordFormReducer.isUpdateReq}
            defaultValue={selected ? selected.type : recordType}
            style={{ width: '100%' }}
            onChange={(val) => this.handleInputChange({
              id: `${schema?.id}_recordType`,
              entity: 'Record',
              value: val,
            })}
          >
            <Option
              key={selected ? selected.type : 1}
              value={selected ? selected.type : ''}>
              {selected ? selected.type : 'Select Type'}
            </Option>
            {schema.types && schema.types.map((elem: SchemaTypeEntity) => (
              <Option key={elem?.id?.toString()} value={elem.name}>
                {elem.name}
              </Option>
            ))
            }

          </Select>
        </Form.Item>
      )
    }
  }


  renderSelectInputForAssociations(schema: SchemaEntity | undefined) {
    return schema?.associations &&
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
            defaultValue={schema.associations.map((elem: any) => elem.title || elem.label)}
            placeholder="Please select"
          >
            {schema.associations.map((elem: any) => (
              <Option key={elem.id} value={elem.id}>{elem.title || elem.label}</Option>
            ))}
          </Select>
        </Form.Item>
      )
  }

  render() {
    const { schema, isCreateRecord } = this.props;

    return (
      <>
        <Form
          style={{ maxHeight: 500, overflow: 'auto' }}
          {...layout}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          ref={this.formRef}
          key={schema?.id ? schema.id.toString() : schema?.name}
          name={schema?.id ? schema?.id.toString() : schema?.name}
          className="dynamic-form embedded-form"
          initialValues={{ remember: true }}
        >
          <Row style={{paddingRight:'20px'}}>
            <Col span={24}>
              {this.constructFormFields(schema, true, 1)}
            </Col>
            <Col span={24}>
              {this.constructFormFields(schema, true, 2)}
            </Col>
            <Col span={24}>
              {this.constructFormFields(schema, false, 1)}
            </Col>
            <Col span={24}>
              {this.constructFormFields(schema, false, 2)}
            </Col>
          </Row>
        </Form>
        {isCreateRecord ? '' :
          <Button type="primary" style={{ width: '100%' }} onClick={() => this.handleSubmit()}>Save changes</Button>}
      </>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  pipelineReducer: state.pipelineReducer,
  recordFormReducer: state.recordFormReducer,
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
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
});


export default connect(mapState, mapDispatch)(EmbeddedMobileForm);

