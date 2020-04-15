import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Checkbox, Divider, Drawer, List, Popover, Row, Spin, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { canUserCreateRecord } from '../../../../shared/permissions/rbacRules';
import { getSchemaFromShortListBySchemaId } from '../../../../shared/utilities/schemaHelpers';
import { RecordAssociationsReducer } from '../../../records/auditLogs/store/reducer';
import RecordProperties from '../../../records/components/DetailView/RecordProperties';
import { TableReducer } from '../../../records/components/DynamicTable/store/reducer';
import { getRecordByIdRequest, IGetRecordById } from '../../../records/store/actions';
import { IRecordReducer } from '../../../records/store/reducer';
import { SchemaReducerState } from '../../../schemas/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
  updateOrCreateRecordAssociations,
} from '../../store/actions';
import RecordAssociationSearch from '../Search';

interface Props {
  record: DbRecordEntityTransform,
  relation: DbRecordAssociationRecordsTransform,
  hidden?: string[],
  userReducer: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  recordAssociationReducer: RecordAssociationsReducer,
  pipelinesEnabled?: boolean,
  createAssociations: any,
  getAssociations: any,
  getRecordById: any,
}

interface State {
  visible: boolean,
  selected: null | undefined | string[]
}

class LookUpDrawer extends React.Component<Props, State> {

  state = { visible: false, selected: [] };

  private openDrawer() {
    this.setState({
      visible: true,
    });
  }

  addRemoveItem = (item: DbRecordEntityTransform) => {
    if(this.state.selected.find(elem => elem === item.id)) {
      // remove the item
      this.setState({
        selected: this.state.selected.filter(elem => elem !== item.id),
      });
    } else {
      this.setState(prevState => ({
        // @ts-ignore
        selected: [ ...prevState.selected, ...[ item.id ] ],
      }));
    }
  };


  handleOk = () => {
    const { record, relation, createAssociations, getRecordById } = this.props;
    const { schema, schemaAssociation } = relation;
    if(schemaAssociation && record) {
      const body = this.state.selected.map(elem => ({
        recordId: elem,
        quantity: 1,
      }));
      createAssociations({
        recordId: record.id,
        schema,
        schemaAssociation,
        createUpdate: body,
      }, () => {
        this.handleCancel();
        // fetch record relations
        this.getRecordAssociations();
      });
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  private renderListItemTitle(item: DbRecordEntityTransform) {

    if(item.type) {

      return (
        <div>
          <div>
            <Typography.Text>{item.type}</Typography.Text>
          </div>
          <div>
            <Typography.Text>{item.recordNumber ? `${item.recordNumber} - ` : ''} {item.title}</Typography.Text>
          </div>
        </div>
      )
    } else if(item.title && item.recordNumber) {

      return `${item.recordNumber} ${item.title}`;

    } else if(item.title && !item.recordNumber) {

      return item.type ? `${item.type} ${item.title}` : item.title;
    }

  }

  renderRelatedRecordsList = () => {
    const { recordAssociationReducer } = this.props;
    return (
      <>
        <List
          style={{ height: '75vh', overflow: 'scroll', width: '100%' }}
          loading={recordAssociationReducer.isSearching}
          itemLayout="horizontal"
          dataSource={recordAssociationReducer.list}
          renderItem={(item: DbRecordEntityTransform) => (
            <List.Item
              actions={[
                <Checkbox onChange={() => this.addRemoveItem(item)}>Add</Checkbox>,
                <Popover
                  title={item.type ? `${item.type} ${item.title}` : item.title}
                  content={
                    <div
                      style={{
                        width: 300,
                      }}
                    >
                      <RecordProperties columnLayout="vertical" record={item} columns={2}/>
                    </div>}>
                  Details
                </Popover>,
              ]}
            >
              <List.Item.Meta
                title={this.renderListItemTitle(item)}
                description={getProperty(item, 'Description')}
              />
              <div>{item.properties.UnitPrice}</div>
            </List.Item>
          )}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 16 }}>
          <Button type="primary" loading={recordAssociationReducer.isCreating}
                  disabled={this.state.selected.length < 1}
                  onClick={() => this.handleOk()}>Save </Button>
        </div>
      </>
    )
  };

  private getRecordAssociations() {
    const { getAssociations, record, schemaReducer, relation, getRecordById } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);
    if(record && schema) {
      getRecordById({ schema, recordId: record.id });
      getAssociations({
        recordId: record.id,
        key: relation.schema.entityName,
        schema: relation.schema,
        entities: [ relation.schema.entityName ],
      });
    }
    return <div>data fetched</div>;
  }


  render() {
    const { userReducer, record, relation, recordReducer } = this.props;
    const { schema } = relation;

    return (
      <div>
        <Button
          type="text"
          disabled={!canUserCreateRecord(userReducer, schema)}
          onClick={() => this.openDrawer()}>
          Lookup
        </Button>
        <Drawer
          title={`Add ${schema.entityName}`}
          visible={this.state.visible}
          onClose={this.handleCancel}
          width={600}
          destroyOnClose
        >
          <Spin spinning={recordReducer.isRequesting} tip="Saving changes...">
            <Row>
              <div style={{ width: '100%' }}>
                <RecordAssociationSearch record={record} relation={relation} hideActions/>
                <Divider/>
              </div>
              {this.renderRelatedRecordsList()}
            </Row>
          </Spin>
        </Drawer>
      </div>
    );
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  userReducer: state.userReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  recordTableReducer: state.recordTableReducer,
});

const mapDispatch = (dispatch: any) => ({
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
});


export default connect(mapState, mapDispatch)(LookUpDrawer);
