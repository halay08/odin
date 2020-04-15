import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { SchemaAssociationEntity } from '@d19n/models/dist/schema-manager/schema/association/schema.association.entity';
import { SchemaAssociationCardinalityTypes } from '@d19n/models/dist/schema-manager/schema/association/types/schema.association.cardinality.types';
import { Button, Col, Layout, Popconfirm, Row, Space, Table, Typography } from 'antd';
import { constantCase } from 'change-case';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { listSchemasRequest } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import {
  CreateSchemaAssociation,
  createSchemaAssociationRequest,
  DeleteSchemaAssociation,
  deleteSchemaAssociationsRequest,
  GetAssociationBySchemaId,
  getSchemaAssociationsRequest,
  UpdateSchemaAssociation,
  updateSchemaAssociationRequest,
} from '../../../../../core/schemasAssociations/store/actions';
import { SchemaAssociationReducer } from '../../../../../core/schemasAssociations/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { createFormFields, editFormFields } from '../FormFields';

interface Props {

  schema: any,
  formReducer: SharedFormReducer,
  schemaReducer: SchemaReducerState,
  schemaAssociationReducer: SchemaAssociationReducer
  initializeForm: any,
  listSchemas: any,
  getSchemaAssociations: any,
  createAssociation: (params: CreateSchemaAssociation) => void
  updateAssociation: (params: UpdateSchemaAssociation) => void
  deleteAssociation: (params: DeleteSchemaAssociation) => void

}

const uuid = uuidv4();

class SchemaAssociationsListView extends React.Component<Props> {

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.fetchData();
    this.fetchAssociations();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {

    if(prevProps.schema !== this.props.schema) {
      this.fetchAssociations();
    }
  }

  fetchData() {

    const { listSchemas } = this.props;
    listSchemas();

  }

  fetchAssociations() {
    const { getSchemaAssociations, schema } = this.props;

    if(schema) {
      getSchemaAssociations({ schemaId: schema.id })
    }
  }


  createAssociation() {
    const { initializeForm, schemaReducer } = this.props;

    let tempArr = new Array();

    createFormFields.forEach((element: any) => {

      if(element.property === 'childSchemaId' || element.property === 'findInSchema' || element.property === 'findInChildSchema') {
        element.options = schemaReducer.list.map(elem => ({
          label: elem.name,
          value: elem.id,
        }))
      }

      tempArr.push(element)

    })

    initializeForm({
      formUUID: uuid,
      showModal: true,
      title: 'Create Association',
      formFields: tempArr,
      entityName: 'SchemaAssociation',
      isUpdateReq: false,
    })

  };

  handleDelete(associationId: string) {
    const { schema, deleteAssociation } = this.props;

    if(schema) {

      deleteAssociation({ schemaId: schema?.id, associationId })

    }
  }

  handleEdit(record: any) {
    const { initializeForm, schemaReducer } = this.props;

    let editForm = new Array();

    editFormFields.forEach((element: any) => {

      if(element.property === 'childSchemaId' || element.property === 'findInSchema' || element.property === 'findInChildSchema') {

        element.options = schemaReducer.list.map(elem => ({
          label: elem.name,
          value: elem.id,
        }))

      }

      if(element.property === 'childSchemaId') {

        editForm.push({
          label: element.label,
          property: element.property,
          type: element.type,
          isRequired: element.isRequired,
          message: element.message,
          isHidden: element.isHidden,
          initialValue: record.childSchema.id,
          value: record.childSchema.id,
          options: element.options,
          isDisabled: element.isDisabled,
          allowClear: element.allowClear,
        })

      } else {

        editForm.push({
          label: element.label,
          property: element.property,
          type: element.type,
          isRequired: element.isRequired,
          message: element.message,
          isHidden: element.isHidden,
          initialValue: record[element.property],
          value: record[element.property],
          options: element.options,
          isDisabled: element.isDisabled,
          allowClear: element.allowClear,
        })

      }
    })

    initializeForm({
      formUUID: uuid,
      title: 'Edit Association',
      recordId: record.id,
      showModal: true,
      formFields: editForm,
      saveData: {
        // add any properties that should be set even if the user does not update
        childSchemaId: record.childSchema.id,
      },
      entityName: 'SchemaAssociation',
      isUpdateReq: true,
    })
  }

  renderSchemaColumnFromSchemaId(schemaId: any) {
    const { schemaReducer } = this.props;

    const selected = schemaReducer.list.find((elem: any) => elem.id === schemaId);

    if(selected !== undefined) {

      const label = schemaReducer.list.find((elem: any) => elem.id === schemaId)?.name;

      return <Link to={`/SchemaModule/Schema/${schemaId}`} component={Typography.Link}>{label}</Link>

    } else {
      return ''
    }
  }

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { schema, createAssociation, updateAssociation, formReducer } = this.props;

