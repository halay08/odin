import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { Select } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { ISearchRecords, searchRecordsRequest } from '../../../core/records/store/actions';
import { IRecordReducer } from '../../../core/records/store/reducer';
import { getRecordAssociationsRequest, IGetRecordAssociations } from '../../../core/recordsAssociations/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../core/schemas/store/reducer';
import { getSchemaFromShortListByModuleAndEntity } from '../../../shared/utilities/schemaHelpers';

const { Option } = Select;


const moduleName = 'ProductModule';
const entityName = 'Offer';

interface Props {
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  getSchema: any,
  searchRecords: any,
  onOptionSelected: any,
  getAssociations: any
}

interface State {
  selected: any,
  optionsVisible: boolean
}

class PriceBookSelector extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selected: undefined,
      optionsVisible: false,
    }
  }

  componentDidMount() {
    this.initialize();
  }


  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if(prevProps.recordReducer.isSearching !== this.props.recordReducer.isSearching) {
      if(!this.props.recordReducer.isSearching) {
        this.openSelectOptions();
      }
    }
    if(prevProps.schemaReducer.isRequesting !== this.props.schemaReducer.isRequesting) {
      this.searchRecordOnChange();
    }
  }

  private openSelectOptions() {
    const { recordReducer, schemaReducer } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(schema) {

      // @ts-ignore
      const data = recordReducer.list[schema.id];
      if(data && !this.state.selected) {
        this.setState({
          selected: undefined,
          optionsVisible: true,
        });
      }
    }
  }


  searchRecordOnChange(e?: any) {
    const { schemaReducer, recordReducer, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: e ? e.target.value : recordReducer.searchQuery.terms,
          schemas: schema.id,
          // sort: [],
          // boolean: [],
        },
      });
    }
  }

  setInitialSearchQuery() {
    const { recordReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(!!recordReducer.searchQuery && schema) {
      // @ts-ignore
      return !!recordReducer.searchQuery[schema.id] ? recordReducer.searchQuery[schema.id].terms : ''
    }
  }


  initialize() {
    const { getSchema, searchRecords } = this.props;
    // get schema by module and entity and save it to the local state
    getSchema({ moduleName, entityName }, (result: SchemaEntity) => {
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
  }

  private renderPriceBookOptions() {

    const { recordReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
    if(schema) {
      // @ts-ignore
      const data = recordReducer.list[schema.id];

      if(data) {
        return (
          data.map((elem: DbRecordEntityTransform) => 
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
      selected: val,
      optionsVisible: false,
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
    this.props.onOptionSelected(val);
  }

  render() {
    const { recordReducer } = this.props;
    return (
      <div style={{ width: 300 }}>
        <Select
          onFocus={() => this.setState({ optionsVisible: true })}
          open={this.state.optionsVisible}
          loading={recordReducer.isSearching}
          style={{ width: '100%' }}
          defaultValue={[]}
          placeholder="Select Offer"
          onSelect={(val) => this.optionSelected(val)}
          getPopupContainer={trigger => trigger.parentNode}
        >
          {this.renderPriceBookOptions()}
        </Select>
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
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  getAssociations: (params: IGetRecordAssociations) => dispatch(getRecordAssociationsRequest(params)),
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
});


export default connect(mapState, mapDispatch)(PriceBookSelector);
