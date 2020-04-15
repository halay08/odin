import { DeleteOutlined } from '@ant-design/icons';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { Button, Card, Popconfirm, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateSchemaType,
  createSchemaTypeRequest,
  DeleteSchemaType,
  deleteSchemaTypeRequest,
} from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { formFields } from '../FormFields';


interface Props {

  schema: SchemaEntity | undefined;
  schemaReducer: SchemaReducerState;
  formReducer: SharedFormReducer;
  initializeForm: any;
  createType: (params: CreateSchemaType) => void;
  deleteType: (params: DeleteSchemaType) => void;

}

const uuid = uuidv4();

class SchemaTypesList extends React.Component<Props> {


  constructor(props: Props) {
    super(props);
  }

  showCreateForm() {

    const { schema, initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Schema Type',
      formFields: formFields,
      entityName: 'SchemaType',
      pipelineId: schema?.id,
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createType, schema, formReducer } = this.props;

    if(schema && params.data && !formReducer.isUpdateReq) {

      const body = {
        schemaId: schema?.id,
        name: params.data.name,
        label: params.data.label,
        description: params.data.description,
        isDefault: params.data.isDefault,
      };

      createType({ schemaId: schema.id, body })

    }
  }

  handleDelete(typeId: string) {
    const { schema, deleteType } = this.props;

    if(schema) {

      deleteType({ schemaId: schema?.id, schemaTypeId: typeId })

    }
  }


  render() {

    const { schema } = this.props;

    const columns = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Label', dataIndex: 'label' },
      { title: 'Description', dataIndex: 'description' },
      { title: 'Is Default', dataIndex: 'isDefault', render: (text: any) => String(text) },
      {
        title: '',
        dataIndex: 'operation',
        render: (text: any, record: any) => (
          <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
            <DeleteOutlined/>
          </Popconfirm>
        ),
      },
    ];

    const data = schema?.types?.map((type: SchemaTypeEntity) => ({

      key: type.id,
      name: type.name,
      description: type.description,
      label: type.label,
      isDefault: type.isDefault,

    }));

    return (
      <>

        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>

        <Card
          size="small"
          bordered={false}
          title={<h2>Types</h2>}
          extra={[
            <Button
              key="1"
              style={{ marginLeft: 'auto' }}
              onClick={() => this.showCreateForm()}
              type="primary"
              disabled={!schema}
            >
              Add Type
            </Button>,
          ]}>

          <Table
            size="small"
            bordered={false}
            pagination={false}
            dataSource={data}
            columns={columns}
          />

        </Card>
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
  createType: (params: CreateSchemaType) => dispatch(createSchemaTypeRequest(params)),
  deleteType: (params: DeleteSchemaType) => dispatch(deleteSchemaTypeRequest(params)),

});

export default connect(mapState, mapDispatch)(SchemaTypesList);
