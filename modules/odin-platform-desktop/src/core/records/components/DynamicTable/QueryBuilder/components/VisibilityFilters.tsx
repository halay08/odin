import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { Checkbox, Col, Collapse } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../../shared/utilities/schemaHelpers';
import { SchemaReducerState } from '../../../../../schemas/store/reducer';
import { IRecordReducer } from '../../../../store/reducer';
import { addColumnToTable, IAddColumnToTable, removeColumnFromTable } from '../../store/actions';
import { getDataIndexForRecord, getDataIndexForRecordField } from '../helpers/recordFilterParsers';
import { getDataIndexForRelatedRecord, getDataIndexForRelatedRecordField } from '../helpers/relatedRecordFilterParsers';


interface Props {
  moduleName: string | undefined,
  entityName: string | undefined,
  recordReducer: IRecordReducer,
  recordTableReducer: any,
  schemaReducer: SchemaReducerState,
  removeColumn: any,
  addColumn: any,
}

interface State {
  showFilters: boolean,
}

class VisibilityFilters extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      showFilters: false,
    }
  }

  toggleDrawer = () => {
    this.setState({ showFilters: !this.state.showFilters });
  };

  isColumnVisible = (colName: string) => {
    const { recordTableReducer } = this.props;
    return !!recordTableReducer.columns && recordTableReducer.columns.find((col: { [key: string]: any }) => col.dataIndex == colName);
  };

  renderRecordFilterableColumns = () => {
    const { moduleName, entityName, schemaReducer } = this.props;

    if(moduleName && entityName) {

      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

      if(schema) {
        return (
          <Collapse.Panel header={schema.entityName} key="1">
            <Col key="1" span={'24'}>
              {this.renderRecordFieldCheckBox('lastModifiedBy')}
            </Col>
            <Col key="2" span={'24'}>
              {this.renderRecordFieldCheckBox('createdBy')}
            </Col>
            <Col key="3" span={'24'}>
              {this.renderRecordFieldCheckBox('ownedBy')}
            </Col>
            <Col key="4" span={'24'}>
              {this.renderRecordFieldCheckBox('createdAt', SchemaColumnTypes.DATE)}
            </Col>
            {
              schema?.columns?.map(col => (
                <Col key={col.name} span={'24'}>
                  {this.renderRecordPropertyCheckBox(col.name, col.type)}
                </Col>
              ))
            }
          </Collapse.Panel>
        )
      }
    }
  };

  private renderRecordFieldCheckBox(colName: string, colType?: string) {
    return <Checkbox
      key={colName}
      checked={this.isColumnVisible(getDataIndexForRecordField(colName))}
      onChange={
        (e) => !e.target.checked
          ? this.removeRecordFieldColumn(colName)
          : this.addRecordFieldColumn(colName, colType)
      }>
      {colName}
    </Checkbox>
  }

  private removeRecordFieldColumn(colName: string) {
    const { removeColumn } = this.props;
    return removeColumn(getDataIndexForRecordField(colName))
  }

  private addRecordFieldColumn(colName: string, colType?: string) {
    const { addColumn } = this.props;
    addColumn({
      title: colName,
      dataIndex: getDataIndexForRecordField(colName),
      columnType: colType,
    })
  }


  private renderRecordPropertyCheckBox(colName: string, colType: string) {
    return <Checkbox
      key={colName}
      checked={this.isColumnVisible(getDataIndexForRecord(colName))}
      onChange={
        (e) => !e.target.checked
          ? this.removeRecordColumn(colName)
          : this.addRecordColumn(colName, colType)
      }>
      {colName}
    </Checkbox>
  }

  private removeRecordColumn(colName: string) {
    const { removeColumn } = this.props;
    return removeColumn(getDataIndexForRecord(colName))
  }

  private addRecordColumn(colName: string, colType: string) {
    const { addColumn } = this.props;
    addColumn({
      title: colName,
      dataIndex: getDataIndexForRecord(colName),
      columnType: colType,
    })
  }


  renderRelatedRecordFilterableColumns = () => {
    const { moduleName, entityName, schemaReducer } = this.props;

    if(moduleName && entityName) {

      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

      if(schema && schema.associations) {
        const childAssociations = schema.associations.filter(elem => elem.childSchema);

        return (

          childAssociations?.map(association => (
            <Collapse.Panel
              header={association.childSchema.entityName}
              key={association.childSchema.entityName}>

              <Col key={association.childSchema.entityName} span={'24'}>
                {this.renderRelatedRecordFieldCheckBox('title', association.childSchema.entityName)}
              </Col>

              {association.childSchema.columns && association.childSchema.columns.map(col => (
                <Col key={col.name} span={'24'}>
                  {this.renderRelatedRecordPropertyCheckBox(col.name, association.childSchema.entityName, col.type)}
                </Col>
              ))}
            </Collapse.Panel>
          ))
        )
      }
    }
  }

  private renderRelatedRecordFieldCheckBox(colName: string, entityName: string) {
    return <Checkbox
      key={colName} checked={this.isColumnVisible(getDataIndexForRelatedRecordField(
      colName,
      entityName,
    ))}
      onChange={
        (e) => !e.target.checked
          ? this.removeRelatedRecordFieldColumn(colName, entityName)
          : this.addRelatedRecordFieldColumn(colName, entityName)
      }>
      {colName}
    </Checkbox>
  }


  private removeRelatedRecordFieldColumn(colName: string, entityName: string) {
    const { removeColumn } = this.props;
    return removeColumn(getDataIndexForRelatedRecordField(colName, entityName))
  }

  private addRelatedRecordFieldColumn(colName: string, entityName: string) {
    const { addColumn } = this.props;
    addColumn({
      title: colName,
      dataIndex: getDataIndexForRelatedRecordField(colName, entityName),
    })
  }

  private renderRelatedRecordPropertyCheckBox(colName: string, entityName: string, colType: string) {
    return <Checkbox
      key={colName} checked={this.isColumnVisible(getDataIndexForRelatedRecord(
      colName,
      entityName,
    ))}
      onChange={
        (e) => !e.target.checked
          ? this.removeRelatedColumn(colName, entityName)
          : this.addRelatedColumn(colName, entityName, colType)
      }>
      {colName}
    </Checkbox>
  }

  private removeRelatedColumn(colName: string, entityName: string) {
    const { removeColumn } = this.props;
    return removeColumn(getDataIndexForRelatedRecord(colName, entityName))
  }

  private addRelatedColumn(colName: string, entityName: string, colType: string) {
    const { addColumn } = this.props;
    addColumn({
      title: colName,
      dataIndex: getDataIndexForRelatedRecord(colName, entityName),
      columnType: colType,
    })
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Collapse defaultActiveKey={[ '1' ]} ghost>
          {this.renderRecordFilterableColumns()}
          {this.renderRelatedRecordFilterableColumns()}
        </Collapse>
      </div>
    )
  }


}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  addColumn: (params: IAddColumnToTable) => dispatch(addColumnToTable(params)),
  removeColumn: (column: any) => dispatch(removeColumnFromTable(column)),
});

export default connect(mapState, mapDispatch)(VisibilityFilters);
