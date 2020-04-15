import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Button, Checkbox, Divider, Drawer, Input, List, Row, Spin, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RecordAssociationsReducer } from '../../../core/records/auditLogs/store/reducer';
import { TableReducer } from '../../../core/records/components/DynamicTable/store/reducer';
import { getRecordByIdRequest, IGetRecordById } from '../../../core/records/store/actions';
import { IRecordReducer } from '../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
  updateOrCreateRecordAssociations,
} from '../../../core/recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../core/schemas/store/reducer';
import { canUserCreateRecord } from '../../../shared/permissions/rbacRules';
import {
  getSchemaFromShortListByModuleAndEntity,
  getSchemaFromShortListBySchemaId,
} from '../../../shared/utilities/schemaHelpers';
import PriceBookSelector from './PriceBookSelector';

const { Search } = Input;


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
  getSchema: any
}

const moduleName = 'ProductModule';
const entityName = 'Product';

interface State {
  search: string | undefined,
  visible: boolean,
  selected: null | undefined | string[],
  existingRelations: string[];
  priceBookId: string | undefined,
}

class PriceBookProductSelector extends React.Component<Props, State> {

  state = { search: undefined, visible: false, selected: [], priceBookId: undefined, existingRelations: [] };

  private openDrawer() {
    this.setState({
      visible: true,
    });
    this.initializeSelectedItems();
    this.loadSchema();
  }

  loadSchema() {
    const { getSchema } = this.props;
    getSchema({ moduleName, entityName });
  }

  private initializeSelectedItems() {
    const { record, recordAssociationReducer } = this.props;
    // get the order items on the order;
    const associationKey = `${record?.id}_Product`;
    if(recordAssociationReducer.shortList) {
      const associationObj: any = recordAssociationReducer.shortList[associationKey];
      const relatedRecords = associationObj['Product'] ? associationObj['Product'].dbRecords : undefined;
      console.log('relatedRecords', relatedRecords);
      if(relatedRecords) {
        const productIds = relatedRecords.map((elem: DbRecordEntityTransform) => getProperty(elem, 'ProductRef'));
        this.setState({
          existingRelations: productIds,
        })
      }
    }
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
    const { record, relation, createAssociations, recordAssociationReducer } = this.props;
    const { schema, schemaAssociation } = relation;
    if(schemaAssociation && record && schema && recordAssociationReducer.shortList) {

      const associationKey = `${this.state.priceBookId}_${entityName}`;
      const associationObj: any = recordAssociationReducer.shortList[associationKey];
      const data = associationObj[entityName].dbRecords;

      const body: DbRecordAssociationCreateUpdateDto[] = [];
      for(const prodId of this.state.selected) {

        const matchingProduct = data.find((elem: DbRecordEntityTransform) => elem.id === prodId);

        body.push({
          recordId: prodId,
          relatedAssociationId: matchingProduct?.dbRecordAssociation.id,
        })
      }

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


  private getRecordAssociations() {
    const { schemaReducer, getRecordById, getAssociations, record, relation } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    if(record && schema) {
      getRecordById({ schema, recordId: record?.id })
      getAssociations({
        recordId: record.id,
        key: relation.schema.entityName,
        schema: relation.schema,
        entities: [ relation.schema.entityName ],
      });
    }
  }


  private renderPriceBookProducts() {

    const { recordAssociationReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(schema && recordAssociationReducer.shortList) {
      // @ts-ignore
      const associationKey = `${this.state.priceBookId}_${entityName}`;
      if(recordAssociationReducer.shortList[associationKey]) {

        const associationObj: any = recordAssociationReducer.shortList[associationKey];
        let data = associationObj[entityName].dbRecords;

        // @ts-ignore
        data = data.filter((elem: DbRecordEntityTransform) => !this.state.existingRelations.includes(elem.id));

        if(this.state.search) {
          // @ts-ignore
          const searchRegex = new RegExp(this.state.search, 'i');
          // @ts-ignore
          data = data.filter((elem: DbRecordEntityTransform) => searchRegex.test(elem?.title))
        }

        return (
          <>
            <List
              style={{ height: 400, overflow: 'scroll', width: '100%' }}
              itemLayout="horizontal"
              dataSource={data}
              renderItem={(item: DbRecordEntityTransform) => (
                <List.Item
                  actions={[ <Checkbox onChange={() => this.addRemoveItem(item)}>Add</Checkbox> ]}
                >
                  <List.Item.Meta
                    title={`${item.recordNumber} ${item.title}`}
                    description={
                      <div>
                        <div style={{ display: 'flex', marginLeft: 24 }}>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Category: </strong> {getProperty(
                            item,
                            'Category',
                          )}</Typography.Text>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Unit type: </strong> {getProperty(
                            item,
                            'UnitType',
                          )}</Typography.Text>
                        </div>
                      </div>
                    }
                  />
                  <div>
                    <Typography.Text style={{ marginRight: 24 }}><strong>Price </strong>{getProperty(
                      item,
                      'UnitPrice',
                    )}</Typography.Text>
                  </div>
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
      } else {
        return;
      }
    }
  }


  render() {
    const { schemaReducer, userReducer, recordReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    return (
      <div>
        <Button
          disabled={!canUserCreateRecord(userReducer, schema)}
          style={{ width: 70 }}
          type="text"
          onClick={() => this.openDrawer()}>
          Lookup Product
        </Button>
        <Drawer
          title={`Add Products`}
          visible={this.state.visible}
          onClose={this.handleCancel}
          width={1000}
        >
          <Spin spinning={recordReducer.isRequesting} tip="Saving changes...">
            <Row>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <Typography.Text>Select Price Book</Typography.Text>
                  {this.state.visible && <PriceBookSelector onOptionSelected={(params: any) => this.setState({
                    priceBookId: params,
                  })}/>}
                </div>
                <Divider/>
                <div style={{ marginTop: 20 }}>
                  <Typography.Text>Find Products</Typography.Text>
                  <div>
                    <Search
                      placeholder="filter products"
                      onChange={e => {
                        this.setState({
                          search: e.target.value,
                        })
                      }}
                      style={{ width: 200 }}
                    />
                  </div>
                </div>
              </div>
              {this.renderPriceBookProducts()}
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
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
});


export default connect(mapState, mapDispatch)(PriceBookProductSelector);
