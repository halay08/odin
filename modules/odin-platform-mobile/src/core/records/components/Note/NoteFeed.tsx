import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Avatar, Button, Comment, Empty, Input, Tooltip } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { parseDateAndTimeLocal } from '../../../../shared/utilities/dateHelpers';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../recordsAssociations/store/actions';
import { IRecordAssociationsReducer } from '../../../recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { updateRecordByIdRequest } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';

const { TextArea } = Input;

interface Props {
  record: DbRecordEntityTransform,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  getSchema: any,
  updateRecord: any,
  getAssociations: any,
}

interface State {
  showEditForm: string | null | undefined,
  body: string | undefined
}

const { SUPPORT_MODULE } = SchemaModuleTypeEnums;
const { NOTE } = SchemaModuleEntityTypeEnums;

class NoteFeed extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      showEditForm: undefined,
      body: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if(prevProps.record !== this.props.record) {
      this.getRecordAssociations();
    }
  }

  private getRecordAssociations() {
    const { getAssociations, record, schemaReducer } = this.props;

    if(record) {
      const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

      if(schema) {
        getAssociations({
          recordId: record.id,
          key: NOTE,
          schema,
          entities: [ NOTE ],
        });
      }
    }
    return <div>data fetched</div>;
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
        this.getRecordAssociations();
        this.setState({
          showEditForm: undefined,
          body: undefined,
        })
      });
    });
  }


  render() {

    const { record, recordAssociationReducer } = this.props;
    const { showEditForm } = this.state;
    const associationKey = record && record.id ? `${record.id}_${NOTE}` : '';
    const associationObj: any = record && record.id ? recordAssociationReducer.shortList[associationKey] : [];
    if(associationObj && associationObj[NOTE] && associationObj[NOTE].dbRecords) {
      return (
        associationObj[NOTE].dbRecords.map((item: DbRecordEntityTransform) => (
          <Comment
            actions={
              showEditForm === item.id ?
                [
                  this.renderListItemEditingActions({
                    note: item,
                  }),
                ] :
                this.renderListItemActions({
                  note: item,
                })
            }
            author={<a>{item.lastModifiedBy ? item.lastModifiedBy.fullName : ''}</a>}
            avatar={
              <Avatar>
                {item.lastModifiedBy ? item.lastModifiedBy.fullName : ''}
              </Avatar>
            }
            content={
              <div>
                {showEditForm === item.id ?
                  <TextArea rows={3} value={this.state.body} onChange={(e) => this.setState({
                    body: e.target.value,
                  })}/>
                  :
                  <p>{getProperty(item, 'Body')}</p>
                }
              </div>
            }
            datetime={
              <Tooltip title={parseDateAndTimeLocal(item.createdAt)}>
                <span>{moment(item.createdAt).fromNow()}</span>
              </Tooltip>
            }
          />
        )))
    }
    return <Empty/>;
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
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(NoteFeed);
