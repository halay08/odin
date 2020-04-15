import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Checkbox, Divider, List, Row, Select, Spin, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RecordAssociationsReducer } from '../../../../../core/records/auditLogs/store/reducer';
import { TableReducer } from '../../../../../core/records/components/DynamicTable/store/reducer';
import { getRecordByIdRequest, IGetRecordById, ISearchRecords, searchRecordsRequest } from '../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpPatch } from '../../../../../shared/http/requests';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import history from '../../../../../shared/utilities/browserHisory';
import {
  getSchemaFromShortListByModuleAndEntity,
  getSchemaFromShortListBySchemaId,
} from '../../../../../shared/utilities/schemaHelpers';

interface Props {
  record: DbRecordEntityTransform,
  hidden?: string[],
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordTableReducer: TableReducer,
  recordAssociationReducer: RecordAssociationsReducer,
  pipelinesEnabled?: boolean,
  getAssociations: any,
  getRecordById: any,
  alertMessage: any,
  getSchema: any,
  searchRecords: any,
}

const moduleName = 'ProductModule';
const entityName = 'Offer';

interface State {
  search: string | undefined,
  isLoading: boolean,
  selected: null | undefined | string[],
  existingRelations: string[];
  priceBookId: string | undefined,
  offerArray: any,
  selectedOffer: string | undefined,
  selectedContractType: string | undefined,
  productsList: any
}

const { Option } = Select;
class OrderItemProductManager extends React.Component<Props, State> {

  state = {
    search: undefined,
    isLoading: false,
    selected: [],
    priceBookId: undefined,
    existingRelations: [],
    offerArray: [],
    selectedOffer: undefined,
    selectedContractType: undefined,
    productsList: []
  };

  componentDidMount() {
    this.loadLists();
  }

