import { IGetSchemaById } from '@d19n/models/dist/rabbitmq/rabbitmq.interfaces';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Space, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getSchemaByIdRequest } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { CreateSchemaColumn, createSchemaColumnRequest } from '../../../../../core/schemasColumns/store/actions';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { formFields } from '../FormFields';

const { SCHEMA_MODULE } = SchemaModuleTypeEnums;

interface Props {

  schema: SchemaEntity | undefined;
  formReducer: SharedFormReducer;
  schemaReducer: SchemaReducerState;
  initializeForm: any;
  createColumn: (params: CreateSchemaColumn) => void
  getSchema: any;

}

interface State {

}

const uuid = uuidv4();

class SchemaColumnListView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {

    const { getSchema, schema } = this.props;

    if(schema) {
      getSchema({ schemaId: schema.id });
    }

  }

  showCreateForm() {
    const { initializeForm, schemaReducer, schema } = this.props;

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

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createColumn, schema, formReducer } = this.props;

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

  renderSchemaTypeName(col: SchemaColumnEntity) {
    const { schema } = this.props;

    if(schema && schema.types && schema.types.length > 0) {

      const typeMatch = schema.types.find(type => type.id === col.schemaTypeId);

      if(typeMatch) {
        return typeMatch.name
      }

    }
  }


  renderSchemaColumns() {
    const { schema, schemaReducer } = this.props;

    // @ts-ignore
    const typeFilters = Object.keys(SchemaColumnTypes).map(key => ({ text: SchemaColumnTypes[key as string], value: SchemaColumnTypes[key as string] }));

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        sorter: (a: any, b: any) => a?.name.localeCompare(b?.name),
        render: (text: any, record: any) => (
          <Space size="middle">
            <Link to={`/${SCHEMA_MODULE}/SchemaColumn/${schema?.id}/${record.key}`}>{text}</Link>
          </Space>
        ),
      },
      {
        title: 'Mapping',
        dataIndex: 'mapping',
        key: 'mapping',
        sorter: (a: any, b: any) => a.mapping ? a?.mapping.localeCompare(b?.mapping) : 0,
      },
      {
        title: 'Label',
        dataIndex: 'label',
        key: 'label',
        sorter: (a: any, b: any) => a?.label.localeCompare(b?.label),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: 'Schema Type',
        dataIndex: 'schemaType',
        key: 'schemaType',
        sorter: (a: any, b: any) => a?.label ? a?.schemaType?.localeCompare(b?.schemaType) : 0,
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        filters: typeFilters,
        onFilter: (value: any, record: any) => record.type.indexOf(value) === 0,
        sorter: (a: any, b: any) => a?.type?.localeCompare(b?.type),
      },
      {
        title: 'Default',
        dataIndex: 'defaultValue',
        key: 'defaultValue',
        sorter: (a: any, b: any) => a?.defaultValue ? a?.defaultValue.localeCompare(b?.defaultValue) : 0,
      },
      {
        title: 'Position',
        dataIndex: 'position',
        key: 'position',
        sorter: (a: any, b: any) => a?.position - b?.position,
      },
      {
        title: 'Is Hidden',
        dataIndex: 'isHidden',
        key: 'isHidden',
        render: (text: any, record: any) => String(text),
      },
      {
        title: 'Visible In Tables',
        dataIndex: 'isVisibleInTables',
        key: 'isVisibleInTables',
        render: (text: any, record: any) => String(text),
      },
      {
        title: 'Is Title',
        dataIndex: 'isTitleColumn',
        key: 'isTitleColumn',
        render: (text: any, record: any) => String(text),
      },
    ];

    const dataSource = schema?.columns?.map((elem: SchemaColumnEntity) =>
      ({
        key: elem.id,
        name: elem.name,
        type: elem.type,
        label: elem.label,
        mapping: elem.mapping,
        schemaType: this.renderSchemaTypeName(elem),
        description: elem.description,
        defaultValue: elem.defaultValue,
        position: elem.position,
        isHidden: elem.isHidden,
        isVisibleInTables: elem.isVisibleInTables,
        isTitleColumn: elem.isTitleColumn,
      }),
    ).sort((a: any, b: any) => a.name.localeCompare(b.name));

    return (
      <Card
        size="small"
        bordered={false}
        title={<h2>Columns</h2>}
        extra={[
          <Button key={1} type="primary" onClick={() => this.showCreateForm()}>New Column</Button>,
        ]}>

        <Table
          size="small"
          loading={schemaReducer.isRequesting}
          scroll={{ y: 'calc(100vh - 350px)' }}
          style={{ minHeight: '100%' }}
          pagination={false}
          dataSource={dataSource}
          columns={columns}/>

      </Card>
    );
  }

  render() {
    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>

        {this.renderSchemaColumns()}
      </>
    );
  }
}

const mapState = (state: any) => ({

  schemaReducer: state.schemaReducer,
  formReducer: state.formReducer,

});

const mapDispatch = (dispatch: any) => ({

  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createColumn: (params: CreateSchemaColumn) => dispatch(createSchemaColumnRequest(params)),
  getSchema: (payload: IGetSchemaById, cb: any) => dispatch(getSchemaByIdRequest(payload, cb)),

});

export default connect(mapState, mapDispatch)(SchemaColumnListView);
