import { EditOutlined } from '@ant-design/icons';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Card, Collapse, Descriptions, Spin, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getBrowserPath } from '../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../shared/utilities/schemaHelpers';
import EmbeddedMobileForm from '../../records/components/Forms/EmbeddedMobileForm';
import { closeRecordForm, initializeRecordForm } from '../../records/components/Forms/store/actions';
import { FormReducer } from '../../records/components/Forms/store/reducer';
import { IRecordReducer } from '../../records/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../schemas/store/actions';
import { SchemaReducerState } from '../../schemas/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../store/actions';
import { IRecordAssociationsReducer } from '../store/reducer';

const { Panel } = Collapse;

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {

  title?: string,
  moduleName: string,
  entityName: string,
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
  propKeys: string[],
  layout?: 'horizontal' | 'vertical',
  formEnabled?: boolean,
  filters?: string[],
  addRecordTitleLink?: boolean,
  disableListActions?: boolean,
  recordKeys?: string[],
  columns?: number,

}

const uuid = uuidv4();

class AssociationCardList extends React.Component<PropsType> {

  componentDidMount() {
    this.getRecordAssociations();
    this.props.closeForm();
  }

  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<{}>, snapshot?: any) {
    if(prevProps.record !== this.props.record) {
      this.getRecordAssociations();
    }
    if(prevProps.entityName !== this.props.entityName) {
      this.getRecordAssociations();
    }
  }

  private getRecordAssociations() {
    const { getAssociations, getSchema, moduleName, entityName, record } = this.props;
    if(record) {
      getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
        getAssociations({
          recordId: record.id,
          key: entityName,
          schema: result,
          entities: [ entityName ],
        });
      });
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
      console.log('initUpdate', schema.name);
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
      return <Link to={getBrowserPath(elem)} component={Typography.Link}>{elem?.title}</Link>
    } else if(showRecordTitle) {
      return elem?.title;
    }
  }

  render() {
    const { record, propKeys, recordKeys, entityName, moduleName, layout, formEnabled, recordFormReducer, recordAssociationReducer } = this.props;

    return (
      recordFormReducer.showFormModal && recordFormReducer.formUUID === uuid ?
        <div>
          <EmbeddedMobileForm
            formUUID={uuid}
            moduleName={moduleName}
            entityName={entityName}
            onSubmitEvent={() => {
              this.getRecordAssociations();
            }}/>
        </div>
        :
        <Card title={entityName} style={{ minWidth: 360 }}>
          {this.getListOfRelatedRecordsByEntity(record, entityName) ? this.getListOfRelatedRecordsByEntity(
            record,
            entityName,
          ).map((elem: DbRecordEntityTransform) => (
            recordAssociationReducer?.isRequesting ?
              <Spin/> :
              <div>
                <Descriptions title={this.renderListTitle(elem)} size="small" layout={layout} column={1}>
                  {recordKeys && recordKeys.map(key => (
                    <Descriptions.Item label={key}>{elem[key]}</Descriptions.Item>
                  ))}
                </Descriptions>
                {[ 'Contact', 'Address' ].includes(entityName) ?
                  <Collapse ghost>
                    <Panel header="Expand for details" key="1">
                      {propKeys && propKeys.map(key => (
                        <Descriptions size="small" layout={layout} column={1}>
                          <Descriptions.Item label={key}>
                            {this.renderDescriptionItem(elem, key)}
                          </Descriptions.Item>
                        </Descriptions>
                      ))}
                    </Panel>
                  </Collapse> :
                  <div>
                    {propKeys && propKeys.map(key => (
                      <Descriptions size="small" layout={layout} column={1}>
                        <Descriptions.Item label={key}>
                          {this.renderDescriptionItem(elem, key)}
                        </Descriptions.Item>
                      </Descriptions>
                    ))}
                  </div>
                }
              </div>
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

export default withRouter(connect(mapState, mapDispatch)(AssociationCardList));
