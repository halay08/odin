import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Descriptions, Layout, Popconfirm } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { constantCase } from 'change-case';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  CreatePipeline,
  createPipelineRequest,
  DeletePipeline,
  deletePipelineByIdRequest,
  getPipelinesByModuleAndEntity,
} from '../../../../../core/pipelines/store/actions';
import { PipelineReducerState } from '../../../../../core/pipelines/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../shared/components/FormModal/store/reducer';
import { formFields } from '../FormFields';
import PipelineStagesList from '../Stages/ListView';

interface Props {

  schema: SchemaEntity | undefined;
  formReducer: SharedFormReducer;
  pipelineReducer: PipelineReducerState;
  initializeForm: any;
  getPipeline: any;
  deletePipeline: (params: DeletePipeline) => void
  createPipeline: (params: CreatePipeline) => void

}

const uuid = uuidv4();

class SchemaPipelineDetailView extends React.Component<Props> {

  formRef = React.createRef<FormInstance>();

  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    const { getPipeline, schema } = this.props;

    getPipeline({ schema });

  }


  showCreateForm() {

    const { initializeForm } = this.props;

    initializeForm({
      formUUID: uuid,
      title: 'Create Pipeline',
      showModal: true,
      formFields: formFields,
      entityName: 'Pipeline',
      isUpdateReq: false,
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { schema, createPipeline, formReducer } = this.props;

    // Create the pipeline
    if(schema && params.data && !formReducer.isUpdateReq) {


      const body = {
        name: params.data.name,
        key: params.data.key,
        description: params.data.description,
        // @ts-ignore
        moduleName: SchemaModuleTypeEnums[constantCase(schema?.moduleName) as string],
        entityName: schema.entityName,
      };


      createPipeline({ body })

    }
  }

  handleDeletePipeline() {
    const { pipelineReducer, deletePipeline } = this.props;

    const pipeline = pipelineReducer?.selected;

    if(pipeline) {

      deletePipeline({ pipelineId: pipeline.id })

    }
  }


  renderPipelineSection() {

    const { pipelineReducer } = this.props;

    const pipeline = pipelineReducer?.selected;

    if(pipeline) {

      this.formRef.current?.setFieldsValue({
        id: pipeline.id,
        name: pipeline.name,
        description: pipeline.description,
        moduleName: pipeline.moduleName,
        entityName: pipeline.entityName,
      });
    }

    return (
      <Card size="small" title={<h2>Details</h2>} extra={[
        <Popconfirm
          title="Are you sure to delete this pipeline?"
          onConfirm={() => this.handleDeletePipeline()}
          onCancel={() => console.log('cancelled')}
          okText="Yes"
          cancelText="No"
        >
          <Button
            key="2"
            style={{ width: 'auto' }}
            disabled={pipeline?.stages?.length > 1}
            danger>
            Delete
          </Button>
        </Popconfirm>,
      ]}>

        {!pipeline ?
          <Button
            key="1"
            style={{ width: 'auto' }}
            onClick={() => this.showCreateForm()}
            type="primary"
          >
            Add Pipeline
          </Button>
          :
          <Descriptions column={1}>
            <Descriptions.Item label="Name">{pipeline.name}</Descriptions.Item>
            <Descriptions.Item label="Description">{pipeline.description}</Descriptions.Item>
          </Descriptions>
        }
      </Card>
    );
  }

  render() {

    const { schema } = this.props

    return (
      <Layout className="record-detail-view">

        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>

        {this.renderPipelineSection()}

        <PipelineStagesList schema={schema}/>

      </Layout>
    );
  }
}

const mapState = (state: any) => ({
  formReducer: state.formReducer,
  pipelineReducer: state.pipelineReducer,
});

const mapDispatch = (dispatch: any) => ({
  getPipeline: (params: any) => dispatch(getPipelinesByModuleAndEntity(params)),
  createPipeline: (params: CreatePipeline) => dispatch(createPipelineRequest(params)),
  deletePipeline: (params: DeletePipeline) => dispatch(deletePipelineByIdRequest(params)),
  initializeForm: (params: SharedFormReducer) => dispatch(initializeSharedForm(params)),
});

export default connect(mapState, mapDispatch)(SchemaPipelineDetailView);
