import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Button, Drawer, Row, Spin } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { createRecordsRequest, ICreateRecords } from '../../records/store/actions';
import { IRecordReducer } from '../../records/store/reducer';
import { IRecordAssociationsReducer } from '../../recordsAssociations/store/reducer';
import { SchemaReducerState } from '../../schemas/store/reducer';

interface Props {
  entityName: string,
  relationType: string,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  schemaReducer: SchemaReducerState,
  createRecord: any
  pipelinesEnabled?: boolean
}

interface State {
  visible: boolean,
  selected: null | undefined | string[],
}

class WorkOrderConfigurator extends React.Component<Props, State> {

  state = {
    visible: false,
    selected: [],
  };

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if(prevProps.entityName !== this.props.entityName) {
      this.setSelectedAssociation();
    }
  }

  private setSelectedAssociation() {
    const { entityName, relationType, recordReducer } = this.props;
    // if(recordReducer && recordReducer.selected)
    //   setSelectedAssociation({ owningRecordId: recordReducer.selected.id, entityName, listKey: relationType });
    this.setState({
      visible: true,
    });
  }

  getOrdersOrderItems() {
    const { recordAssociationReducer, recordReducer } = this.props;
    return undefined;
  };

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
    const { recordAssociationReducer, recordReducer, createRecord } = this.props;
    // if(recordAssociationReducer.selected && recordReducer.selected) {
    //   createRecord({
    //     schema: recordAssociationReducer.selected.schema,
    //     format: 'transformLevel1',
    //     createUpdate: [
    //       {
    //         schemaId: recordAssociationReducer.selected.schema.id,
    //         parentRecordId: recordReducer.selected.id,
    //         properties: {
    //           Address: recordReducer.selected['Address'].properties['FullAddress'],
    //           Description: recordReducer.selected.recordNumber,
    //         },
    //         associations: [
    //           ...this.state.selected,
    //           recordReducer.selected['Contact'].id,
    //           recordReducer.selected['Address'].id,
    //         ],
    //       },
    //     ],
    //   }, (results: { data: DbRecordEntityTransform[] }) => {
    //     console.log('results', results);
    //     this.handleCancel();
    //   });
    // }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  renderOrderItemsList = () => {
    const { recordAssociationReducer } = this.props;
    const relations = this.getOrdersOrderItems();
    return (
      <>
        <div></div>
        {/*  <List*/}
        {/*    style={{ height: '75vh', overflow: 'scroll', width: '100%' }}*/}
        {/*    loading={recordAssociationReducer.isSearching}*/}
        {/*    itemLayout="horizontal"*/}
        {/*    dataSource={relations && relations.dbRecords ? relations.dbRecords : []}*/}
        {/*    renderItem={(item: DbRecordEntityTransform) => (*/}
        {/*      <List.Item*/}
        {/*        actions={[ <Checkbox onChange={() => this.addRemoveItem(item)}>Add</Checkbox> ]}*/}
        {/*      >*/}
        {/*        <List.Item.Meta*/}
        {/*          title={getProperty(item, 'Name')}*/}
        {/*          description={getProperty(item, 'Description')}*/}
        {/*        />*/}
        {/*      </List.Item>*/}
        {/*    )}*/}
        {/*  />*/}
        {/*  <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 16 }}>*/}
        {/*    <Button type="primary" disabled={this.state.selected.length < 1}*/}
        {/*            onClick={() => this.handleOk()}>Create</Button>*/}
        {/*  </div>*/}
      </>
    )
  };

  render() {
    const { recordAssociationReducer } = this.props;
    return (
      <div>
        <Button onClick={() => this.setSelectedAssociation()}>
          Configure
        </Button>
        <Drawer
          title="New Work Order"
          visible={this.state.visible}
          onClose={this.handleCancel}
          width={600}
        >
          <Spin spinning={recordAssociationReducer.isCreating} tip="Creating work order...">
            <Row>
              {this.renderOrderItemsList()}
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
});

const mapDispatch = (dispatch: any) => ({
  createRecord: (params: ICreateRecords, cb: () => {}) => dispatch(createRecordsRequest(params, cb)),
});


export default connect(mapState, mapDispatch)(WorkOrderConfigurator);
