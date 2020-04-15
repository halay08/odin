import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import React from 'react';
import { connect } from 'react-redux';
import { IRecordReducer } from '../../../../../../../../../core/records/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../../../../../../../core/recordsAssociations/store/actions';
import { SchemaReducerState } from '../../../../../../../../../core/schemas/store/reducer';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../../../../../shared/utilities/schemaHelpers';
import { Divider, Select, Table } from 'antd';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { ISearchRecords, searchRecordsRequest } from '../../../../../../../../../core/records/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../../../../../core/schemas/store/actions';
import { IRecordAssociationsReducer } from '../../../../../../../../../core/recordsAssociations/store/reducer';
import { updateOrderWorkflow } from '../../../../../../../../../core/workflow/store/actions';
import { WorkflowReducer } from '../../../../../../../../../core/workflow/store/reducer';


interface Props {
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  getAssociations: any,
  getSchema: any,
  searchRecords: any,
  recordAssociationReducer: IRecordAssociationsReducer,
  sendProductsToParent: any,
  updateOrderWorkflow: any,
  workflowReducer: WorkflowReducer
}

interface State {
  selectedOffer: any | undefined,
  offerArray: any,
  productsList: any,
  selectedContractType: any,
  selectedRowKeys: any,
  selectedBaseProductRowKeys: any,
  selectedBaseProducts: any,
  selectedAddOnProducts: any
}

const { Option } = Select;

const moduleName = 'ProductModule';
const entityName = 'Offer';

