import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Col, Form, Row } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import renderFormField, { FormField } from '../../../../../../../core/records/components/Forms/FormFields';
import {
  getSchemaByModuleAndEntityRequest,
  ISchemaByModuleAndEntity,
} from '../../../../../../../core/schemas/store/actions';
import { setStepValidationArray } from '../../../../../../../shared/components/StepView/store/actions';

// import renderFormField, { FormField } from '../FormFields';

interface Props {
  getSchema: any,
  stepViewReducer: any,
  setValidationData: any,
  saveData?: any
}

interface State {
  schemaData: any
}

const { FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;


class CancellationReasonForm extends React.Component<Props, State> {

  formRef = React.createRef<FormInstance>();

  constructor(props: Props) {
    super(props);
    this.state = {
      schemaData: {},
    }
    this.getFormFields();
    this.setStepViewState(true);
  }

  getFormFields() {
    const { getSchema } = this.props;
    getSchema({ moduleName: FIELD_SERVICE_MODULE, entityName: 'CancellationReason' }, (result: SchemaEntity) => {
      this.setState({
        schemaData: result,
      })
    })
  }


  constructFormFields = (col: any) => {
    const initialValue = null;
    const field: FormField = {
      id: col.id ? col.id.toString() : col.name,
      schemaId: undefined,
      entity: 'CancellationReason',
      type: col.type,
      isHidden: col.isHidden ? col.isHidden : false,
      name: col.name,
      label: col.label || col.name,
      description: col.description,
      options: col.options,
      validators: col.validators,
      defaultValue: !initialValue ? col.defaultValue : null,
      initialValue,
      isDisabled: false,
      handleInputChange: this.handleInputChange,
    };
    return renderFormField(field);
  }

  handleInputChange = async (params: any) => {
    const { saveData } = this.props;
    try {
      await this.formRef.current?.validateFields()
      const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
      const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;
      if(!hasErrors) {
        this.setStepViewState(false);
        saveData(this.formRef.current?.getFieldsValue());
      } else {
        this.setStepViewState(true);
      }
    } catch (e) {
      this.setStepViewState(true);
      console.error(e);
    }

  };


  renderForm() {

    return (

      <Form
        style={{ maxHeight: 500, overflow: 'auto' }}
        ref={this.formRef}
        autoComplete="off"
        key={this.state.schemaData?.id}
        name={this.state.schemaData?.id}
      >
        <Row>
          {this.state.schemaData?.columns?.map((data: any) => (
              <Col>
                {this.constructFormFields(data)}
              </Col>
            ),
          )}
        </Row>
      </Form>
    )
  }

  setStepViewState(isTrue: boolean) {
    const { setValidationData, stepViewReducer } = this.props;
    let tempStepData = stepViewReducer.stepComponentsData;
    tempStepData[0].isNextDisabled = isTrue;
    setValidationData(tempStepData);
  }

  render() {
    return (
      <>
        {this.renderForm()}
      </>
    )
  }
}

const mapState = (state: any) => ({
  stepViewReducer: state.stepViewReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  setValidationData: (params: any) => dispatch(setStepValidationArray(params)),
});

// @ts-ignore
export default connect(mapState, mapDispatch)(CancellationReasonForm);
