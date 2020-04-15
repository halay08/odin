import { EditOutlined } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Card, Descriptions, Empty, Typography } from 'antd';
import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getBrowserPath, getRelatedRecordBrowserPath } from '../../../../shared/utilities/recordHelpers';
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
  moduleName: string,
  entityName: string,
  propKeys: string[],
  showRecordTitle: boolean,
  formEnabled?: boolean,
  record: DbRecordEntityTransform
  recordFormReducer: FormReducer,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: any,
  getAssociations: any,
  initializeForm: any,
  closeForm: any,
  // optional
  hasColumnMappings?: boolean
  title?: string,
  listKey?: string,
  addRecordTitleLink?: boolean,
  disableListActions?: boolean,
  layout?: 'horizontal' | 'vertical',
  filters?: string[],
  recordKeys?: string[],
  column?: number
}

const uuid = uuidv4();

class AssociationDescriptionList extends React.Component<Props> {

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
    const { getAssociations, getSchema, moduleName, entityName, record, filters, listKey } = this.props;
    if(record) {
      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: listKey || entityName,
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
    const { recordAssociationReducer, listKey } = this.props;
    const associationKey = `${record?.id}_${listKey || entityName}`;
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

    if(schema) {
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
    const { entityName, title } = this.props;
    return <div>
      <Descriptions
        title={title}>
      </Descriptions>

      <Button
        type="primary"
        onClick={() => this.initializeCreateForm()}>Add {entityName}</Button>
    </div>
  }

  renderDescriptionItem(elem: DbRecordEntityTransform, key: string) {
    const { formEnabled } = this.props;
    return <div onClick={() => formEnabled && this.initializeUpdateForm(elem)}>
      {getProperty(elem, key)}
      {formEnabled && <EditOutlined style={{ marginLeft: 10 }}/>}
    </div>;
  }

  renderListTitle(elem: DbRecordEntityTransform) {

    const { showRecordTitle, addRecordTitleLink, hasColumnMappings } = this.props;

    if(showRecordTitle && addRecordTitleLink) {
      if(hasColumnMappings) {
        return <Link to={getRelatedRecordBrowserPath(elem, elem.dbRecordAssociation)}
                     component={Typography.Link}>{elem?.title}</Link>;
      } else {
        return <Link to={getBrowserPath(elem)} component={Typography.Link}>{elem?.title}</Link>;
      }
    } else if(showRecordTitle) {
      // If there is a title show the recordNumber and title
      // else show the record number
      if(elem?.recordNumber) {
        return elem?.title ? `${elem?.recordNumber}- ${elem?.title}` : elem?.recordNumber;
      } else {
        return elem?.title;
      }
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
      column,
    } = this.props;

    return (
      <>
        <div className="association-card-list-wrapper">
          <Card title={entityName} size="small">
            <OdinFormModal
              formUUID={uuid}
              onSubmitEvent={(params: { event: string, results: any }) => this.getRecordAssociations()}/>
            {this.getListOfRelatedRecordsByEntity(record, entityName) ? this.getListOfRelatedRecordsByEntity(
              record,
              entityName,
            ).map((elem: DbRecordEntityTransform) => (
              <Descriptions
                key={elem.id}
                title={title}
                size="small"
                layout={layout}
                column={column ? column : 1}
                extra={!disableListActions ? this.getListItemActionMenu(elem, entityName) : <div/>}>
                {recordKeys && recordKeys.map((key: string) => (
                  <div key={key}>
                    {key === 'title' ?
                      this.renderListTitle(elem)
                      : <Descriptions.Item label={key}>{elem[key]}</Descriptions.Item>
                    }
                  </div>

                ))}
                {propKeys && propKeys.map(key => (
                  <Descriptions.Item label={key} key={key}>
                    {this.renderDescriptionItem(elem, key)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            )) : formEnabled ? this.handleAddNewEntry() : <Descriptions
              title={title}
              size="small"
              layout={layout}
              column={column ? column : 1}>
              <Empty/>
            </Descriptions>}
          </Card>
        </div>
      </>
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

export default connect(mapState, mapDispatch)(AssociationDescriptionList);