class CreateOrderOffer extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    selectedOffer: undefined,
    offerArray: [],
    productsList: [],
    selectedContractType: undefined,
    selectedRowKeys: [],
    selectedBaseProductRowKeys: [],
    selectedBaseProducts: [],
    selectedAddOnProducts: []
  })

  componentDidMount() {
    this.initializeOfferData();
  }


  initializeOfferData() {
    const { workflowReducer } = this.props;
    workflowReducer.Order.selectedProductItems.forEach((elem: any) => {
      this.setState(prevState => ({
        selectedRowKeys: [
          ...prevState.selectedRowKeys,
          elem?.id
        ]
      }))
    })
    workflowReducer.Order.selectedBaseProductItems.forEach((elem: any) => {
      this.setState(prevState => ({
        selectedBaseProductRowKeys: [
          ...prevState.selectedBaseProductRowKeys,
          elem?.id
        ]
      }))
    })
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

  private optionSelected(val: any) {
    const { schemaReducer, getAssociations, sendProductsToParent } = this.props;
    this.setState({
      selectedOffer: val,
      productsList: [],
      selectedContractType: undefined,
      selectedRowKeys: [],
      selectedBaseProductRowKeys: [],
      selectedBaseProducts: [],
      selectedAddOnProducts: []
    });
    setTimeout(() => {
      sendProductsToParent({selectedAddOnProducts: this.state.selectedAddOnProducts, selectedBaseProductItems: this.state.selectedBaseProducts});
    });
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

  addRemoveItem = async (items: DbRecordEntityTransform[]) => {
    const { sendProductsToParent, updateOrderWorkflow } = this.props;
    this.setState({
      selectedAddOnProducts: items
    })
    updateOrderWorkflow({selectedProductItems: items})
    setTimeout(() => {
      sendProductsToParent({selectedAddOnProducts: this.state.selectedAddOnProducts, selectedBaseProductItems: this.state.selectedBaseProducts});
    });
  };

  addRemoveBaseItem(item: DbRecordEntityTransform[]) {
    const { sendProductsToParent, updateOrderWorkflow } = this.props;
    this.setState({
      selectedBaseProducts: item
    })
    updateOrderWorkflow({selectedBaseProductItems: item})
    setTimeout(() => {
      sendProductsToParent({selectedAddOnProducts: this.state.selectedAddOnProducts, selectedBaseProductItems: this.state.selectedBaseProducts});
    });
  }


  renderBaseProductList() {
    const { recordAssociationReducer } = this.props;
    const columns = [
      { 
        title: 'Title',
        key: 'title', 
        dataIndex: 'title'
      },
      { 
        title: 'Category', 
        dataIndex: 'Category',
        key: 'Category',
        render: (text: any, record: any) => (
          <>{record.properties.Category}</>
        )
      },
      { 
        title: 'Type', 
        dataIndex: 'Type',
        key: 'Type',
        render: (text: any, record: any) => (
          <>{record.properties.Type}</>
        )
      },
      { 
        title: 'ContractType', 
        dataIndex: 'ContractType',
        key: 'ContractType',
        render: (text: any, record: any) => (
          <>{record.properties.ContractType}</>
        )
      },
      { 
        title: 'Price', 
        dataIndex: 'Price',
        key: 'Price',
        render: (text: any, record: any) => (
          <>{record.properties.UnitPrice}</>
        )
      }
    ];
    return (
      <Table
        rowSelection={{
          type: 'radio',
          onChange: (selectedRowKeys: React.Key[], selectedRows: DbRecordEntityTransform[]) => { this.addRemoveBaseItem(selectedRows); this.setState({selectedBaseProductRowKeys: selectedRowKeys}) },
          preserveSelectedRowKeys: true,
          selectedRowKeys: this.state.selectedBaseProductRowKeys,
          onSelect: ((record: DbRecordEntityTransform) => this.onBaseProductSelect(record))
        }}
        
        loading={recordAssociationReducer?.isSearching}
        scroll={{ y: "calc(100vh - 315px)" }}
        style={{ minHeight: "100%", width: "100%" }}
        size="small"
        dataSource={this.state.productsList?.filter((elem: any) => elem.properties.Type === 'BASE_PRODUCT')}
        columns={columns}
      ></Table>
    )
  }

  setSelectedRowKeys(selectedRowKeys: any) {
    this.setState({
      selectedRowKeys: selectedRowKeys
    })
  }

  contractTypeSelect(val: any) {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${this.state.selectedOffer}_Product`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
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
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    
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

  renderAddOnProductList() {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${this.state.selectedOffer}_Product`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];
    const productsList = associationObj?.Product?.dbRecords;
    productsList?.map((el: any) => {
      el.key = el.id
    })
    const columns = [
      { 
        title: 'Title',
        key: 'title', 
        dataIndex: 'title'
      },
      { 
        title: 'Category', 
        dataIndex: 'Category',
        key: 'Category',
        render: (text: any, record: any) => (
          <>{record.properties.Category}</>
        )
      },
      { 
        title: 'Type', 
        dataIndex: 'Type',
        key: 'Type',
        render: (text: any, record: any) => (
          <>{record.properties.Type}</>
        )
      },
      { 
        title: 'ContractType', 
        dataIndex: 'ContractType',
        key: 'ContractType',
        render: (text: any, record: any) => (
          <>{record.properties.ContractType}</>
        )
      },
      { 
        title: 'Price', 
        dataIndex: 'Price',
        key: 'Price',
        render: (text: any, record: any) => (
          <>{record.properties.UnitPrice}</>
        )
      }
    ];
    return (
      <Table
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys: React.Key[], selectedRows: DbRecordEntityTransform[]) => { this.addRemoveItem(selectedRows); this.setSelectedRowKeys(selectedRowKeys) },
          preserveSelectedRowKeys: true,
          selectedRowKeys: this.state.selectedRowKeys,
          getCheckboxProps: (record: DbRecordEntityTransform) => ({
            disabled: !this.state.selectedBaseProductRowKeys.length || this.setDisabledAddOnProducts(record)
          })
        }}
        
        loading={recordAssociationReducer?.isSearching}
        scroll={{ y: "calc(100vh - 315px)" }}
        style={{ minHeight: "100%", width: "100%" }}
        size="small"
        dataSource={productsList?.filter((elem: any) => elem.properties.Type === 'ADD_ON_PRODUCT')}
        columns={columns}
      ></Table>
    )
  }

  onBaseProductSelect(record: DbRecordEntityTransform) {
    this.setState({
      selectedRowKeys: [],
      selectedAddOnProducts: []
    });
  }

  setDisabledAddOnProducts(record: DbRecordEntityTransform) {
    if(this.state.selectedBaseProductRowKeys.length) {
      if(this.state.selectedAddOnProducts.find((elem: any) => elem.id === record.id)) {
        return false
      } else {
        if(record.properties.Category === 'VOICE' && this.state.selectedBaseProducts[0].properties.Category === 'VOICE') {
          return true
        } else if(record.properties.Category === 'VOICE' && this.state.selectedAddOnProducts.find((elem: any) => elem.properties.Category === 'VOICE')) {
          return true
        } else if(record.properties.Category === 'BRODBAND' &&  this.state.selectedAddOnProducts.find((elem: any) => elem.properties.Category === 'BRODBAND')) {
          return true
        }
      }
    } else return false
  }
  
  render() {
    const { recordReducer } = this.props;
    return (
      <div>
        <Select
          loading={recordReducer.isSearching}
          style={{ width: '100%' }}
          defaultValue={[]}
          placeholder="Select Offer"
          onSelect={(val) => this.optionSelected(val)}
          onClick={e => this.loadLists()}
        >
          {this.renderPriceBookOptions()}
        </Select>
        <Select
          style={{ width: '100%', marginTop: '1rem' }}
          placeholder="Select Contract Type"
          onSelect={(val) => this.contractTypeSelect(val)}
          disabled={this.state.selectedOffer === undefined}
          value={this.state.selectedContractType || undefined}
        >
          {this.renderContractTypeOptions()}
        </Select>
        <Divider/>
        {this.renderAddOnProductList()}
        {this.renderBaseProductList()}
      </div>
    );
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  workflowReducer: state.workflowReducer
});

const mapDispatch = (dispatch: any) => ({
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
  updateOrderWorkflow: (params: any) => dispatch(updateOrderWorkflow(params))
});

// @ts-ignore
export default connect(mapState, mapDispatch)(CreateOrderOffer);
