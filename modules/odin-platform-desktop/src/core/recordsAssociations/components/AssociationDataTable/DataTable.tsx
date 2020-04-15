import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { Card, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import {
  getElasticSearchKeysFromSchemaColumn,
  getSchemaFromShortListByModuleAndEntity,
} from '../../../../shared/utilities/schemaHelpers';
import { formatDbRecordListColumns } from '../../../records/components/DynamicTable/helpers/configureColumns';
import { formatDbRecordListData } from '../../../records/components/DynamicTable/helpers/configureRows';
import { addRecordToShortList, IAddRecordToShortList, updateRecordByIdRequest } from '../../../records/store/actions';
import { IRecordReducer } from '../../../records/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../store/actions';
import { IRecordAssociationsReducer } from '../../store/reducer';
import FileManagerOverview from '../FileManagerOverview/FileManagerOverview';
import ListActionMenu from '../ListActions/ListActionMenu';
import './styles.scss'


interface Props {
  title?: string,
  expandable?: any,
  moduleName: string,
  entityName: string,
  record: DbRecordEntityTransform,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: any,
  updateRecord: any,
  getAssociations: any,
  shortListRecord: any,
  hidden?: string[],
  filters?: string[],
  isCreateHidden?: boolean,
  customActionOverride?: boolean
}


class AssociationDataTable extends React.Component<Props> {

  timer: NodeJS.Timeout | undefined;

  componentDidMount() {
    this.timer = undefined;

    if(!this.timer) {

      this.timer = setInterval(() => this.getRecordAssociations(), 5000);

    }

    this.getRecordAssociations();
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.record !== this.props.record && !this.props.recordAssociationReducer.isRequesting) {
      this.getRecordAssociations();
    }
  }

  clearTimer() {
    //@ts-ignore
    clearInterval(this.timer)
    this.timer = undefined;
  }

  private getRecordAssociations() {
    const { getAssociations, schemaReducer, getSchema, moduleName, entityName, record, filters } = this.props;
    if(record) {

      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

      if(schema) {

        getAssociations({
          recordId: record.id,
          key: entityName,
          schema,
          entities: [ entityName ],
          filters,
        });

      } else {

        getSchema({ moduleName, entityName }, (result: SchemaEntity) => {

          getAssociations({
            recordId: record.id,
            key: entityName,
            schema: result,
            entities: [ entityName ],
            filters,
          });

        });

      }
    }
  }

  parseDataSource(records: DbRecordEntityTransform[]) {
    const { schemaReducer, moduleName, entityName } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const hasPipelines = [
      'WorkOrder',
      'Order',
      'ReturnOrder',
      'Lead',
      'Account',
      'Program',
      'Project',
      'Milestone',
      'Task',
      'Subtask',
    ].includes(entityName);


    let data = records;
    // sort data on Position column
    if(entityName === 'Task') {

      data = data.sort((recA, recB) => Number(getProperty(recA, 'Position')) - Number(getProperty(recB, 'Position')));

    }

    const { tableRows } = formatDbRecordListData(schema, data, hasPipelines);
    return tableRows;
  }

  parseColumns(
    records: DbRecordEntityTransform[],
    relation: DbRecordAssociationRecordsTransform,
    schemaTypeId?: string,
  ) {

    const { record, schemaReducer, moduleName, entityName, shortListRecord, hidden } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    const hasPipelines = [
      'WorkOrder',
      'Order',
      'ReturnOrder',
      'Lead',
      'Account',
      'Program',
      'Project',
      'Milestone',
      'Task',
      'Subtask',
    ].includes(entityName);

    if(schema && schema.columns) {

      const filteredColumns = schema.columns.filter(elem => elem.schemaTypeId === schemaTypeId || !elem.schemaTypeId);

      const schemaFiltered = Object.assign({}, schema, { columns: filteredColumns });

      const defaultColumns = getElasticSearchKeysFromSchemaColumn(schema, schemaTypeId);

      return formatDbRecordListColumns(schemaFiltered, defaultColumns, records, hasPipelines, shortListRecord, {
        record,
        relation,
        hidden,
      });
    }
  }

  hasData() {
    const { record, entityName, recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {
      return true;
    } else {
      return false
    }
  }


  associationDataTableInCard(
    title: string,
    relation: DbRecordAssociationRecordsTransform,
    data: DbRecordEntityTransform[],
    schemaType?: SchemaTypeEntity,
  ) {

    const { expandable, record, hidden, isCreateHidden, customActionOverride } = this.props;

    return (<div className="association-data-table-wrapper">
      <Card
        className="association-table-card"
        size="small"
        title={title}
        extra={
          <ListActionMenu
            record={record}
            relation={relation}
            hidden={hidden}
            isCreateHidden={isCreateHidden}
            schemaType={schemaType}
            customActionOverride={customActionOverride}
          />}
      >
        {data ?
          <Table
            size="small"
            tableLayout="auto"
            expandable={expandable}
            pagination={false}
            dataSource={this.parseDataSource(data)}
            columns={this.parseColumns(data, relation, schemaType?.id)}
          />
          :
          <Table
            size="small"
            pagination={false}
            dataSource={[]}
            columns={[]}/>
        }
      </Card>
    </div>)
  }


  render() {
    const { title, record, moduleName, entityName, schemaReducer, recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(entityName === 'File') {

      if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {

        return (
          <FileManagerOverview
            files={associationObj[entityName].dbRecords}
            dataSource={this.parseDataSource(associationObj[entityName].dbRecords)}
            columns={this.parseColumns(associationObj[entityName].dbRecords, associationObj[entityName])}
          />
        )

      } else {
        return <></>
      }

    } else {

      // for schema types we want to render the lists grouped by type

      if(schema && schema.types && schema.types.length > 0) {

        const recordTypes = associationObj && associationObj[entityName] && associationObj[entityName].dbRecords ? associationObj[entityName].dbRecords.map(
          (elem: DbRecordEntityTransform) => elem.type) : [];


        const filtered = schema.types.filter(elem => recordTypes.includes(elem.name));

        const relation = associationObj && associationObj[entityName];
        const data = associationObj && associationObj[entityName] && associationObj[entityName].dbRecords;

        if(associationObj && associationObj[entityName] && !associationObj[entityName].dbRecords) {
          return (
            this.associationDataTableInCard(
              `${entityName}`,
              relation,
              [],
              undefined,
            )
          )
        }

        return filtered.map((elem: SchemaTypeEntity) => (

          this.associationDataTableInCard(
            `${entityName} (${elem.name})`,
            relation,
            data.filter((record: DbRecordEntityTransform) => record.type === elem.name),
            elem,
          )

        ))

      } else {

        const relation = associationObj && associationObj[entityName];
        const data = associationObj && associationObj[entityName] && associationObj[entityName].dbRecords;

        return this.associationDataTableInCard(title || entityName, relation, data)

      }
    }
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  shortListRecord: (params: IAddRecordToShortList) => dispatch(addRecordToShortList(params)),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  updateRecord: (params: any, cb: any) => dispatch(updateRecordByIdRequest(params, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(AssociationDataTable);
