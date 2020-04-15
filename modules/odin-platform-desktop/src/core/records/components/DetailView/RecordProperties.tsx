import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnEntity } from '@d19n/models/dist/schema-manager/schema/column/schema.column.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { Descriptions, Empty } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { changeToCapitalCase } from '../../../../shared/utilities/dataTransformationHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { SchemaReducerState } from '../../../schemas/store/reducer';

interface Props {
  schemaReducer: SchemaReducerState,
  record: DbRecordEntityTransform | undefined,
  columns?: number,
  columnLayout?: 'horizontal' | 'vertical'
}

class RecordProperties extends React.Component<Props> {

  renderListItemContent() {
    const { record, columns, columnLayout } = this.props;

    if(record && record.properties) {
      return <Descriptions column={columns || 4} layout={columnLayout || 'vertical'} size="small">
        {Object.keys(record?.properties).map(elem => (
          this.renderDescriptionItemSimple(elem, getProperty(record, elem))
        ))}
      </Descriptions>
    } else {
      return <Empty/>
    }
  }

  private renderDescriptionItemSimple(key: string, value: any) {
    // temp way to exclude columns in the UI.. needs to be dynamic from schema columns
    if(value && ![ 'Coordinates' ].includes(key)) {
      return <Descriptions.Item key={key} label={changeToCapitalCase(key)}>{this.renderValue(
        key,
        value,
      )}</Descriptions.Item>
    }
  }

  private renderValue(key: string, value: any) {
    const { record, schemaReducer } = this.props;

    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);

    if(schema) {

      const column = schema.columns.find((elem: SchemaColumnEntity) => elem.name === key);
      switch (column?.type) {

        case SchemaColumnTypes.FILE_SINGLE:
          return <img style={{ height: 150, width: 150 }} src={value}/>;
          break;
        case SchemaColumnTypes.ENUM:
          // For enum values we want to show the label instead of the value
          const option = column.options.find((opt: SchemaColumnOptionEntity) => opt.value === value);

          if(option) {

            return option.label;

          } else {

            return value;

          }

        default:
          return value;

      }
    }

    return value;
  }

  render() {
    return (
      this.renderListItemContent()
    )
  }

}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
});


export default connect(mapState)(RecordProperties);
