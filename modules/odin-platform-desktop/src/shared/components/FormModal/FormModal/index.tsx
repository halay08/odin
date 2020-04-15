import { Col, Form, Modal, Row } from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import { errorNotification } from '../../../system/notifications/store/reducers';
import renderFormField from '../FormFields';
import { closeSharedForm, updateSharedFormInput } from '../store/actions';

interface Props {
  formReducer: any;
  formUUID: string;
  closeForm: any;
  updateForm: any;
  notifyError: any;
  onSubmitEvent: any;
}

interface State {
  isLoading: boolean
}

export interface FormReducerSubmitEvt {

  id?: string | number;
  data: { [key: string]: any }

}

class FormModal extends React.Component<Props, State> {

  formRef = React.createRef<FormInstance>();

  constructor(props: Props) {
    super(props)
    this.state = {
      isLoading: false,
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { formReducer } = this.props;
    if(prevProps.formReducer.showModal !== this.props.formReducer.showModal) {
      formReducer.formFields.forEach((element: any) => {
        this.formRef.current?.setFieldsValue({
          [element.property]: element.value,
        });
      });
    }
  }

  handleSubmit = async () => {
    const { notifyError, formReducer, onSubmitEvent } = this.props;
    this.setState({
      isLoading: true,
    })
    try {

      if(!!this.formRef.current) {

        await this.formRef.current.validateFields();
        const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
        const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;

        if(Object.keys(formReducer.saveData).length === 0) {

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

          onSubmitEvent({
            id: this.getIdFromFormFilelds(formReducer.formFields),
            data: this.updateSaveData(this.formRef.current.getFieldsValue(), formReducer.saveData),
            title: formReducer.title
          });

          this.closeModal();
        }
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      })
      console.error(e);
    }
  };

  closeModal() {
    const { closeForm } = this.props;
    this.formRef.current?.resetFields();
    this.setState({
      isLoading: false,
    });
    closeForm();
  }

  updateSaveData(formData: any, saveData: any) {
    for(let data in saveData) {
      if(saveData[data] === undefined) {
        formData[data] = null
      } else {
        formData[data] = saveData[data]
      }
    }
    return formData;
  }

  getIdFromFormFilelds = (data: any) => {
    return data.find((elem: any) => elem.property === 'id')?.value;
  }

  constructFormFields = (data: any) => {
    const field = {
      label: data.label,
      property: data.property,
      type: data.type,
      isRequired: data.isRequired,
      message: data.message,
      isHidden: data.isHidden,
      value: data.value,
      initialValue: data.initialValue,
      options: data.options,
      isDisabled: data.isDisabled,
      customValidation: data.customValidation,
      customValidationCondition: data.customValidationCondition,
      customValidationMessage: data.customValidationMessage,
      allowClear: data.allowClear,
      className: data.className,
      handleInputChange: this.handleInputChange,
    };
    return renderFormField(field);
  }

  handleInputChange = (params: any) => {
    const { updateForm } = this.props
    updateForm({
      property: params.property,
      value: params.value,
    });
  };

  renderForm() {
    const { formReducer } = this.props;

    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const formData = formReducer.formFields;

    return (

      <Form
        style={{ maxHeight: 500, overflow: 'auto' }}
        {...layout}
        labelCol={{ span: 22 }}
        wrapperCol={{ span: 22 }}
        className="dynamic-form"
        initialValues={{ remember: true }}
        ref={this.formRef}
        autoComplete="off"
        key={this.props.formReducer?.title}
        name={this.props.formReducer?.title}
      >
        {formData.map((data: any) => (
            <Col className={data.property === 'id' ? 'hidden-col' : ''}>
              {this.constructFormFields(data)}
            </Col>
          ),
        )}
      </Form>
    )
  }

  render() {

    const { formReducer, formUUID } = this.props;

    return (
      <>
        <Modal
          title={formReducer.title}
          visible={formReducer.showModal && formReducer.formUUID === formUUID}
          onOk={() => this.handleSubmit()}
          onCancel={() => this.closeModal()}
          confirmLoading={this.state.isLoading}
          destroyOnClose
          maskClosable={false}
        >
          {this.renderForm()}
        </Modal>
      </>
    );
  }
}

const mapState = (state: any) => ({
  formReducer: state.formReducer,
});

const mapDispatch = (dispatch: any) => ({
  closeForm: () => dispatch(closeSharedForm()),
  updateForm: (params: any) => dispatch(updateSharedFormInput(params)),
  notifyError: (params: any) => dispatch(errorNotification(params)),
});

export default connect(mapState, mapDispatch)(FormModal);
