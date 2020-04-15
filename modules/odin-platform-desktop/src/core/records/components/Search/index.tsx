import { FilterOutlined } from '@ant-design/icons';
import { Input, Typography, Tag, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import {
  getDefaultFields,
  getSavedFilter,
  setSearchQuery,
  setSortQuery,
} from '../../../../shared/utilities/searchHelpers';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { ISearchRecords, resetRecordsList, searchRecordsRequest, setDbRecordSearchQuery } from '../../store/actions';
import { removeFormField,   addFormField, showQueryBuilder, setQueryBuilderDefaultTab } from '../DynamicTable/QueryBuilder/store/actions';
import { IRecordReducer } from '../../store/reducer';
import TableFilterActions from '../DynamicTable/components/TableFilterActions';
import { QueryBuilderReducer } from '../DynamicTable/QueryBuilder/store/reducer';
import { TableReducer } from '../DynamicTable/store/reducer';
import { PlusOutlined } from '@ant-design/icons';
import { PipelineReducerState } from '../../../pipelines/store/reducer';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { getPipelinesByModuleAndEntity } from '../../../pipelines/store/actions';



const { Search } = Input;

interface Props {
  moduleName: string,
  entityName: string,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  queryBuilderReducer: QueryBuilderReducer,
  pipelineReducer: PipelineReducerState,
  searchRecords: any,
  resetRecordState: any,
  setSearchQuery: any,
  noReset?: boolean,
  hideActionButtons?: boolean
  getPipelines: any,
  removeFormField: any,
  addFormField: any,
  showQueryBuilder: any,
  setQueryBuilderDefaultTab: any,
}

class RecordSearch extends React.Component<Props> {

  componentDidMount() {
    const { noReset } = this.props;
    if(!noReset) this.props.resetRecordState();
    this.loadInitialList();
    this.loadPipelineFilters();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.entityName !== this.props.entityName) {
      this.loadInitialList();
    }
    if(prevProps.schemaReducer.isRequesting !== this.props.schemaReducer.isRequesting) {
      this.loadInitialList();
    }
  }

  loadInitialList() {
    const { schemaReducer, recordTableReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

    if(schema && schemaReducer.isSuccessful) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: setSearchQuery(schemaReducer, recordReducer, moduleName, entityName),
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
          boolean: savedFilter?.queries,
        },
      });
    }
  }

  searchRecordOnChange(e: any) {
    const { schemaReducer, recordTableReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

    if(schema && e) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: e.target.value,
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
          boolean: savedFilter?.queries,
        },
      });
    }
  }


  render() {
    const { schemaReducer, recordReducer, moduleName, entityName, hideActionButtons } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '70%', display: 'flex', flexWrap:'wrap' }}>
          {this.filterTags()}
        </div>
        <div>
          {hideActionButtons ? <></> :
            <div style={{ display: 'flex' }}>
              <Search
                className="search-input"
                placeholder="search records"
                value={setSearchQuery(schemaReducer, recordReducer, moduleName, entityName)}
                loading={recordReducer.isRequesting}
                onChange={e => this.searchRecordOnChange(e)}
                onSearch={() => this.loadInitialList()}
              />
              <TableFilterActions schema={schema}/>
            </div>}
        </div>
      </div>
    )
  }

  private loadPipelineFilters() {
    const { getPipelines, schemaReducer, moduleName, entityName } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    console.log('schema', schema);
    if(schema) {
      getPipelines({ schema: schema });
    }

  }

  private removeTag(filter:any){
    this.props.removeFormField(filter.UUID)

  }

  private addNewFilter(){
   this.props.setQueryBuilderDefaultTab({ activeKey:'2' })
   this.props.showQueryBuilder()
   this.props.addFormField()
    
  }

  private getTagName(filter:any){
    if(filter.type === 'property'){
      return `${filter.index===0?'':filter.andOr||'AND '} ${filter.entityName}:${filter.property} ${filter.operator||'='} ${filter.value}`
    }
    return filter
  }

  private filterTags(){
    const { schemaReducer, recordTableReducer, moduleName, entityName, pipelineReducer } = this.props;
    

    const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

    let appliedFilters:any[]=[]
    let stageFiltersString= 'All stages'
    if(savedFilter) {
      appliedFilters=savedFilter.formFields.propertyFilters.map((filter:any, index:number)=> {
        filter.type='property'
        filter.index=index
      return filter})
      if(pipelineReducer?.list?.[0]?.stages){
        const stageFilters:any=pipelineReducer?.list?.[0]?.stages?.filter((stage:any) => savedFilter.formFields.pipelineFilters?.[0]?.value.includes(stage.id))
        const stageFiltersNames = stageFilters?.map((stage:any) => stage.name) 
        savedFilter.formFields.pipelineFilters?.[0]?.value?.forEach((stageId:string) => {
        if(!stageId){
          stageFiltersNames.unshift('All stages')
        }
        })
        stageFiltersString=stageFiltersNames?.join('/')
      }
    }
    const filters=[
      ...appliedFilters]
      if(stageFiltersString) filters.unshift(stageFiltersString)
      
    return (
      <>
    {filters.map((filter, index) => {
     const tag= this.getTagName(filter)
      const isLongTag = tag.length > 30;

          const tagElem = (
            <Tag
              className="filter-tag"
              key={tag}
              closable={filter.type}
              onClose={() => this.removeTag(filter)} 
              style={{marginBottom:15}}
            >
              <span>
                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
              </span>
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}

        <Tag className="site-tag-plus" style={{marginBottom:15}}
        onClick={() => this.addNewFilter() }
        >
          <PlusOutlined /> New Filter
        </Tag>
         </>
    );

  }

  private hasSavedFilters() {
    const { schemaReducer, recordTableReducer, moduleName, entityName } = this.props;
    

    const savedFilter = getSavedFilter(schemaReducer, recordTableReducer, moduleName, entityName);

    if(savedFilter) {
      const appliedFilters=savedFilter.formFields.propertyFilters.map(filter=> `${filter.entityName}:${filter.property}:${filter.value}`)
      if(savedFilter.queries && savedFilter.queries.filter && savedFilter.queries.filter.length > 0 ||
        savedFilter.queries && savedFilter.queries.must && savedFilter.queries.must.length > 0) {
        return <Typography.Text style={{ color: 'orange' }}><FilterOutlined
          style={{ color: 'orange', fontWeight: 'bold' }}/> filters applied</Typography.Text>
      }
    }
  }
}

const mapState = (state: any) => ({
  recordTableReducer: state.recordTableReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  queryBuilderReducer: state.queryBuilderReducer,
  pipelineReducer: state.pipelineReducer,
});

const mapDispatch = (dispatch: any) => ({
  setSearchQuery: (params: ISearchRecords) => dispatch(setDbRecordSearchQuery(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  resetRecordState: () => dispatch(resetRecordsList()),
  addFormField: () => dispatch(addFormField()),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  removeFormField: (UUID: string) => dispatch(removeFormField(UUID)),
  showQueryBuilder: () => dispatch(showQueryBuilder()),
  setQueryBuilderDefaultTab: (params: { activeKey: string })  => dispatch(setQueryBuilderDefaultTab(params)),
});


export default connect(mapState, mapDispatch)(RecordSearch)
