import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Col, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import WorkOrderCancellationWorkflow
  from '../../../../containers/FieldServiceModule/containers/WorkOrder/WorkOrderCancelModal';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { listUsers } from '../../../identity/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { getRecordByIdRequest, IGetRecordById } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import OdinFormModal from '../Forms/FormModal';
import { initializeRecordForm } from '../Forms/store/actions';
import { getPipelineByStageIdRequest, getPipelinesByModuleAndEntity, IPipelineByStageId } from './store/actions';
import { PipelineReducerState } from './store/reducer';

interface Props {
  recordReducer: IRecordReducer;
  pipelineReducer: PipelineReducerState;
  schemaReducer: SchemaReducerState;
  record: DbRecordEntityTransform;
  initializeForm: any,
  getPipeline: any,
  getRecord: any,
  getPipelines: any,
  getUsers: any,
}

interface State {
  pipeline: PipelineEntity | undefined,
  confirmRouteChange: boolean,
  redirectUrl: string,
  redirectMessage: string | undefined
}

const uuid = uuidv4();

class WorkOrderSurveyStageButtons extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      pipeline: undefined,
      confirmRouteChange: false,
      redirectUrl: '',
      redirectMessage: undefined,
    }
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if(prevProps.recordReducer.isRequesting !== this.props.recordReducer.isRequesting) {
      this.fetchData();
    }
  }

  private fetchData() {
    const { record, getPipeline, schemaReducer, pipelineReducer } = this.props;
    if(record && !pipelineReducer.isRequesting) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
      if(record && record.stage) {
        getPipeline({ schema, stageId: record.stage.id }, (res: PipelineEntity) => {
          this.setState({
            pipeline: res,
          });
        });
      }
    }
  }

  private handleStageSelected(stageId?: string | null | undefined) {
    const { record, initializeForm, schemaReducer, getUsers, getPipelines } = this.props;
    console.log('stageId', stageId);
    if(record && stageId) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
      if(schema) {

        getUsers();
        getPipelines({ schema: schema });

        initializeForm({
          formUUID: uuid,
          title: `Update ${schema.entityName}`,
          showFormModal: true,
          isUpdateReq: true,
          schema: schema,
          selected: record,
          sections: [ { name: schema.name, schema: schema } ],
          visibleFieldOverride: [ {} ],
          disabledFields: [ {} ],
          nextStageId: stageId,
          modified: [
            {
              schemaId: schema.id,
              stageId: stageId,
              ragStatus: 0,
            },
          ],
        });
      }
    }
  };


  render() {
    const { record } = this.props;

    const inProgress = this.state.pipeline?.stages?.find((elem: PipelineStageEntity) => elem.key === 'WorkOrderStageSurveyInProgress');
    const done = this.state.pipeline?.stages?.find((elem: PipelineStageEntity) => elem.key === 'WorkOrderStageSurveyComplete');
    const cancelled = this.state.pipeline?.stages?.find((elem: PipelineStageEntity) => elem.key === 'WorkOrderStageCancelled');

    return (
      <>
        <OdinFormModal
          formUUID={uuid}
          onSubmitEvent={(params: { event: string, results: any }) => console.log(params)}/>

        <Row gutter={18} style={{ marginBottom: 16, marginTop: 16 }}>
          <Col span={8}>
            <Button
              type="primary"
              disabled={record?.stage?.isSuccess || record?.stage?.isFail || record?.stage?.key === 'WorkOrderStageSurveyInProgress'}
              style={{ width: '100%' }}
              onClick={() => this.handleStageSelected(inProgress?.id)}>In Progress</Button>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              disabled={record?.stage?.isSuccess || record?.stage?.isFail}
              style={{ width: '100%' }}
              onClick={() => this.handleStageSelected(done?.id)}>Done</Button>
          </Col>
          <Col span={8}>
            <WorkOrderCancellationWorkflow record={record} stage={cancelled}/>
          </Col>
        </Row>
      </>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  pipelineReducer: state.pipelineReducer,
});

const mapDispatch = (dispatch: any) => ({
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getPipeline: (params: IPipelineByStageId, cb: any) => dispatch(getPipelineByStageIdRequest(params, cb)),
  getRecord: (payload: IGetRecordById) => dispatch(getRecordByIdRequest(payload)),
});

export default connect(mapState, mapDispatch)(WorkOrderSurveyStageButtons);

