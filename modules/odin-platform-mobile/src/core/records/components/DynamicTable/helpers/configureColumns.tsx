import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Space } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import StageNameTag from '../../../../../shared/components/StageNameTag';
import { parseDateAndTimeLocal, parseDateToLocalFormat } from '../../../../../shared/utilities/dateHelpers';
import ListItemActionMenu from '../../../../recordsAssociations/ListActions/ListItemActionMenu';

export interface TableHeaderColumn {
  title: string,
  dataIndex: string,
  position: number,
  columnType?: string,
  isTitleColumn: boolean,
  width?: string | number,
  render?: any
  sorter?: boolean,
}

const renderActions = (
  schema: SchemaEntity | undefined,
  dbRecords: DbRecordEntityTransform[] | undefined,
  text: any,
  record: DbRecordEntityTransform,
  isTitleCol: boolean,
  relatedObj?: { record: DbRecordEntityTransform; relation: DbRecordAssociationRecordsTransform; hidden?: string[] },
) => {

  const excludeAssociationlabels = [ 'Offer__Product' ];

  if(!!dbRecords && dbRecords.length >= 1 && !!schema) {
    // Entity specific conditions
    if([ 'Premise', 'Premise2' ].includes(schema.entityName)) {
      return <Link
        to={`/${schema.moduleName}/${schema.entityName}/${getProperty(record, 'UDPRN')}/${getProperty(
          record,
          'UMPRN',
        )}`}>{text}</Link>
    } else if(schema.entityName === 'Note') {

      return <Link to={`/${schema.moduleName}/${schema.entityName}/${record.id}`}>{text}</Link>
    } else if(record.title) {

      if(relatedObj
        && relatedObj.relation.schemaAssociation.hasColumnMappings
        && isTitleCol
        && relatedObj.relation.schemaAssociation.relationType === 'child') {

        if(!excludeAssociationlabels.includes(relatedObj.relation.schemaAssociation.label as string)) {
          return <Link
            to={`/${schema.moduleName}/related/${schema.entityName}/${record?.dbRecordAssociation?.id}/${record.id}`}>
            {text}</Link>
        } else {
          return text;
        }

      } else if(relatedObj
        && record.dbRecordAssociation
        && isTitleCol
        && record.dbRecordAssociation.relatedAssociationId) {

        if(!excludeAssociationlabels.includes(relatedObj.relation.schemaAssociation.label as string)) {
          return <Link
            to={`/${schema.moduleName}/related/${schema.entityName}/${record?.dbRecordAssociation?.id}/${record.id}`}>
            {text}</Link>
        } else {
          return text;
        }

      } else if(isTitleCol) {

        return <Link to={`/${schema.moduleName}/${schema.entityName}/${record.id}`}>{text}</Link>

      } else {
        return text;
      }
    } else if(isTitleCol) {

      return <Link to={`/${schema.moduleName}/${schema.entityName}/${record.id}`}>{text}</Link>

    } else {
      //TODO:  format data based on schema col types here....
      return text;
    }
  } else {
    return text;
  }
  return undefined;
};


const sortColumns = (col1: SchemaColumnEntity, col2: SchemaColumnEntity) => {
  if(col1.position && col2.position) {
    return col1.position - col2.position;
  } else {
    return 0;
  }
};

export const formatDbRecordListColumns = (
  schema: SchemaEntity | undefined,
  visibleColumns: TableHeaderColumn[],
  dbRecords: DbRecordEntityTransform[] | undefined,
  pipelinesEnabled: boolean | undefined,
  shortListRecord: any,
  relatedObj?: { record: DbRecordEntityTransform; relation: DbRecordAssociationRecordsTransform; hidden?: string[] },
) => {

  const columns = () => {

    // @ts-ignore
    const headerColumns = [];
    if(schema) {

      const standardColumns = [ 'createdAt', 'recordNumber', 'title', 'stage', 'stageName', 'actions', 'type' ];

      // Initialize table with default columns
      if(schema.isSequential) {
        headerColumns.push({
          title: 'record #',
          sorter: true,
          dataIndex: 'recordNumber',
          width: 'auto',
          columnType: 'TEXT',
          position: -3,
          ellipsis: true,
          render: (
            text: string | undefined,
            row: { [x: string]: any, rowRecord: DbRecordEntityTransform },
          ) => renderActions(
            schema,
            dbRecords,
            text,
            row.rowRecord,
            true,
            relatedObj,
          ),
        });
      }

      if(schema.types && schema.types.length > 0) {
        headerColumns.push({
          title: 'Type',
          dataIndex: 'type',
          width: 350,
          position: -1,
          columnType: 'TEXT',
          ellipsis: true,
        });
      }

      if(schema.hasTitle) {
        headerColumns.push({
          title: 'Title',
          sorter: true,
          dataIndex: 'title',
          width: 350,
          position: -4,
          columnType: 'TEXT',
          ellipsis: true,
          render: (
            text: string | undefined,
            row: { [x: string]: any, rowRecord: DbRecordEntityTransform },
          ) => renderActions(
            schema,
            dbRecords,
            text,
            row.rowRecord,
            true,
            relatedObj,
          ),
        });
      }

      if(pipelinesEnabled) {
        headerColumns.push({
          title: 'stage',
          sorter: true,
          dataIndex: 'stageName',
          width: 'auto',
          columnType: 'TEXT',
          position: -2,
          ellipsis: true,
          render: (text: string | undefined, row: { [x: string]: any, rowRecord: DbRecordEntityTransform }) =>
            <StageNameTag text={text} record={row.rowRecord}/>,
        });
      }

      // parse visible columns from the list view and exclude the standard columns

      if(visibleColumns) {
        for(const col of visibleColumns) {

          if(standardColumns.includes(col.dataIndex) === false) {
            headerColumns.push({
              sorter: col.columnType != null,
              title: col.title,
              dataIndex: col.dataIndex,
              width: 'auto',
              columnType: col.columnType,
              position: col.position + 1,
              ellipsis: true,
              render: (text: string | undefined, row: { [x: string]: any, rowRecord: DbRecordEntityTransform }) => {
                if(col.columnType === SchemaColumnTypes.DATE) {
                  return parseDateToLocalFormat(text)
                } else if(col.columnType === SchemaColumnTypes.DATE_TIME) {
                  return parseDateAndTimeLocal(text)
                } else {
                  return renderActions(
                    schema,
                    dbRecords,
                    text,
                    row.rowRecord,
                    col.isTitleColumn,
                  )
                }
              },
            });
          }
        }
      }

      headerColumns.push({
        title: 'created',
        dataIndex: 'createdAt',
        width: 'auto',
        columnType: 'DATE_TIME',
        position: 99998,
        ellipsis: true,
        sorter: true,
        render: (text: string | undefined) => (parseDateToLocalFormat(text)),
      });

      if(schema.entityName !== 'Premise' && relatedObj) {
        headerColumns.push({
          sorter: true,
          title: 'actions',
          dataIndex: 'actions',
          width: 100,
          ellipsis: true,
          position: 99999,
          render: (text: string | undefined, row: { [x: string]: any, rowRecord: DbRecordEntityTransform }) => (
            <Space size="middle">
              {/*<a onClick={() => shortListRecord({ showPreview: true, record: row.record })}>view</a>*/}
              <ListItemActionMenu
                relatedRecord={row.rowRecord}
                record={relatedObj.record}
                relation={relatedObj.relation}
                hidden={relatedObj.hidden}/>
            </Space>
          ),
        });
      }

    }

    // @ts-ignore
    return headerColumns.sort(sortColumns);
  };

  return (
    columns()
  );
};

