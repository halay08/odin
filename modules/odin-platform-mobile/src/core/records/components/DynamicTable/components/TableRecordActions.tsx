import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { canUserCreateRecord, canUserMergeRecord } from '../../../../../shared/permissions/rbacRules';
import history from '../../../../../shared/utilities/browserHisory';
import { listUsers } from '../../../../identity/store/actions';
import { SchemaReducerState } from '../../../../schemas/store/reducer';
import { CREATE_DB_RECORD_REQUEST, UPDATE_DB_RECORD_BY_ID_REQUEST } from '../../../store/constants';
import { IRecordReducer } from '../../../store/reducer';
import OdinFormModal from '../../Forms/FormModal';
import { initializeRecordForm } from '../../Forms/store/actions';
import { getPipelinesByModuleAndEntity } from '../../Pipeline/store/actions';
import { TableReducer } from '../store/reducer';


interface Props {
  schema: SchemaEntity | undefined,
  userReducer: any,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  recordTableReducer: TableReducer,
  initializeForm: any,
  getUsers: any,
  getPipelines: any,
}

interface State {
  createContactVisible: boolean
}

const { CRM_MODULE } = SchemaModuleTypeEnums;
const { CONTACT } = SchemaModuleEntityTypeEnums;

const uuid = uuidv4();

class TableRecordActions extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      createContactVisible: false,
    }
  }

  async initializeCreateForm() {
    const { initializeForm, getUsers, getPipelines, schema } = this.props;
    getUsers();

    if(schema) {

      if(schema.moduleName === CRM_MODULE && schema.entityName === CONTACT) {

        this.setState({
          createContactVisible: true,
        })

      } else {

        getPipelines({ schema: schema });

        initializeForm({
          formUUID: uuid,
          title: 'Initializing',
          showInitializing: true,
        });

        initializeForm({
          formUUID: uuid,
          title: `Create ${schema.entityName}`,
          showFormModal: true,
          isCreateReq: true,
          schema: schema,
          selected: null,
          sections: [ { name: schema.name, schema: schema } ],
        });
      }
    } else {
      return initializeForm({
        title: 'Create',
        formUUID: uuid,
        showFormModal: true,
      });
    }
  }


  private handleFormSubmit(params: { event: string, results: DbRecordEntityTransform }) {
    const { schema } = this.props;
    if(schema) {
      switch (params.event) {
        case CREATE_DB_RECORD_REQUEST:
          history.push(`/${schema.moduleName}/${schema.entityName}/${params.results.id}`);
          break;
        case UPDATE_DB_RECORD_BY_ID_REQUEST:
          break;
      }
    }
  }

  private enableMergeRecords() {
    const { recordTableReducer } = this.props;

    if(recordTableReducer.selectedItems) {
      return recordTableReducer.selectedItems.length === 2;
    }
  }

  render() {

    const { userReducer, schema } = this.props;

    return (
      <>

        <OdinFormModal formUUID={uuid}
                       onSubmitEvent={(params: { event: string, results: DbRecordEntityTransform }) => this.handleFormSubmit(
                         params)}/>

        <div style={{ display: 'flex' }}>
          <Button
            style={{ marginRight: 8 }}
            key="1"
            type="primary"
            ghost
            disabled={schema ? !canUserMergeRecord(userReducer, schema) : false}
            onClick={() => history.push(`/merge/${schema?.moduleName}/${schema?.entityName}`)}>
            Merge
          </Button>
          <Button
            key="2"
            type="primary"
            ghost
            disabled={schema ? !canUserCreateRecord(userReducer, schema) : false}
            onClick={() => this.initializeCreateForm()}>
            New
          </Button>
        </div>
      </>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getUsers: (cb: any) => dispatch(listUsers(cb)),
  getPipelines: (params: { schema: SchemaEntity }) => dispatch(getPipelinesByModuleAndEntity(params)),
});


export default connect(mapState, mapDispatch)(TableRecordActions);