  loadLists() {
    const { getSchema, searchRecords, recordReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    // get schema by module and entity and save it to the local state
    getSchema({ moduleName: moduleName, entityName: entityName }, (result: SchemaEntity) => {
      searchRecords({
        schema: result,
        searchQuery: {
          terms: '*',
          schemas: result.id,
          // sort: [],
          // boolean: [],
        },
      });
    });
    if(schema) {

      const data = recordReducer.list[schema.id];
      data?.map((elem: DbRecordEntityTransform) => {
        elem.key = elem.id
      })
      this.setState({
        offerArray: data
      });
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

  handleOk = async () => {
    const { record, alertMessage, recordAssociationReducer } = this.props;
    if(record && recordAssociationReducer.shortList) {

      this.setState({
        isLoading: true,
      });
      const associationKey = `${this.state.selectedOffer}_Product`;
      const associationObj: any = recordAssociationReducer.shortList[associationKey];
      const data = associationObj?.Product?.dbRecords;

      const body: DbRecordAssociationCreateUpdateDto[] = [];
      for(const prodId of this.state.selected) {

        const matchingProduct = data?.find((elem: DbRecordEntityTransform) => elem.id === prodId);

        body.push({
          relatedAssociationId: matchingProduct?.dbRecordAssociation.id,
          recordId: prodId,
        })
      }

      await httpPatch(
        `OrderModule/v1.0/orders/items/${record.id}/productAmendment`,
        body[0],
      ).catch(err => alert(JSON.stringify(
        err)));

      this.setState({
        isLoading: false,
      });
      alertMessage({ body: 'order item amended successfully', type: 'success' });
      history.push(`/OrderModule/OrderItem/${record.id}`);
    }
  };


  private getRecordAssociations() {
    const { schemaReducer, getRecordById, record } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record?.schemaId);
    if(record && schema) {
      getRecordById({ schema, recordId: record?.id })
    }
  }


  private renderPriceBookProducts() {

    const { recordAssociationReducer, schemaReducer, record } = this.props;
    
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(schema && recordAssociationReducer.shortList) {
      // @ts-ignore
      if(true) {

        let data = this.state.productsList.filter((elem: any) => elem.properties.CustomerType === record.properties.ProductCustomerType && 
          elem.properties.Type === record.properties.ProductType &&
          elem.properties.Category === record.properties.ProductCategory);


        return (
          <>
            <List
              style={{ height: '100%', overflow: 'scroll', width: '100%' }}
              loading={this.state.isLoading}
              itemLayout="horizontal"
              dataSource={data}
              renderItem={(item: DbRecordEntityTransform) => (
                <List.Item
                  actions={[
                    // @ts-ignore
                    <Checkbox disabled={this.state.selected.length === 1 && !this.state.selected.includes(item.id)}
                              onChange={() => this.addRemoveItem(item)}>Add</Checkbox>,
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <div>
                        <div style={{ display: 'flex', marginLeft: 24 }}>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Category: </strong> {getProperty(
                            item,
                            'Category',
                          )}</Typography.Text>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Type: </strong>{getProperty(
                            item,
                            'Type',
                          )}</Typography.Text>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Contract: </strong>{getProperty(
                            item,
                            'ContractType',
                          )}</Typography.Text>
                        </div>

                        <div style={{ display: 'flex', marginLeft: 24, marginTop: 8 }}>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Discount: </strong> {getProperty(
                            item,
                            'DiscountValue',
                          )} ({getProperty(
                            item,
                            'DiscountType',
                          )})</Typography.Text>
                          <Typography.Text style={{ marginRight: 24 }}><strong>Free Period: </strong> {getProperty(
                            item,
                            'TrialLength',
                          )} ({getProperty(
                            item,
                            'TrialUnit',
                          )})</Typography.Text>
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
              <Button type="primary" loading={this.state.isLoading}
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


  private renderPriceBookOptions() {

    const { schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(schema) {

      if(this.state.offerArray) {
        return (
          this.state.offerArray.map((elem: DbRecordEntityTransform) => 
            elem.properties.IsDefault === "true" ?
              // @ts-ignore
              <Option key={elem?.id?.toString()} value={elem.id}>{elem.title}</Option> : 
                <></>  
          ))
      } else {
        return;
      }
    }
  }

  private optionSelected(val: any) {
    const { schemaReducer, getAssociations } = this.props;

    this.setState({
      selectedOffer: val,
      selectedContractType: undefined,
      productsList: []
    })
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(schema) {
      getAssociations({
        recordId: val,
        key: 'Product',
        schema: schema,
        entities: [ 'Product' ],
      });
    }
  }

  contractTypeSelect(val: any) {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${this.state.selectedOffer}_Product`;
    const associationObj: any = recordAssociationReducer.shortList?.[associationKey];
    let productsList = associationObj?.Product?.dbRecords.filter((elem: any) => elem.properties.ContractType === val);
    productsList.map((elem: any) => {
      elem.key = elem.id
    })
    this.setState({
      productsList: productsList,
      selectedContractType: val
    })
  }

  renderContractTypeOptions(){
    const { recordAssociationReducer } = this.props;
    const associationKey = `${this.state.selectedOffer}_Product`;
    const associationObj: any = recordAssociationReducer.shortList?.[associationKey];
    
    if(associationObj) {
      return (
        this.getUniqueValues(associationObj?.Product?.dbRecords, 'ContractType').map((elem: any) => (
          // @ts-ignore
          <Option key={elem} value={elem}>{elem}</Option>),
        ))
    } else {
      return;
    }
  }

  getUniqueValues(array: any, key: any) {
    var result = new Set();
    array.forEach(function(item: any) {
        if (item.properties.hasOwnProperty(key)) {
            result.add(item.properties[key]);
        }
    });
    return Array.from(result);
  }

  render() {
    const { recordReducer } = this.props;
    return (
      <div>
        <Spin spinning={this.state.isLoading} tip="Saving changes...">
          <Row>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Select
                  loading={recordReducer.isSearching}
                  style={{ width: '300px' }}
                  defaultValue={[]}
                  placeholder="Select Offer"
                  onSelect={(val) => this.optionSelected(val)}
                  onClick={e => this.loadLists()}
                >
                  {this.renderPriceBookOptions()}
                </Select>
                <Select
                  style={{ width: '300px', marginTop: '1rem' }}
                  placeholder="Select Contract Type"
                  onSelect={(val) => this.contractTypeSelect(val)}
                  disabled={this.state.selectedOffer === undefined}
                  value={this.state.selectedContractType || undefined}
                >
                  {this.renderContractTypeOptions()}
                </Select>
            </div>
            <Divider/>
            {this.renderPriceBookProducts()}
          </Row>
        </Spin>
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
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
});


export default connect(mapState, mapDispatch)(OrderItemProductManager);
