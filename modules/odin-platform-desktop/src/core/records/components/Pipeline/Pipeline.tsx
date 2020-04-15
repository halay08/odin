import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Modal, Radio } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import history from '../../../../shared/utilities/browserHisory';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { listUsers } from '../../../identity/store/actions';
import {
  getPipelineByStageIdRequest,
  getPipelinesByModuleAndEntity,
  IPipelineByStageId,
} from '../../../pipelines/store/actions';
import { PipelineReducerState } from '../../../pipelines/store/reducer';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { getRecordByIdRequest, IGetRecordById } from '../../store/actions';
import { UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../store/constants';
import { IRecordReducer } from '../../store/reducer';
import OdinFormModal from '../Forms/FormModal';
import { initializeRecordForm } from '../Forms/store/actions';
import { renderDisabledFields } from './disableFields';
import { renderVisibleFormFields } from './filterVisibleFields';

interface Props {
  recordReducer: IRecordReducer;
  pipelineReducer: PipelineReducerState;
  schemaReducer: SchemaReducerState;
  className: string;
  record: DbRecordEntityTransform;
  initializeForm: any,
  getPipeline: any,
  getRecord: any,
  getPipelines: any,
  getUsers: any,
  redirectRules?: { [key: string]: { redirectUrl: string, redirectMessage?: string, } },
  stageKey?: string,
  overrideInitializeFormOnFail?: (elem: PipelineStageEntity) => any
}

interface State {
  pipeline: PipelineEntity | undefined,
  confirmRouteChange: boolean,
  redirectUrl: string,
  redirectMessage: string | undefined
}

const uuid = uuidv4();

class Pipeline extends React.Component<Props, State> {

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

  private configurePipelineState(elem: PipelineStageEntity) {
    const { record } = this.props;

    if(record && record.stage ? record.stage.id === elem.id : false) {
      return 'current-stage';
    } else if(record && record.stage && record.stage.position > elem.position) {
      return 'past-stage';
    }
  }

  private handleStageSelected(elem: PipelineStageEntity) {
    const { record, initializeForm, schemaReducer, getUsers, getPipelines, overrideInitializeFormOnFail } = this.props;

    if(record) {

      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

      if(!!record && schema) {

        if(overrideInitializeFormOnFail && elem.isFail) {
          return overrideInitializeFormOnFail(elem)
        }

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
          visibleFieldOverride: renderVisibleFormFields(elem),
          disabledFields: renderDisabledFields(elem),
          nextStageId: elem.id,
          modified: [
            {
              schemaId: schema.id,
              stageId: elem.id,
            },
          ],
        });

      }

    }
  };

  private handleFormSubmit(params: { event: string, results: any }) {
    const { getRecord, record, schemaReducer, redirectRules } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    switch (params.event) {
      case UPDATE_DB_RECORD_BY_ID_REQUEST:

        if(redirectRules && params.results && redirectRules[params.results.stage.key]) {

          const redirectUrl = redirectRules[params.results.stage.key]['redirectUrl'];
          const redirectMessage = redirectRules[params.results.stage.key]['redirectMessage'];
          this.setState({
            confirmRouteChange: true,
            redirectUrl,
            redirectMessage,
          });

        } else {
          getRecord({ schema, recordId: params.results.id });
        }
    }
  }

  private sortColumns(stage1: PipelineStageEntity, stage2: PipelineStageEntity) {
    if(stage1.position && stage2.position) {
      return stage1.position - stage2.position;
    } else {
      return 0;
    }
  };

  render() {
    const { className, record } = this.props;
    const { pipeline, confirmRouteChange, redirectUrl, redirectMessage } = this.state;
    return (
      <>
        {/*Confirm redirecting */}
        <Modal
          title="Redirect Confirmation"
          visible={confirmRouteChange}
          onOk={() => history.push(redirectUrl)}
          onCancel={() => this.setState({ confirmRouteChange: false, redirectUrl: '' })}
          okText="Yes"
          cancelText="No"
        >
          <p>{redirectMessage || 'You are about to be redirected to a new page,would you would like to proceed?'}</p>
        </Modal>

        <div className={`pipeline-wrapper ` + className}>
          <OdinFormModal formUUID={uuid}
                         onSubmitEvent={(params: { event: string, results: any }) => this.handleFormSubmit(params)}/>
          <Radio.Group value='medium'>
            {pipeline && pipeline.stages ? pipeline.stages.sort((
              stage1: PipelineStageEntity,
              stage2: PipelineStageEntity,
            ) => this.sortColumns(
              stage1,
              stage2,
            )).map((elem: PipelineStageEntity) => (
              <Radio.Button
                disabled={record?.stage?.isFail}
                className={this.configurePipelineState(elem)}
                onClick={(e) => this.handleStageSelected(elem)}
                value={elem.id}
              >{elem.name}</Radio.Button>
            )) : (
              <Radio.Button value="#">No data</Radio.Button>
            )}
          </Radio.Group>
        </div>
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

export default connect(mapState, mapDispatch)(Pipeline);

