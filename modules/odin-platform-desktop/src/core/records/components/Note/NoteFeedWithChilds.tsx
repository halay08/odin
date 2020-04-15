import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Empty, Input, Typography, Spin } from 'antd';
import { Link } from 'react-router-dom';
import React from 'react';
import { connect } from 'react-redux';
import { parseDateForNoteFeed } from '../../../../shared/utilities/dateHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { updateRecordByIdRequest, ISearchRecords, searchRecordsRequest } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import { splitModuleAndEntityName } from '../../../../shared/utilities/recordHelpers';
import './styles.scss'

const { TextArea } = Input;

interface Props {
  record: DbRecordEntityTransform,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: any,
  searchRecords: any,
  updateRecord: any,
  getAssociations: any,
}

interface State {
  showEditForm: string | null | undefined,
  body: string | undefined,
  noteParentsArray: string[],
  notesSchema?: SchemaEntity,
}

const { SUPPORT_MODULE } = SchemaModuleTypeEnums;
const { NOTE } = SchemaModuleEntityTypeEnums;

class NoteFeedWithChilds extends React.Component<Props, State> {


  timer: NodeJS.Timeout | undefined;

  constructor(props: Props) {
    super(props);

    this.state = {
      showEditForm: undefined,
      body: undefined,
      noteParentsArray: [],
      notesSchema: undefined,
    }
  }

  componentDidMount() {
    this.timer = undefined;
    this.getNotesSchema()
    this.getNotesForIdArray();

    if (!this.timer) {
      this.timer = setInterval(() => this.getNotesForIdArray(), 5000);
    }

    
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if (prevProps.record !== this.props.record) {
      // this.getRecordAssociations();
      this.getNotesForIdArray();
    }
  }

  clearTimer() {
    //@ts-ignore
    clearInterval(this.timer)
    this.timer = undefined;
  }

  private getNotesSchema() {
    const { getSchema } = this.props;
    getSchema({ moduleName: SUPPORT_MODULE, entityName: NOTE }, (notesSchema: SchemaEntity) => this.setState({ notesSchema }))
  }

  private getNotesForIdArray() {
    const { searchRecords, record } = this.props;
    if (record && this.state.notesSchema) {
      const links = record.links?.map(link => link.id) || []
      const noteParentsArray = [record.id, ...links]
      this.setState({ noteParentsArray })
      const schema = {
        id: this.state.notesSchema.id,
        entityName: 'Note',
        moduleName: 'SchemaModule'
      }
      const booleanQuery = { "filter": [{"terms": {
          "links.id.keyword": noteParentsArray
        }
      }] }
      searchRecords({
        schema: schema,
        searchQuery: {
          schemas: schema.id,
          sort: [{ "createdAt": "desc" }],
          boolean: booleanQuery,
        },
      });
    }
  }

  private renderListItemActions(params: { note: DbRecordEntityTransform }) {
    return [
      <a key="list-loadmore-edit" onClick={() => {
        this.setState(prevState => ({
          showEditForm: prevState.showEditForm === params.note.id ? undefined : params.note.id,
          body: getProperty(params.note, 'Body'),
        }));
      }
      }>edit</a>,
    ];
  }

  private renderListItemEditingActions(params: { note: DbRecordEntityTransform }) {
    const { recordReducer } = this.props;

    return [
      <a key="list-loadmore-edit" onClick={() => {
        this.setState(prevState => ({
          showEditForm: prevState.showEditForm === params.note.id ? undefined : params.note.id,
          body: getProperty(params.note, 'Body'),
        }));
      }
      }>cancel</a>,
      <Button
        size="small"
        style={{ marginLeft: 8 }}
        disabled={!this.state.body} loading={recordReducer.isUpdating} type="primary" onClick={() =>
          this.updateNote(params.note)}>Save</Button>,
    ];
  }

  private updateNote(note: DbRecordEntityTransform) {
    const { updateRecord, getSchema } = this.props;
    getSchema({ moduleName: SUPPORT_MODULE, entityName: NOTE }, (result: SchemaEntity) => {
      return updateRecord({
        schema: result,
        recordId: note.id,
        schemaAssociation: undefined,
        createUpdate: {
          entity: `${SUPPORT_MODULE}:${NOTE}`,
          properties: {
            Body: this.state.body,
          },
        },
      }, (res: DbRecordEntityTransform) => {
        // fetch relations
        // this.getRecordAssociations();
        this.getNotesForIdArray();
        this.setState({
          showEditForm: undefined,
          body: undefined,
        })
      });
    });
  }

  renderNote(item: DbRecordEntityTransform) {
    const { showEditForm } = this.state;
    const { entityName, moduleName } = splitModuleAndEntityName(item?.links?.[0]?.entity || '')

    return <Card
      style={{ marginTop: 8 }}
      size="small"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span> {entityName}  <Link to={`/${moduleName}/${entityName}/${item.links?.[0].id}`} component={Typography.Link}>{item.links?.[0].title}</Link></span>
          {parseDateForNoteFeed(item.createdAt)}
        </div>}
    >
      <div>
        <div>
          {showEditForm === item.id ?
            <TextArea rows={3} value={this.state.body} onChange={(e) => this.setState({
              body: e.target.value,
            })} />
            :
            <p>{getProperty(item, 'Body')}</p>
          }
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Link to={`/IdentityManagerModule/Users/${item.lastModifiedBy?.id}`} component={Typography.Link}>{item.lastModifiedBy ? item.lastModifiedBy.fullName : ''}</Link>
          <div>
            {showEditForm === item.id ?
              [
                this.renderListItemEditingActions({
                  note: item,
                }),
              ] :
              this.renderListItemActions({
                note: item,
              })}
          </div>
        </div>
      </div>
    </Card>

  }


  render() {
    const { recordReducer } = this.props;
    if (this.state.notesSchema?.id) {
      let recordsList = recordReducer.list?.[this.state.notesSchema?.id] || []
      if (recordsList.length) {
        return (
          recordsList.map((item: DbRecordEntityTransform) => (
            this.renderNote(item)
          )))
      }
    }
    return <div className="spinner"><Spin spinning={recordReducer.isSearching} tip="Loading..." size="large"/></div>;
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  updateRecord: (params: any, cb: any) => dispatch(updateRecordByIdRequest(params, cb)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(NoteFeedWithChilds);
