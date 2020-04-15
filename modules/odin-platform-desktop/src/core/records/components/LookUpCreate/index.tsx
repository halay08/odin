import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Checkbox, Divider, List, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import OdinFormModal from '../../../../core/records/components/Forms/FormModal';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import { getDefaultFields, setSearchQuery, setSortQuery } from '../../../../shared/utilities/searchHelpers';
import { listUsers } from '../../../identity/store/actions';
import { getPipelinesByModuleAndEntity } from '../../../pipelines/store/actions';
import { RecordAssociationsReducer } from '../../../records/auditLogs/store/reducer';
import { TableReducer } from '../../../records/components/DynamicTable/store/reducer';
import RecordSearch from '../../../records/components/Search'
import RecordAssociationSearch from '../../../recordsAssociations/components/Search';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { ISearchRecords, searchRecordsRequest, setDbRecordSearchQuery } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import { initializeRecordForm } from '../Forms/store/actions';

interface Props {
  record?: DbRecordEntityTransform,
  entityName: string,
  moduleName: string,
  recordTableReducer: TableReducer,
  recordAssociationReducer?: RecordAssociationsReducer,
  isNextDisabled?: Function,
  checkboxItemSelect: any,
  getAssociations: any,
  getSchema: any,
  setSchemaAssociationData?: any,
  initializeForm: any,
  getUsers: any,
  getPipelines: any,
  associations?: DbRecordAssociationCreateUpdateDto[]
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  searchRecords: any,
  skipAssociationSelect?: any;
}

interface State {
  selectedItem: any,
  schemaAssociation: any,
  schema: SchemaEntity | undefined,
  premiseSchema: any,
}

const uuid = uuidv4();

class LookUpCreate extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      selectedItem: {},
      schemaAssociation: undefined,
      schema: undefined,
      premiseSchema: undefined,
    }
    this.fetchData();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {

    if(prevProps.entityName !== this.props.entityName) {
      this.fetchData();
    }
  }

  loadInitialList() {
    const { schemaReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: setSearchQuery(schemaReducer, recordReducer, moduleName, entityName),
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
          boolean: undefined,
        },
      });
    }
  }

  fetchData() {

    const { moduleName, record, entityName, getAssociations, getSchema, setSchemaAssociationData } = this.props;

    getSchema({ moduleName: moduleName, entityName: entityName }, (schema: SchemaEntity) => {

      this.setState({ schema: schema });

      if(entityName === 'Premise') {

        getSchema({ moduleName: moduleName, entityName: entityName }, (res: SchemaEntity) => {
          this.setState({
            premiseSchema: res,
          })

          getSchema({ moduleName: moduleName, entityName: 'Address' }, (res: any) => {
            this.loadInitialList();
          })
        })

      } else {

        getAssociations({
          recordId: record?.id,
          key: entityName,
          schema: schema,
          entities: [ entityName ],
        }, (schemaAssociation: any) => {

          this.setState({
            schemaAssociation: schemaAssociation?.results?.[entityName],
          })

          setSchemaAssociationData({ schemaAssociation: schemaAssociation?.results?.[entityName] })

        });
      }
    })
  }

  async initializeCreateForm() {

    const { initializeForm, getUsers, getPipelines, associations } = this.props;

    getUsers();

    if(this.state.schema) {

      getPipelines({ schema: this.state.schema });

      initializeForm({
        formUUID: uuid,
        title: 'Initializing',
        showInitializing: true,
      });

      initializeForm({
        formUUID: uuid,
        title: `Create ${this.state.schema.entityName}`,
        showFormModal: true,
        isCreateReq: true,
        schema: this.state.schema,
        selected: null,
        sections: [ { name: this.state.schema.name, schema: this.state.schema } ],
        modified: [
          {
            schemaId: this.state.schema.id,
            associations: associations,
          },
        ],
      });
    } else {

      return initializeForm({
        title: 'Create',
        showFormModal: true,
      });

    }
  }

  private renderListItemTitle(item: DbRecordEntityTransform) {
    if(item.title && item.recordNumber) {
      return `${item.recordNumber} ${item.title}`;
    } else if(item.title && !item.recordNumber) {
      return item.title;
    }
  }

  addRemoveItem(item: any) {
    const { isNextDisabled, checkboxItemSelect } = this.props;
    this.setState({
      selectedItem: item,
    });
    if(isNextDisabled) {
      isNextDisabled(false);
    }
    checkboxItemSelect(item)
  }

  isChecked(item: any) {
    const { entityName } = this.props;
    if(entityName === 'Premise') {
      if(item?.properties?.id === this.state.selectedItem?.properties?.id) {
        return true
      } else {
        return false
      }
    } else {
      if(item.id === this.state.selectedItem?.id) {
        return true
      } else {
        return false
      }
    }
  }

  renderRelatedRecordsList = () => {
    const { recordAssociationReducer, entityName, recordReducer } = this.props;
    return (
      <>
        <List
          style={{ height: '400px', overflow: 'scroll', width: '100%' }}
          loading={recordAssociationReducer?.isSearching || recordReducer?.isSearching}
          itemLayout="horizontal"
          dataSource={entityName === 'Premise' ? (recordReducer?.list[this.state.premiseSchema?.id] ? recordReducer?.list[this.state.premiseSchema?.id] : []) : recordAssociationReducer?.list}
          renderItem={(item: DbRecordEntityTransform) => (
            <List.Item
              actions={[
                <Checkbox
                  checked={this.isChecked(item) ? true : false}
                  onChange={(e: any) => this.addRemoveItem(item)}>Add</Checkbox>,
              ]}
            >
              <List.Item.Meta
                title={this.renderListItemTitle(item)}
                description={getProperty(item, 'Description')}
              />
              <div>{item.properties.UnitPrice}</div>
            </List.Item>
          )}
        />
      </>
    )
  };

  private handleFormSubmit(params: { event: string, results: DbRecordEntityTransform }) {
    const { skipAssociationSelect } = this.props;
    skipAssociationSelect(params.results);
  }

  render() {
    const { record, entityName, recordAssociationReducer, moduleName } = this.props;
    return (
      <div>
        <OdinFormModal
          formUUID={uuid}
          onSubmitEvent={(params: { event: string, results: any }) => this.handleFormSubmit(params)}/>
        <Row>
          <div style={{ width: '100%' }}>
            {this.state.schemaAssociation !== undefined
              ? <RecordAssociationSearch record={record} relation={this.state.schemaAssociation} hideActions/>
              : (entityName === 'Premise' ?
                <RecordSearch moduleName={moduleName} entityName={entityName} noReset/> : <></>)}
            {recordAssociationReducer?.search !== null && recordAssociationReducer?.search?.terms !== '*' && entityName !== 'Premise' ?
              <Button onClick={() => {
                this.initializeCreateForm()
              }}>Create {entityName}</Button> : <></>}
            <Divider/>
          </div>
          {this.renderRelatedRecordsList()}
        </Row>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  recordAssociationReducer: state.recordAssociationReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  recordTableReducer: state.recordTableReducer,
});

const mapDispatch = (dispatch: any) => ({
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
  setSearchQuery: (params: ISearchRecords) => dispatch(setDbRecordSearchQuery(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
});


export default connect(mapState, mapDispatch)(LookUpCreate);
