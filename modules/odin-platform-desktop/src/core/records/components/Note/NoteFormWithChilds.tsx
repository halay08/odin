import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Input } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../schemas/store/actions';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import { RecordAssociationsReducer } from '../../auditLogs/store/reducer';
import { createRecordsRequest, ICreateRecords, ISearchRecords, searchRecordsRequest } from '../../store/actions';
import { IRecordReducer } from '../../store/reducer';
import NoteFeedWithChilds from './NoteFeedWithChilds';

const { TextArea } = Input;

interface Props {
  record: DbRecordEntityTransform,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordAssociationReducer: RecordAssociationsReducer,
  getAssociations: any,
  searchRecords: any,
  createRecord: any,
  getSchema: any
}

interface State {
  body: string | undefined
}

const { NOTE } = SchemaModuleEntityTypeEnums;
const { SUPPORT_MODULE } = SchemaModuleTypeEnums;

class NoteFormWithChilds extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      body: undefined,
    }
  }

  componentDidMount() {
    this.getRecordAssociations();
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

  private createNote() {
    const { createRecord, record, getSchema } = this.props;
    if(record) {
      getSchema({ moduleName: SUPPORT_MODULE, entityName: NOTE }, (result: SchemaEntity) => {
        return createRecord({
          owningRecordId: record.id,
          schema: result,
          schemaAssociation: undefined,
          createUpdate: [
            {
              schemaId: result.id,
              entity: `${SUPPORT_MODULE}:${NOTE}`,
              properties: {
                Body: this.state.body,
              },
              associations: [
                {
                  recordId: record.id,
                },
              ],
            },
          ],
        }, (res: DbRecordEntityTransform) => {
          // fetch relations
          this.getRecordAssociations();
          this.setState({
            body: undefined,
          })
        });
      })
    }
  }

  render() {

    const { record, recordReducer } = this.props;

    return (
      <div>
        <TextArea rows={3} value={this.state.body} onChange={(e) => this.setState({ body: e.target.value })}/>
        <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button disabled={!this.state.body} loading={recordReducer.isCreating} type="primary"
                  onClick={() => this.createNote()}>Submit</Button>
        </div>
        <NoteFeedWithChilds record={record}/>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  getSchema: (payload: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(payload, cb)),
  createRecord: (params: ICreateRecords, cb = () => {
  }) => dispatch(createRecordsRequest(params, cb)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
});

export default connect(mapState, mapDispatch)(NoteFormWithChilds);
