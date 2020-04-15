import { LoadingOutlined } from '@ant-design/icons';
import { PipelineEntity } from '@d19n/models/dist/schema-manager/pipeline/pipeline.entity';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Radio, Select, Spin } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getPipelinesByModuleAndEntity, setPipelineReducerState } from '../../../../../pipelines/store/actions';
import { PipelineReducerState } from '../../../../../pipelines/store/reducer';
import { SchemaReducerState } from '../../../../../schemas/store/reducer';
import { TableReducer } from '../../store/reducer';
import {
  setSearchQuery,
  resetQueryBuilderState,
  setQueryBuilderFormFields,
  setQueryBuilderState,
} from '../store/actions';
import { QueryBuilderReducer } from '../store/reducer';

const { Option } = Select;

interface Props {
  schema: SchemaEntity | undefined,
  schemaReducer: SchemaReducerState,
  pipelineReducer: PipelineReducerState,
  queryBuilderReducer: QueryBuilderReducer,
  recordTableReducer: TableReducer,
  setBuilderState: any,
  getPipelines: any,
  setPipelineState: any,
  configure: any,
}

const sortColumns = (stage1: PipelineStageEntity, stage2: PipelineStageEntity) => {
  if(stage1.position && stage2.position) {
    return stage1.position - stage2.position;
  } else {
    return 0;
  }
};
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin/>;

class PipelineFilters extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isAllSelected: false,
    }
  }

  componentDidMount(): void {
    this.loadSavedQueries();
    this.loadPipelineFilters();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if(prevProps.schema !== this.props.schema) {
      this.loadPipelineFilters();
    }
    if(prevProps.pipelineReducer.isRequesting !== this.props.pipelineReducer.isRequesting) {
      this.loadSavedQueries();
    }
  }

  private loadPipelineFilters() {
    const { getPipelines, schema } = this.props;
    if(schema) {
      getPipelines({ schema: schema });
    }
  }

  private loadSavedQueries() {
    const { setBuilderState } = this.props;
    const savedFilter = this.getSavedFilter();

    if(!!savedFilter) {
      setBuilderState({
        formFields: savedFilter.formFields,
      });
      if(savedFilter.formFields.pipelineFilters) {
        const filter = savedFilter.formFields.pipelineFilters[0];
        if(filter) {
          this.applyFilters(filter.value);
          this.selectedPipelineFromStageId(filter.value);
        }
      }
    }
  }

  private getSavedFilter() {
    const { schema, recordTableReducer } = this.props;
    if(schema) {
      const name = `${schema.moduleName}_${schema.entityName}_filter`;
      const filter = recordTableReducer.listViews ? recordTableReducer.listViews[name] : undefined;
      if(!!filter && filter.queryBuilder) {
        return filter.queryBuilder;
      }
    }
  }

  private selectedPipelineFromStageId(stageId: string | null | undefined) {
    const { pipelineReducer, setPipelineState } = this.props;
    if(stageId) {
      const pipeline = pipelineReducer.list.find((elem: PipelineEntity) => elem.stages && elem.stages.find(elem => elem.id === stageId));
      setPipelineState({ selected: pipeline });
    }
  }

  private isStageActive(elem: PipelineStageEntity) {
    const { queryBuilderReducer } = this.props;
    if(queryBuilderReducer.formFields.pipelineFilters) {
      if(queryBuilderReducer.formFields.pipelineFilters.find(field => field.value === elem.id)) {
        return 'filter-active';
      }
    }
  }

  private renderStageFilterOptions() {
    const { pipelineReducer } = this.props;
    return <Radio.Group value='medium'>
      {pipelineReducer.selected && pipelineReducer.selected.stages ? pipelineReducer.selected.stages.sort((
        stage1: PipelineStageEntity,
        stage2: PipelineStageEntity,
      ) => sortColumns(
        stage1,
        stage2,
      )).map((elem: PipelineStageEntity) => (
        <Radio.Button
          onClick={(e: any) => this.applyFilters(e.target.value)}
          className={this.isStageActive(elem)}
          value={elem.id}
        >{elem.name}</Radio.Button>
      )) : (
        <Radio.Button value="#">{pipelineReducer.isRequesting ?
          <Spin indicator={antIcon}/> : 'All Pipelines & Stages'}</Radio.Button>
      )}
    </Radio.Group>;
  };

  private applyFilters(stageId: string | null | undefined) {
    const { configure, schema, queryBuilderReducer, setBuilderState } = this.props;
    const formFields = queryBuilderReducer.formFields;
    let queries = [];
    if(stageId) {
      const pipelineFilter = {
        esPropPath: 'stage.id',
        condition: 'must',
        value: stageId,
      };
      queries.push(pipelineFilter);
      // add pipeline filters and property filters
      setBuilderState({
        formFields: {
          pipelineFilters: [ pipelineFilter ],
          propertyFilters: formFields.propertyFilters,
        },
      });
    } else {
      // set the state to the default and remove pipeline filters
      setBuilderState({ formFields: { pipelineFilters: [], propertyFilters: formFields.propertyFilters } });
    }
    formFields.propertyFilters.map(elem => queries.push(elem));
    configure({ schema: schema, query: queries, queryType: 'query_string' });
  }

  render() {
    const { pipelineReducer } = this.props;
    return (
      pipelineReducer.list.length > 0 &&
      <div className="query-builder">
          <div className={`pipeline-wrapper`}>
            {this.renderStageFilterOptions()}
          </div>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  queryBuilderReducer: state.queryBuilderReducer,
  pipelineReducer: state.pipelineReducer,
  recordTableReducer: state.recordTableReducer,
});
const mapDispatch = (dispatch: any) => ({
  reset: () => dispatch(resetQueryBuilderState()),
  setBuilderState: (params: QueryBuilderReducer) => dispatch(setQueryBuilderState(params)),
  configure: (params: any) => dispatch(setSearchQuery(params)),
  setFormFields: (params: any) => dispatch(setQueryBuilderFormFields(params)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  setPipelineState: (params: PipelineReducerState) => dispatch(setPipelineReducerState(params)),
});
export default connect(mapState, mapDispatch)(PipelineFilters);
