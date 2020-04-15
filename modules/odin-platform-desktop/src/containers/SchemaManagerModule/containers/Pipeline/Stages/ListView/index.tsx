import { DeleteOutlined } from '@ant-design/icons';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Card, Popconfirm, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  CreatePipelineStage,
  createPipelineStageRequest,
  DeletePipelineStage,
  deletePipelineStageRequest,
} from '../../../../../../core/pipelines/store/actions';
import { PipelineReducerState } from '../../../../../../core/pipelines/store/reducer';
import FormModal, { FormReducerSubmitEvt } from '../../../../../../shared/components/FormModal/FormModal';
import { initializeSharedForm } from '../../../../../../shared/components/FormModal/store/actions';
import { SharedFormReducer } from '../../../../../../shared/components/FormModal/store/reducer';
import { formFields } from '../FormFields';


interface Props {

  schema: SchemaEntity | undefined;
  pipelineReducer: PipelineReducerState;
  formReducer: SharedFormReducer;
  initializeForm: any;
  createStage: (params: any) => void;
  deleteStage: (params: any) => void;

}

const uuid = uuidv4();

class PipelineStagesList extends React.Component<Props> {


  constructor(props: Props) {
    super(props);
  }

  showCreateForm() {

    const { pipelineReducer, initializeForm } = this.props;

    initializeForm({
      showModal: true,
      formUUID: uuid,
      title: 'Create Stage',
      formFields: formFields,
      entityName: 'Stage',
      pipelineId: pipelineReducer?.selected?.id,
    })

  };

  handleFormSubmit(params: FormReducerSubmitEvt) {
    const { createStage, schema, pipelineReducer, formReducer } = this.props;

    const pipeline = pipelineReducer?.selected;

    // Create the pipeline
    if(params.data && !formReducer.isUpdateReq) {


      const body = {
        name: params.data.name,
        key: params.data.key,
        description: params.data.description,
        isDefault: params.data.isDefault,
        isFail: params.data.isFail,
        isSuccess: params.data.isSuccess,
      };

      createStage({ pipelineId: pipeline?.id, schema, body })

    }
  }

  handleDelete(stageId: string) {
    const { pipelineReducer, schema, deleteStage } = this.props;

    const pipeline = pipelineReducer?.selected;

    if(pipeline) {

      deleteStage({ pipelineId: pipeline?.id, schema, stageId })

    }
  }


  render() {

    const { pipelineReducer } = this.props;

    const columns = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Key', dataIndex: 'stageKey' },
      { title: 'Stage Description', dataIndex: 'description' },
      { title: 'Position', dataIndex: 'position' },
      { title: 'Is Default', dataIndex: 'isDefault', render: (text: any) => String(text) },
      { title: 'Is Success', dataIndex: 'isSuccess', render: (text: any) => String(text) },
      { title: 'Is Fail', dataIndex: 'isFail', render: (text: any) => String(text) },
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

    const data = pipelineReducer?.selected?.stages?.map((stage: PipelineStageEntity) => ({

      key: stage.id,
      name: stage.name,
      stageKey: stage.key,
      description: stage.description,
      position: stage.position,
      isDefault: stage.isDefault,
      isSuccess: stage.isSuccess,
      isFail: stage.isFail,

    }));

    return (
      <>

        <FormModal
          formUUID={uuid}
          onSubmitEvent={(params: FormReducerSubmitEvt) => this.handleFormSubmit(params)}/>

        <Card
          style={{ marginTop: 24 }}
          size="small"
          title={<h2>Stages</h2>}
          extra={[
            <Button
              key="1"
              style={{ marginLeft: 'auto' }}
              onClick={() => this.showCreateForm()}
              type="primary"
              disabled={!pipelineReducer?.selected}
            >
              Add Stage
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

  pipelineReducer: state.pipelineReducer,
  formReducer: state.formReducer,

});

const mapDispatch = (dispatch: any) => ({

  initializeForm: (params: any) => dispatch(initializeSharedForm(params)),
  createStage: (params: CreatePipelineStage) => dispatch(createPipelineStageRequest(params)),
  deleteStage: (params: DeletePipelineStage) => dispatch(deletePipelineStageRequest(params)),

});

export default connect(mapState, mapDispatch)(PipelineStagesList);
