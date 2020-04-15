import { EditOutlined } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Card, Descriptions, Typography } from 'antd';
import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getBrowserPath } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import OdinFormModal from '../../../records/components/Forms/FormModal';
import { closeRecordForm, initializeRecordForm } from '../../../records/components/Forms/store/actions';
import { FormReducer } from '../../../records/components/Forms/store/reducer';
import { IRecordReducer } from '../../../records/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../store/actions';
import { IRecordAssociationsReducer } from '../../store/reducer';
import ListActionMenu from '../ListActions/ListActionMenu';
import ListItemActionMenu from '../ListActions/ListItemActionMenu';

interface Props {
  title?: string,
  moduleName: string,
  entityName: string,
  propKeys: string[],
  showRecordTitle: boolean,
  record: DbRecordEntityTransform
  recordFormReducer: FormReducer,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: any,
  getAssociations: any,
  initializeForm: any,
  closeForm: any,
  layout?: 'horizontal' | 'vertical',
  formEnabled?: boolean,
  filters?: string[],
  addRecordTitleLink?: boolean,
  disableListActions?: boolean,
  recordKeys?: string[],
  columns?: number,
}

const uuid = uuidv4();

class AssociationCardList extends React.Component<Props> {

  componentDidMount() {
    this.getRecordAssociations();
    this.props.closeForm();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.getRecordAssociations();
    }
    if(prevProps.entityName !== this.props.entityName) {
      this.getRecordAssociations();
    }
  }

  private getRecordAssociations() {
    const { getAssociations, getSchema, moduleName, entityName, record, filters } = this.props;
    if(record) {
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

  private getListActionMenu(
    record: DbRecordEntityTransform,
    entityName: string,
  ): ReactElement {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    if(associationObj && associationObj[entityName]) {
      return <ListActionMenu
        record={record}
        relation={associationObj[entityName]}
        hidden={[]}
      />
    } else {
      return <div/>
    }
  }

  private getListItemActionMenu(
    relatedRecord: DbRecordEntityTransform,
    entityName: string,
  ): any {

    const { record, recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    if(associationObj && associationObj[entityName]) {
      return <ListItemActionMenu
        relatedRecord={relatedRecord}
        record={record}
        relation={associationObj[entityName]}
        hidden={[]}/>;

    } else {
      return <div/>;
    }
  }

  private getListOfRelatedRecordsByEntity(record: DbRecordEntityTransform, entityName: string) {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${record?.id}_${entityName}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    if(associationObj && associationObj[entityName] && associationObj[entityName].dbRecords) {
      return associationObj[entityName].dbRecords;
    } else {
      return undefined;
    }
  }

  /**
   *
   * @param elem
   * @private
   */
  private initializeCreateForm() {
    const { record, schemaReducer, initializeForm, moduleName, entityName } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(
      schemaReducer.shortList,
      moduleName,
      entityName,
    );

    console.log('schema', schema);

    if(schema) {
      console.log('initCreate', schema.name);
      initializeForm({
        showFormModal: true,
        formUUID: uuid,
        isCreateReq: true,
        schema,
        selected: null,
        sections: [
          {
            name: schema.name,
            schema: schema,
            associations: [ { recordId: record?.id, title: record?.title } ],
          },
        ],
        modified: [
          {
            schemaId: schema?.id,
            associations: [
              {
                recordId: record?.id,
              },
            ],
          },
        ],
      });
    }
  }

  private initializeUpdateForm(recordToUpdate: DbRecordEntityTransform) {

    const { schemaReducer, initializeForm, moduleName, entityName } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(
      schemaReducer.shortList,
      moduleName,
      entityName,
    );

    if(schema) {
      initializeForm({
        showFormModal: true,
        formUUID: uuid,
        isUpdateReq: true,
        schema: schema,
        selected: recordToUpdate,
        sections: [ { name: schema.name, schema: schema } ],
      });
    }
  }


  handleAddNewEntry() {
    const { entityName } = this.props;
    return <Button
      type="primary"
      onClick={() => this.initializeCreateForm()}>Add {entityName}</Button>
  }

  renderDescriptionItem(elem: DbRecordEntityTransform, key: string) {
    const { formEnabled } = this.props;
    return <div onClick={() => formEnabled && this.initializeUpdateForm(elem)}>
      {getProperty(elem, key)}
      {formEnabled && <EditOutlined style={{ marginLeft: 10 }}/>}
    </div>;
  }

  renderListTitle(elem: DbRecordEntityTransform) {

    const { showRecordTitle, addRecordTitleLink } = this.props;

    if(showRecordTitle && addRecordTitleLink) {
      return <Link to={getBrowserPath(elem)}
                   component={Typography.Link}>{elem?.recordNumber && !elem?.title ? elem?.recordNumber : elem?.title}</Link>
    } else if(showRecordTitle) {
      // If there is a title show the recordNumber and title
      // else show the record number
      return elem?.title ? `${elem?.recordNumber}- ${elem?.title}` : elem?.recordNumber;
    }
  }

  render() {
    const {
      title,
      record,
      propKeys,
      recordKeys,
      entityName,
      disableListActions,
      layout,
      formEnabled,
      recordFormReducer,
      columns,
    } = this.props;

    return (
      recordFormReducer.showFormModal && recordFormReducer.formUUID === uuid ?
        <div>
          <OdinFormModal formUUID={uuid}
                         onSubmitEvent={(params: { event: string, results: any }) => this.getRecordAssociations()}/>
        </div>
        :
        <Card
          size="small"
          style={{ border: 'none', marginBottom: 16 }}
          title={title || entityName} extra={!disableListActions ? this.getListActionMenu(record, entityName) : <div/>}>
          {this.getListOfRelatedRecordsByEntity(record, entityName) ? this.getListOfRelatedRecordsByEntity(
            record,
            entityName,
          ).map((elem: DbRecordEntityTransform) => (
            <Descriptions
              title={this.renderListTitle(elem)}
              size="small"
              layout={layout}
              column={columns || 1}
              extra={!disableListActions ? this.getListItemActionMenu(elem, entityName) : <div/>}>

              {recordKeys && recordKeys.map(key => (
                <Descriptions.Item label={key}>{elem[key]}</Descriptions.Item>
              ))}
              {propKeys && propKeys.map(key => (
                <Descriptions.Item label={key}>
                  {this.renderDescriptionItem(elem, key)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          )) : formEnabled && this.handleAddNewEntry()}
        </Card>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordFormReducer: state.recordFormReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  closeForm: () => dispatch(closeRecordForm()),
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
});

export default connect(mapState, mapDispatch)(AssociationCardList);