    // Create request
    if(schema && params.data && !formReducer.isUpdateReq) {

      const body = {
        childSchemaId: params.data.childSchemaId,
        findInSchema: params.data.findInSchema,
        findInChildSchema: params.data.findInChildSchema,
        childActions: params.data.childActions,
        parentActions: params.data.parentActions,
        cascadeDeleteChildRecord: params.data.cascadeDeleteChildRecord,
        hasColumnMappings: params.data.hasColumnMappings,
        // @ts-ignore
        type: SchemaAssociationCardinalityTypes[constantCase(params.data.type) as string],
      };

      createAssociation({ schemaId: schema?.id, body })

    } else if(schema && params.data && formReducer.isUpdateReq) {

      const body = {
        childSchemaId: params.data.childSchemaId,
        findInSchema: params.data.findInSchema,
        findInChildSchema: params.data.findInChildSchema,
        childActions: params.data.childActions,
        parentActions: params.data.parentActions,
        cascadeDeleteChildRecord: params.data.cascadeDeleteChildRecord,
        hasColumnMappings: params.data.hasColumnMappings,
        getUrl: params.data.getUrl,
        postUrl: params.data.postUrl,
        putUrl: params.data.putUrl,
        deleteUrl: params.data.deleteUrl,
        position: params.data.position,
        // @ts-ignore
        type: SchemaAssociationCardinalityTypes[constantCase(params.data.type) as string],
      };

      updateAssociation({ schemaId: schema?.id, associationId: String(formReducer.recordId), body })

    }
  }


  render() {
    const { schemaAssociationReducer } = this.props;

    const childTableColumns = [
      { title: 'Label', dataIndex: 'label' },
      {
        title: 'Child Association',
        dataIndex: 'childSchema',
        render: (text: any, record: SchemaAssociationEntity) => {
          return (
            <Link
              to={`/SchemaModule/Schema/${record?.childSchema?.id}`}
              component={Typography.Link}>{record?.childSchema?.name}</Link>
          )
        },
      },
      { title: 'Association Type', dataIndex: 'type' },
      {
        title: 'Find in Schema',
        dataIndex: 'findInSchema',
        render: (text: any) => {
          return this.renderSchemaColumnFromSchemaId(text)
        },
      },
      {
        title: 'Find in Child Schema',
        dataIndex: 'findInChildSchema',
        render: (text: any) => {
          return this.renderSchemaColumnFromSchemaId(text)
        },
      },
      { title: 'Child Actions', dataIndex: 'childActions' },
      { title: 'Parent Actions', dataIndex: 'parentActions' },
      {
        title: 'Cascade Delete Child Record',
        dataIndex: 'cascadeDeleteChildRecord',
        render: (data: any) => {
          if(data) {
            return 'true';
          } else {
            return 'false';
          }
        },
      },
      {
        title: 'Has Column Mappings',
        dataIndex: 'hasColumnMappings',
        render: (data: any) => {
          if(data) {
            return 'true';
          } else {
            return 'false';
          }
        },
      },
      { title: 'Position', dataIndex: 'position' },
      {
        title: '',
        dataIndex: 'operation',
        render: (text: any, record: any) => (
          <EditOutlined onClick={() => this.handleEdit(record)}/>
        ),
      },
      {
        title: '',
        dataIndex: 'operation',
        render: (text: any, record: any) => (
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
            <DeleteOutlined/>
          </Popconfirm>
        ),
      },
    ];

    const parentTableColumns = [
      { title: 'Label', dataIndex: 'label' },
      {
        title: 'Parent Association',
        dataIndex: 'parentSchema',
        render: (text: any, record: any) => {
          return <Link to={`/SchemaModule/Schema/${record.parentSchema.id}`}
                       component={Typography.Link}>{record.parentSchema.name}</Link>
        },
      },
      { title: 'Association Type', dataIndex: 'type' },
      {
        title: 'Find in Schema',
        dataIndex: 'findInSchema',
        render: (data: any) => {
          return this.renderSchemaColumnFromSchemaId(data)
        },
      },
      {
        title: 'Find in Child Schema',
        dataIndex: 'findInChildSchema',
        render: (text: any, record: any) => {
          return this.renderSchemaColumnFromSchemaId(text)
        },
      },
      { title: 'Child Actions', dataIndex: 'childActions' },
      { title: 'Parent Actions', dataIndex: 'parentActions' },
      {
        title: 'Cascade Delete Child Record',
        dataIndex: 'cascadeDeleteChildRecord',
        render: (data: any) => {
          if(data) {
            return 'true';
          } else {
            return 'false';
          }
        },
      },
      {
        title: 'Has Column Mappings',
        dataIndex: 'hasColumnMappings',
        render: (data: any) => {
          if(data) {
            return 'true';
          } else {
            return 'false';
          }
        },
      },
      { title: 'Position', dataIndex: 'position' },
    ];

    return (
      <Layout className="record-detail-view">

        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>

        <Row>
          <Space>
            <h2>Child Associations</h2>
          </Space>

          <Button
            key="1"
            style={{ marginLeft: 'auto' }}
            onClick={() => this.createAssociation()}
            type="primary"
          >
            New
          </Button>

          <Col span={24}>
            <Table
              size="small"
              dataSource={schemaAssociationReducer?.childAssociations}
              columns={childTableColumns}
              loading={schemaAssociationReducer.isRequesting}
            />
          </Col>
        </Row>
        <Row>
          <Space>
            <h2>Parent Associations</h2>
          </Space>
          <Col span={24}>
            <Table
              size="small"
              dataSource={schemaAssociationReducer?.parentAssociations}
              columns={parentTableColumns}
              loading={schemaAssociationReducer.isRequesting}
            />
          </Col>
        </Row>
      </Layout>
    );
  }
}

const mapState = (state: any) => ({

  formReducer: state.formReducer,
  schemaReducer: state.schemaReducer,
  schemaAssociationReducer: state.schemaAssociationReducer,

});

const mapDispatch = (dispatch: any) => ({

  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  listSchemas: () => dispatch(listSchemasRequest()),
  getSchemaAssociations: (params: GetAssociationBySchemaId) => dispatch(getSchemaAssociationsRequest(params)),
  createAssociation: (params: CreateSchemaAssociation) => dispatch(createSchemaAssociationRequest(params)),
  updateAssociation: (params: UpdateSchemaAssociation) => dispatch(updateSchemaAssociationRequest(params)),
  deleteAssociation: (params: DeleteSchemaAssociation) => dispatch(deleteSchemaAssociationsRequest(params)),

});

export default connect(mapState, mapDispatch)(SchemaAssociationsListView);
