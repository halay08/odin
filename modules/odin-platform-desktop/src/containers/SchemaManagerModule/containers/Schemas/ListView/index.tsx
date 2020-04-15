import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Breadcrumb, Button, PageHeader, Space, Table, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CreateSchema, createSchemaRequest, listSchemasRequest } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { formFields } from '../FormFields';

const { SCHEMA_MODULE } = SchemaModuleTypeEnums;

interface Props {

  formReducer: SharedFormReducer,
  schemaReducer: SchemaReducerState,
  listSchemas: any,
  initializeForm: any;
  createSchema: (params: CreateSchema) => void

}

interface State {

}

const uuid = uuidv4();

class SchemaListView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {

    const { listSchemas } = this.props;
    listSchemas();

  }

  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Schema',
      formFields: formFields,
      entityName: 'Schema',
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createSchema, formReducer } = this.props;

    if(params.data && !formReducer.isUpdateReq) {

      const body = {
        name: params.data.name,
        description: params.data.description,
        moduleName: params.data.moduleName,
        entityName: params.data.entityName,
        assignable: false,
        upsertOnCreate: true,
      };

      createSchema({ body })

    }
  }

  renderSchemaList() {

    const { schemaReducer } = this.props;

    // @ts-ignore
    const moduleFilters = Object.keys(SchemaModuleTypeEnums).map(key => ({ text: SchemaModuleTypeEnums[key as string], value: SchemaModuleTypeEnums[key as string] }));

    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: any, record: any) => (
          <Space size="middle">
            <Link to={`/${SCHEMA_MODULE}/Schema/${record.key}`}>{text}</Link>
          </Space>
        ),
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      },
      {
        title: 'Module',
        dataIndex: 'moduleName',
        key: 'moduleName',
        filters: moduleFilters,
        onFilter: (value: any, record: any) => record.moduleName.indexOf(value) === 0,
        sorter: (a: any, b: any) => a.moduleName.localeCompare(b.moduleName),
      },
      {
        title: 'Entity',
        dataIndex: 'entityName',
        key: 'entityName',
        sorter: (a: any, b: any) => a.entityName.localeCompare(b.entityName),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
      },
    ];

    const dataSource = schemaReducer?.list?.map((elem: SchemaEntity) =>
      ({
        key: elem.id,
        name: elem.name,
        moduleName: elem.moduleName,
        entityName: elem.entityName,
        description: elem.description,
      }),
    ).sort((a: any, b: any) => {
      if(a.name < b.name) {
        return -1;
      }
      if(a.name > b.name) {
        return 1;
      }
      return 0;
    });

    return (
      <div>
        <Table
          size="small"
          scroll={{ y: 'calc(100vh - 240px)' }}
          style={{ minHeight: '100%' }}
          pagination={false} dataSource={dataSource} columns={columns}/>
      </div>
    );
  }

  render() {

    return (
      <>
        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>

        <PageHeader
          style={{ marginTop: 14 }}
          ghost={false}
          breadcrumbRender={() => <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/SchemaModule/Schema" component={Typography.Link}>Schemas</Link>
            </Breadcrumb.Item>
          </Breadcrumb>}
          extra={[
            <Button type="primary" key="1" onClick={() => this.showCreateForm()}>New Schema</Button>,
          ]}
        >

        </PageHeader>

        <div className="detail-body-wrapper">
          {this.renderSchemaList()}
        </div>

      </>
    );
  }
}

const mapState = (state: any) => ({

  schemaReducer: state.schemaReducer,
  formReducer: state.formReducer,

});

const mapDispatch = (dispatch: any) => ({

  listSchemas: (params: any) => dispatch(listSchemasRequest()),
  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createSchema: (params: CreateSchema) => dispatch(createSchemaRequest(params)),

});

export default connect(mapState, mapDispatch)(SchemaListView);
