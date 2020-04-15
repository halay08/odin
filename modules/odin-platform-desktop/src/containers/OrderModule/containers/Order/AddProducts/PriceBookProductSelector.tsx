import { DbRecordAssociationCreateUpdateDto } from '@d19n/models/dist/schema-manager/db/record/association/dto/db.record.association.create.update.dto';
import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Button, Divider, Drawer, Row, Spin, Select, Table } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { RecordAssociationsReducer } from '../../../../../core/records/auditLogs/store/reducer';
import { TableReducer } from '../../../../../core/records/components/DynamicTable/store/reducer';
import { getRecordByIdRequest, IGetRecordById, ISearchRecords, searchRecordsRequest } from '../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import {
  getRecordAssociationsRequest,
  IGetRecordAssociations,
  updateOrCreateRecordAssociations,
} from '../../../../../core/recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { canUserCreateRecord } from '../../../../../shared/permissions/rbacRules';
import {
  getSchemaFromShortListByModuleAndEntity,
  getSchemaFromShortListBySchemaId,
} from '../../../../../shared/utilities/schemaHelpers';

const { Option } = Select;

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
  getSchema: any,
  searchRecords: (params: ISearchRecords) => void
}

const moduleName = 'ProductModule';
const entityName = 'Product';

interface State {
  visible: boolean,
  selected: any[],
  offerArray: any,
  selectedOffer: string | undefined,
  productsList: any,
  selectedContractType: string | undefined,
  preselectedItems: any,
  selectedBaseProductRowKeys: any,
  selectedRowKeys: any,
  selectedBaseProducts: any,
  selectedAddOnProducts: any,
  initialBaseProduct: boolean,
  isLoading: boolean,
  customerType: string | undefined
}

class ProductSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = this.getInitialState();
  }

  getInitialState = () => ({
    visible: false,
    selected: [],
    offerArray: [],
    selectedOffer: undefined,
    productsList: [],
    selectedContractType: undefined,
    preselectedItems: [],
    selectedBaseProductRowKeys: [],
    selectedRowKeys: [],
    selectedBaseProducts: [],
    selectedAddOnProducts: [],
    initialBaseProduct: false,
    isLoading: false,
    customerType: undefined
  })


  private openDrawer() {
    this.setState({
      visible: true,
    });
    this.loadSchema();
  }


  loadSchema() {
    const { getSchema, relation, schemaReducer, getAssociations } = this.props;
    getSchema({ moduleName, entityName });
    this.loadLists();
    this.setState({
      preselectedItems: relation.dbRecords !== undefined ? relation.dbRecords : []
    })
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    relation.dbRecords?.map((elem: any) => {
      this.setState({
        customerType: elem.properties.ProductCustomerType
      })
      elem.key = elem?.id
      if(elem?.properties.ProductType === 'ADD_ON_PRODUCT') {
        getAssociations({
          recordId: elem.id,
          key: 'Product',
          schema: schema,
          entities: [ 'Product' ],
        }, (result: any) =>{
          this.setState(prevState => ({
            selectedRowKeys: [
              ...prevState.selectedRowKeys,
              result?.results?.Product?.dbRecords?.[0]?.id
            ],
            selectedAddOnProducts: [
              ...prevState.selectedAddOnProducts,
              result?.results?.Product?.dbRecords?.[0]
            ]
          }))
        });
      } else if(elem?.properties.ProductType === 'BASE_PRODUCT') {
        this.setState({
          initialBaseProduct: true
        })
        getAssociations({
          recordId: elem.id,
          key: 'Product',
          schema: schema,
          entities: [ 'Product' ],
        }, (result: any) =>{
          this.setState(prevState => ({
            selectedBaseProductRowKeys: [
              ...prevState.selectedBaseProductRowKeys,
              result?.results?.Product?.dbRecords?.[0]?.id
            ],
            selectedBaseProducts: [
              ...prevState.selectedBaseProducts,
              result?.results?.Product?.dbRecords?.[0]
            ]
          }))
        });
      }
    })
  }

  loadLists() {
    const { getSchema, searchRecords, recordReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, 'Offer');
    // get schema by module and entity and save it to the local state
    getSchema({ moduleName: moduleName, entityName: 'Offer' }, (result: SchemaEntity) => {
      searchRecords({
        schema: result,
        searchQuery: {
          terms: '*',
          schemas: result.id,
          pageable: {
            page: 1,
            size: 50,
          },
        },
      });
    });
    if(schema) {

      const data = recordReducer.list[schema.id];
      data?.map((elem: DbRecordEntityTransform) => {
        elem.key = elem?.id
      })
      this.setState({
        offerArray: data
      });
    }
  }


  handleOk() {
    const { record, relation, createAssociations, recordAssociationReducer } = this.props;
    const { schema, schemaAssociation } = relation;
    if(schemaAssociation && record && schema && recordAssociationReducer.shortList) {

      this.setState({
        isLoading: true
      })

      const selectedItems = this.state.selectedBaseProductRowKeys.concat(this.state.selectedRowKeys);

      const body: DbRecordAssociationCreateUpdateDto[] = [];
      selectedItems.forEach((el: any) => {
        body.push({
          recordId: el
        })
      })

      createAssociations({
        recordId: record.id,
        schema,
        schemaAssociation,
        createUpdate: body,
      }, () => {
        this.handleCancel();
      });
    }
  };

  handleCancel = () => {
    this.setState(this.getInitialState())
  };


  private optionSelected(val: any) {
    const { schemaReducer, getAssociations } = this.props;
    if(val !== this.state.selectedOffer && this.state.selectedOffer !== undefined) {
      this.setState({
        selectedRowKeys: [],
        selectedBaseProductRowKeys: [],
        selectedBaseProducts: [],
        selectedAddOnProducts: []
      });
    }
    this.setState({
      selectedOffer: val,
      productsList: [],
      selectedContractType: undefined
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
            elem?.properties.IsDefault === "true" && (this.state.customerType ? elem?.properties.CustomerType === this.state.customerType : true) ?
              // @ts-ignore
              <Option key={elem?.id?.toString()} value={elem?.id}>{elem?.title}</Option> : 
                <></> 
          ))
      } else {
        return;
      }
    }
  }

  contractTypeSelect(val: any) {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${this.state.selectedOffer}_Product`;
    const associationObj: any = recordAssociationReducer.shortList?.[associationKey];
    let productsList = associationObj?.Product?.dbRecords.filter((elem: any) => elem?.properties.ContractType === val);
    productsList.map((elem: any) => {
      elem.key = elem?.id
    })
    this.setState({
      productsList: productsList,
      selectedContractType: val
    });
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

  renderAddOnProductList() {
    const { recordAssociationReducer } = this.props;
    const associationKey = `${this.state.selectedOffer}_Product`;
    const associationObj: any = recordAssociationReducer.shortList?.[associationKey];
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
          onChange: (selectedRowKeys: React.Key[], selectedRows: DbRecordEntityTransform[]) => { 
            this.setState({
              selectedRowKeys: selectedRowKeys,
              selectedAddOnProducts: selectedRows
            });
          },
          preserveSelectedRowKeys: true,
          selectedRowKeys: this.state.selectedRowKeys,
          getCheckboxProps: (record: DbRecordEntityTransform) => ({
            disabled: !this.state.selectedBaseProductRowKeys.length || this.setDisabledAddOnProducts(record)
          })
        }}
        
        loading={recordAssociationReducer?.isSearching}
        scroll={{ y: "calc(100vh - 315px)" }}
        style={{ width: "100%" }}
        size="small"
        dataSource={productsList?.filter((elem: any) => elem?.properties.Type === 'ADD_ON_PRODUCT')}
        columns={columns}
      ></Table>
    )
  }

  setDisabledAddOnProducts(record: DbRecordEntityTransform) {
    if(this.state.selectedBaseProductRowKeys.length) {
      if(this.state.selectedAddOnProducts.find((elem: any) => elem.id === record.id)) {
        return false
      } else {
        if(record.properties.Category === 'VOICE' && this.state.selectedBaseProducts?.[0]?.properties.Category === 'VOICE') {
          return true
        } else if(record.properties.Category === 'VOICE' && this.state.selectedAddOnProducts.find((elem: any) => elem?.properties.Category === 'VOICE')) {
          return true
        } else if(record.properties.Category === 'BRODBAND' &&  this.state.selectedAddOnProducts.find((elem: any) => elem?.properties.Category === 'BRODBAND')) {
          return true
        }
      } 
    } else return false
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
          preserveSelectedRowKeys: true,
          selectedRowKeys: this.state.selectedBaseProductRowKeys,
          onChange: (selectedRowKeys: React.Key[], selectedRows: DbRecordEntityTransform[]) => { 
            this.setState({
              selectedBaseProductRowKeys: selectedRowKeys, 
              selectedBaseProducts: selectedRows
            });
          },
          getCheckboxProps: (record: DbRecordEntityTransform) => ({
            disabled: this.baseProductDisabledState(record)
          })
        }}
        
        loading={recordAssociationReducer?.isSearching}
        scroll={{ y: "calc(100vh - 315px)" }}
        style={{ width: "100%" }}
        size="small"
        dataSource={this.state.productsList?.filter((elem: any) => elem?.properties.Type === 'BASE_PRODUCT')}
        columns={columns}
      ></Table>
    )
  }

  baseProductDisabledState(record: DbRecordEntityTransform) {
    if(this.state.initialBaseProduct) {
      return true
    } else {
      return false
    }
  }

  render() {
    const { recordReducer, record, userReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListBySchemaId(schemaReducer.shortList, record.schemaId);

    return (
      <div>
        <Button
          type="text"
          onClick={() => this.openDrawer()}
          disabled={schema ? !canUserCreateRecord(userReducer, schema) : false}
        >
          Lookup Product
        </Button>
        <Drawer
          title={`Add Products`}
          visible={this.state.visible}
          onClose={() => this.handleCancel()}
          width={1000}
        >
          <Spin spinning={recordReducer.isRequesting} tip="Saving changes...">
            <Row>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div>
                <Select
                  loading={recordReducer.isSearching}
                  style={{ width: '100%' }}
                  placeholder="Select Offer"
                  onSelect={(val) => this.optionSelected(val)}
                  onClick={e => this.loadLists()}
                  value={this.state.selectedOffer || undefined}
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
                <Divider/>
              </div>
            </Row>
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: 16 }}>
              <Button
                type="primary"
                disabled={!this.state.selectedRowKeys && !this.state.selectedBaseProductRowKeys}
                onClick={(e) => this.handleOk()}
                loading={this.state.isLoading}
              >
                Save Changes
              </Button>
            </div>
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
  getAssociations: (params: IGetRecordAssociations, cb: any) => dispatch(getRecordAssociationsRequest(params, cb)),
  createAssociations: (params: any, cb: () => {}) => dispatch(updateOrCreateRecordAssociations(params, cb)),
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
});


export default connect(mapState, mapDispatch)(ProductSelector);
