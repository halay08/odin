import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  SCHEMA_COLUMN_TYPE_KEYS,
  SchemaColumnTypes,
} from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaColumnValidatorTypes } from '@d19n/models/dist/schema-manager/schema/column/validator/schema.column.validator.types';
import {
  Breadcrumb,
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Layout,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { FormInstance } from 'antd/lib/form';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import {
  CreateSchemaColumn,
  createSchemaColumnPermissionsRequest,
  createSchemaColumnRequest,
  DeleteSchemaColumn,
  deleteSchemaColumnPermissionsRequest,
  deleteSchemaColumnRequest,
  GetSchemaColumnById,
  getSchemaColumnByIdRequest,
  removeSchemaColumnOption,
  UpdateSchemaColumn,
  updateSchemaColumnProperties,
  updateSchemaColumnRequest,
} from '../../../../../core/schemasColumns/store/actions';
import { SchemaColumnReducer } from '../../../../../core/schemasColumns/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { errorNotification } from '../../../../../shared/system/notifications/store/reducers';
import { getSchemaFromShortListBySchemaId } from '../../../../../shared/utilities/schemaHelpers';
import { formFields } from '../FormFields';

type PathParams = {
  url: string,
  schemaId: string,
  schemaColumnId: string
}

type PropsType = RouteComponentProps<PathParams> & {

  match: any,
  formReducer: SharedFormReducer;
  schemaReducer: SchemaReducerState;
  schemaColumnReducer: SchemaColumnReducer;
  getColumn: (params: GetSchemaColumnById) => void,
  createColumn: (params: CreateSchemaColumn) => void,
  updateColumn: (params: UpdateSchemaColumn) => void,
  deleteColumn: (params: DeleteSchemaColumn) => void,
  initializeForm: any;
  removeOption: (params: any) => void,
  updateProperties: any;
  enablePermissions: any;
  disablePermissions: any;
  notifyError: any;

}

interface State {
  validatorsList: any[],
}


const { Option } = Select;

const uuid = uuidv4();

class SchemaColumnDetailView extends React.Component<PropsType, State> {

  constructor(props: PropsType) {
    super(props);

    this.state = {
      validatorsList: [],
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<State>, snapshot?: any) {

    if(prevProps.schemaColumnReducer.selected !== this.props.schemaColumnReducer.selected) {

      this.renderValidatorOptions(this.props.schemaColumnReducer?.selected?.type);
    }

    if(prevProps.match.schemaColumnId !== this.props.match.schemaColumnId) {

      this.fetchData()

    }

  }

  fetchData() {

    const { match, getColumn } = this.props;

    const schemaId = match.params.schemaId;
    const schemaColumnId = match.params.schemaColumnId;

    getColumn({ schemaId, schemaColumnId })

  }

  renderValidatorOptions(type: any) {

    let validatorsList: any[]
    if(type === undefined) {

      validatorsList = [];

    } else {

      let options: any = [];

      Object.keys(SchemaColumnValidatorTypes).forEach(key => {
        if(!!SchemaColumnValidatorTypes[key].columnTypes.find(t => t === type)) {
          const option: any = SchemaColumnValidatorTypes[key].name;
          options = [ ...options, option ];
        }
      });

      validatorsList = options;

    }

    this.setState({
      validatorsList,
    })

  }

  formRef = React.createRef<FormInstance>();

  resetTable = () => {
    this.formRef.current?.resetFields();
  }

  async handleFormSubmit(params: { event: 'UPDATE' }) {

    const { notifyError, updateColumn, match } = this.props;

    const schemaId = match.params.schemaId;
    const schemaColumnId = match.params.schemaColumnId;

    try {
      if(!!this.formRef.current) {

        await this.formRef.current.validateFields();
        const formErrors = this.formRef.current ? this.formRef.current.getFieldsError() : [];
        const hasErrors = formErrors.filter(({ errors }) => errors.length).length > 0;

        if(hasErrors) {

          return notifyError({
            message: 'form has errors, fix them and resubmit',
            validation: null,
            data: null,
          });

        } else {

          const values = this.formRef.current.getFieldsValue();

          updateColumn({ schemaId, schemaColumnId, body: values });

          setTimeout(() => {
            this.resetTable();
          }, 1000);

        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  deleteColumn() {

    const { deleteColumn, match } = this.props;

    const schemaId = match.params.schemaId;
    const schemaColumnId = match.params.schemaColumnId;

    deleteColumn({ schemaId, schemaColumnId });
  }

  handleValidatorChange = (value: any) => {
    const { updateProperties } = this.props;

    const fieldValues = this.formRef.current?.getFieldsValue();

    updateProperties({
      validators: fieldValues.validators.map((elem: any) => ({ type: elem })),
    })
  }


  renderOptionsList = () => {
    return (
      <Space direction="vertical" style={{ width: '100%', border: '1px solid #d9d9d9', padding: '.5rem' }}>
        <h3>Enum Options</h3>
        {
          this.renderOptionsFields()
        }
      </Space>
    )
  }

  addEnumOption() {

    const { schemaColumnReducer, updateProperties } = this.props;
    const { selected } = schemaColumnReducer;

    const existingOption = selected?.options?.map(elem => ({ id: elem.id, position: elem.position, label: elem.label, value: elem.value }));

    const newOption = {
      value: `OPTION_${existingOption ? existingOption.length + 1 : 1}`,
      label: '',
      id: undefined,
      position: existingOption ? existingOption.length + 1 : 1,
    };

    if(existingOption && existingOption.length > 0) {
      updateProperties({
        options: [
          ...existingOption,
          newOption,
        ],
      })
    } else {

      updateProperties({
        options: [
          newOption,
        ],
      })
    }
  }

  removeEnumOption = (index: number) => {

    const { removeOption } = this.props;

    const fieldValues = this.formRef.current?.getFieldsValue();

    const itemToRemove = fieldValues.options[index];

    removeOption({ value: itemToRemove.value })

  };

  handleEnumOptionChange(e: any, index: number) {

    const { updateProperties } = this.props;

    const fieldValues = this.formRef.current?.getFieldsValue();

    updateProperties({
      options: fieldValues.options,
    })

  }


  enablePermissionsSchemaColumn = () => {
    const { enablePermissions, updateProperties, match } = this.props;

    const schemaId = match.params.schemaId;
    const schemaColumnId = match.params.schemaColumnId;

    enablePermissions({ schemaId, schemaColumnId }, (result: any) => {

      updateProperties({
        permissions: result,
      })

    });

  }

  disablePermissionsSchemaColumn = () => {

    const { disablePermissions, updateProperties, match } = this.props;

    const schemaId = match.params.schemaId;
    const schemaColumnId = match.params.schemaColumnId;

    disablePermissions({ schemaId, schemaColumnId });

    updateProperties({
      permissions: [],
    })

  }

  renderSchemaColumnForm() {

    const { match, schemaReducer, schemaColumnReducer, updateProperties } = this.props;
    const { selected } = schemaColumnReducer;

    const schemaId = match.params.schemaId;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, schemaId);

    this.formRef.current?.setFieldsValue({
      id: selected?.id,
      name: selected?.name,
      type: selected?.type,
      schemaTypeId: selected?.schemaTypeId,
      description: selected?.description,
      isStatic: selected?.isStatic,
      label: selected?.label,
      mapping: selected?.mapping,
      placeholder: selected?.placeholder,
      isHidden: selected?.isHidden,
      defaultValue: selected?.defaultValue,
      isVisibleInTables: selected?.isVisibleInTables,
      isDisabled: selected?.isDisabled,
      isTitleColumn: selected?.isTitleColumn,
      isStatusColumn: selected?.isStatusColumn,
      position: selected?.position,
      columnPosition: selected?.columnPosition,
      validators: selected?.validators?.map(elem => elem.type),
      options: selected?.options?.map(elem => ({ id: elem.id, position: elem.position, label: elem.label, value: elem.value })),
    });

    return (
      <Form layout={'vertical'}
            name="columnsForm"
            initialValues={this.formRef.current?.getFieldsValue()}
            ref={this.formRef}
            style={{ width: '85%', paddingBottom: 50 }}>

        <Row gutter={12}>

          <Col lg={{ span: 12, offset: 7 }} xs={{ span: 24, offset: 2 }}>
            <Form.Item className="form-item" name="id" label="id" key={0} style={{ display: 'none' }}>
              <Input/>
            </Form.Item>
            <Form.Item
              className="form-item"
              name="name"
              label="Name" key={1}
              rules={[
                {
                  required: true,
                  message: 'Please input value',
                },
              ]}
            >
              <Input placeholder="external mapping name" onChange={(e) => updateProperties({ name: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              name="mapping"
              label="Mapping" key={1}
              rules={[]}
            >
              <Input placeholder="external system mapping"
                     onChange={(e) => updateProperties({ mapping: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Schema Type"
              name="schemaTypeId"
              key={5}
              rules={[]}
            >
              <Select
                placeholder="Select type"
                allowClear
                onChange={(e) => {
                  updateProperties({ schemaTypeId: e })
                }}>
                {schema?.types.map((type: any) => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Description"
              name="description"
              key={2}
              rules={[
                {
                  required: true,
                  message: 'Please input value',
                },
              ]}
            >
              <Input placeholder="Description"
                     onChange={(e) => updateProperties({ description: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Label"
              name="label"
              key={3}
              rules={[
                {
                  required: true,
                  message: 'Please input value',
                },
              ]}
            >
              <Input placeholder="Label" onChange={(e) => updateProperties({ label: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Placeholder"
              name="placeholder"
              key={4}
            >
              <Input placeholder="Placeholder"
                     onChange={(e) => updateProperties({ placeholder: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Type"
              name="type"
              key={5}
              rules={[
                {
                  required: true,
                  message: 'Please select',
                },
              ]}
            >
              <Select placeholder="Select type" onChange={(e) => {

                updateProperties({ type: e })
                this.renderValidatorOptions(e)

              }}>
                {SCHEMA_COLUMN_TYPE_KEYS.map((option: any) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {
              selected?.type === 'ENUM' ? this.renderOptionsList() : ''
            }
            <Form.Item
              className="form-item"
              label="Validators"
              name="validators"
              key={6}
              rules={[
                {
                  required: false,
                  message: 'Please select',
                },
              ]}
            >
              {<Select
                mode="multiple"
                placeholder="Select validators"
                onChange={this.handleValidatorChange}
              >
                {
                  this.state.validatorsList.map((elem: any) => (
                    <Select.Option key={elem} value={elem}>
                      {elem}
                    </Select.Option>
                  ))}
              </Select>}
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Default value"
              name="defaultValue"
              key={3}
              rules={[
                {
                  message: 'Please input value',
                },
              ]}
            >
              <Input placeholder="some value" onChange={(e) => updateProperties({ defaultValue: e.target.value })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Position"
              name="position"
              key={7}
              rules={[
                {
                  required: false,
                  message: 'Please input value',
                },
              ]}
            >
              <Input placeholder="Position" type="number"
                     onChange={(e) => updateProperties({ position: parseInt(e.target.value) })}/>
            </Form.Item>
            <Form.Item
              className="form-item"
              label="Column position"
              name="columnPosition"
              key={14}
              rules={[
                {
                  required: false,
                  message: 'Please input value',
                },
              ]}
            >
              <Select
                placeholder="Select column position"
                allowClear
                onChange={(e: number) => updateProperties({ columnPosition: e })}
                >
                  <Option value={1} key={15}>1</Option>
                  <Option value={2} key={16}>2</Option>
              </Select>
            </Form.Item>
            <div className="columns-section-wrapper">

              <Row>
                <Col span={8}>
                  <Form.Item
                    className="form-item"
                    name="isTitleColumn"
                    key={8}
                  >
                    <Checkbox checked={selected?.isTitleColumn}
                              onChange={(e) => updateProperties({ isTitleColumn: e.target.checked })}>Is
                      Title
                      Column</Checkbox>
                  </Form.Item>
                  <Form.Item
                    className="form-item"
                    name="isHidden"
                    key={9}
                  >
                    <Checkbox checked={selected?.isHidden}
                              onChange={(e) => updateProperties({ isHidden: e.target.checked })}>Is
                      Hidden</Checkbox>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    className="form-item"
                    name="isVisibleInTables"
                    key={10}
                  >
                    <Checkbox checked={selected?.isVisibleInTables}
                              onChange={(e) => updateProperties({ isVisibleInTables: e.target.checked })}>Is
                      Visible in Tables</Checkbox>
                  </Form.Item>
                  <Form.Item
                    className="form-item"
                    name="isDisabled"
                    key={11}
                  >
                    <Checkbox checked={selected?.isDisabled}
                              onChange={(e) => updateProperties({ isDisabled: e.target.checked })}>Is
                      Disabled</Checkbox>
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    className="form-item"
                    name="isStatic"
                    key={12}
                  >
                    <Checkbox checked={selected?.isStatic}
                              onChange={(e) => updateProperties({ isStatic: e.target.checked })}>Is
                      Static</Checkbox>
                  </Form.Item>
                  <Form.Item
                    className="form-item"
                    name="isStatusColumn"
                    key={13}
                  >
                    <Checkbox checked={selected?.isStatusColumn}
                              onChange={(e) => updateProperties({ isStatusColumn: e.target.checked })}>Is
                      Status
                      Column</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

            </div>

            <Divider/>

            <div className={selected ? '' : 'columns-section-wrapper'}>
              {
                selected?.permissions && selected.permissions.length > 0 ?
                  <>
                    <Button
                      className="custom-column-button"
                      onClick={() => this.disablePermissionsSchemaColumn()} loading={schemaColumnReducer.isRequesting}>
                      Disable column access control</Button>

                    <Table
                      size="small"
                      pagination={false}
                      dataSource={selected?.permissions}
                      columns={[
                        { title: 'Name', dataIndex: 'name' },
                        { title: 'Description', dataIndex: 'description' },
                      ]}
                      style={{ marginTop: '0.5rem' }}
                    />
                  </> :

                  <Button
                    className="custom-column-button"
                    onClick={() => this.enablePermissionsSchemaColumn()}
                    loading={schemaColumnReducer.isRequesting}>
                    Enable column access control
                  </Button>
              }
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  renderOptionsFields() {

    return (
      <Form.List name="options">
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => (
                <Row key={field.key} gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                  <Col span={12}>
                    <Form.Item
                      name={[ field.name, 'value' ]}
                      fieldKey={[ field.fieldKey, 'value' ]}
                      rules={[ { required: true } ]}
                      label="Value"
                    >
                      <Input placeholder="Value" onChange={(e) => this.handleEnumOptionChange(e, index)}/>
                    </Form.Item>
                  </Col>
                  <Col span={11}>
                    <Form.Item
                      name={[ field.name, 'label' ]}
                      fieldKey={[ field.fieldKey, 'label' ]}
                      rules={[ { required: true } ]}
                      label="Label"
                    >
                      <Input placeholder="Label" onChange={(e) => this.handleEnumOptionChange(e, index)}/>
                    </Form.Item>
                  </Col>
                  <Col span={1} style={{ marginTop: '37px', paddingLeft: '0' }}>
                    <DeleteOutlined
                      className="dynamic-delete-button"
                      onClick={() => {
                        this.removeEnumOption(index);
                      }}
                    />
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    this.addEnumOption()
                  }}
                  style={{ width: '100%' }}
                >
                  <PlusOutlined/> Add Option
                </Button>
              </Form.Item>
            </div>
          )
        }}
      </Form.List>
    )
  }

  showCreateForm() {
    const { initializeForm, schemaReducer, match } = this.props;

    const { schemaId } = match.params;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, schemaId);

    let parsedFormFields = new Array();
    const hasTypes = schema && schema?.types?.length > 0;

    formFields.forEach((field: any) => {

      if(hasTypes && field.property === 'schemaTypeId') {
        field.options = schema?.types?.map(type => ({
          label: type.name,
          value: type.id,
        }))

        parsedFormFields.push(field)
      } else if(!hasTypes && field.property === 'schemaTypeId') {
        // do not add the form field for selecting types
      } else {
        parsedFormFields.push(field)
      }

    })

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Column',
      formFields: parsedFormFields,
      entityName: 'SchemaColumn',
    })

  };

  handleCreateColumnSubmit(params: FormReducerSubmitEvt) {
    const { createColumn, formReducer, match, schemaReducer } = this.props;

    const { schemaId } = match.params;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, schemaId);

    if(schema && params.data && !formReducer.isUpdateReq) {

      const body = {
        name: params.data.name,
        label: params.data.label,
        schemaTypeId: params.data.schemaTypeId,
        description: params.data.description,
        type: SchemaColumnTypes.TEXT,
        position: 0,
      };

      createColumn({ schemaId: schema.id, body })

    }
  }


  render() {

    const { schemaColumnReducer, schemaReducer, match } = this.props;
    const { selected } = schemaColumnReducer;

    const { schemaId } = match.params;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, schemaId);

    return (
      <Layout>

        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleCreateColumnSubmit(params)}/>

        <PageHeader
          className="page-header"
          ghost={false}
          breadcrumbRender={() => <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/SchemaModule/Schema" component={Typography.Link}>Schemas</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to={`/SchemaModule/Schema/${schema?.id}`} component={Typography.Link}>{schema?.entityName}</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {selected?.name}
            </Breadcrumb.Item>
          </Breadcrumb>}
          style={{ marginRight: '0', marginLeft: '0' }}
          extra={[
            <Popconfirm
              title="Are you sure you want to delete column?"
              onConfirm={() => this.deleteColumn()}
              okText="Yes"
              cancelText="No"
            >
              <Button key="1" danger>Delete</Button>
            </Popconfirm>,
            <Button
              key="3"
              type="primary"
              loading={schemaColumnReducer.isRequesting}
              onClick={() => this.handleFormSubmit({ event: 'UPDATE' })}
              style={{ marginLeft: '12px' }}>Save</Button>,
            <Button style={{ marginLeft: '12px' }} key={1} type="primary" onClick={() => this.showCreateForm()}>New
              Column</Button>,
          ]}
        >
          {this.renderSchemaColumnForm()}
        </PageHeader>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({

  formReducer: state.formReducer,
  schemaReducer: state.schemaReducer,
  schemaColumnReducer: state.schemaColumnReducer,

});

const mapDispatch = (dispatch: any) => ({

  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  updateProperties: (params: any) => dispatch(updateSchemaColumnProperties(params)),
  getColumn: (params: GetSchemaColumnById) => dispatch(getSchemaColumnByIdRequest(params)),
  createColumn: (params: CreateSchemaColumn) => dispatch(createSchemaColumnRequest(params)),
  updateColumn: (params: UpdateSchemaColumn) => dispatch(updateSchemaColumnRequest(params)),
  removeOption: (params: any) => dispatch(removeSchemaColumnOption(params)),
  deleteColumn: (params: DeleteSchemaColumn) => dispatch(deleteSchemaColumnRequest(params)),
  enablePermissions: (params: any, cb: any) => dispatch(createSchemaColumnPermissionsRequest(params, cb)),
  disablePermissions: (params: any, cb: any) => dispatch(deleteSchemaColumnPermissionsRequest(params, cb)),
  notifyError: (params: any) => dispatch(errorNotification(params)),

});

export default withRouter(connect(mapState, mapDispatch)(SchemaColumnDetailView));
