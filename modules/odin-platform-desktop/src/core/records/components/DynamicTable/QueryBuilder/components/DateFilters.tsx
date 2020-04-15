import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import { Button, Col, Select, DatePicker } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../../shared/utilities/schemaHelpers';
import { SchemaReducerState } from '../../../../../schemas/store/reducer';
import { searchRecordsRequest } from '../../../../store/actions';
import { setSearchQuery, IDateRangeQuery, setDateRangeQuery } from '../store/actions';
import DayjsDatePicker from '../../../../../../shared/components/DayjsDatePicker/DayjsDatePicker'
import dayjs from 'dayjs'
import '../styles.scss';

const { Option } = Select;
const { RangePicker } = DayjsDatePicker;

interface Props {
  moduleName: string | undefined,
  entityName: string | undefined,
  recordReducer: any,
  recordTableReducer: any,
  schemaReducer: SchemaReducerState,
  queryBuilderReducer: any,
  setQuery: any,
  configure: any,
  searchRecords: any
}

interface State {
  property: string | undefined
  period: string | undefined
}


class DateFilters extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      property: undefined,
      period: undefined,
    }
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<{}>, snapshot?: any): void {
    if(prevProps.queryBuilderReducer.dateRangeFilters !== this.props.queryBuilderReducer.dateRangeFilters) {
      this.fetchData();
    }

    if(prevProps.queryBuilderReducer?.dateRangeFilters?.property !== this.props.queryBuilderReducer?.dateRangeFilters?.property) {
      this.setState({
        property: this.props.queryBuilderReducer.dateRangeFilters.property,
      });
    }
  }

  initialize() {
    const { queryBuilderReducer } = this.props;

    this.setState({
      property: queryBuilderReducer.dateRangeFilters.property,
    });

  }

  handleInputChange(gte: string | undefined, lte: string) {
    const { queryBuilderReducer, setQuery } = this.props;
    setQuery({ property: this.state.property || queryBuilderReducer?.dateRangeFilters?.property, gte, lte });
  }

  private isSelected(elem?: string) {
    const { queryBuilderReducer } = this.props;
    if(queryBuilderReducer?.dateRangeFilters?.gte === elem) {
      return true;
    } else {
      return false;
    }
  }

  // private setPeriod(period:string){
  //   switch(period){
  //     case 'Yesterday':
  //       this.handleInputChange('now-1d/d', 'now/d')
  //       break
  //     case 'Today':
  //       this.handleInputChange('now/d', 'now')
  //       break
  //     case 

  //   }
  // }
  private onChangePeriod(dates:null | [ any, any ], dateStrings:[ string, string ]) {
    console.log('From: ', dates?.[0], ', to: ', dates?.[1]);
    console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    this.handleInputChange(dateStrings[0]||undefined, dateStrings[1]||'now')
  }


  renderFieldInput() {

    const { queryBuilderReducer, entityName } = this.props;

    return (
      <div>
        <div>
          <Select
            style={{ width: '100%' }}
            key="property"
            defaultValue={queryBuilderReducer?.dateRangeFilters?.property}
            value={this.state.property}
            placeholder="Date fields"
            allowClear
            onChange={(value) => this.setState({ property: value })}>
            {/* onSelect={(value) => this.setState({ property: value })}> */}
            <Option value="createdAt">created</Option>
            <Option value="updatedAt">updated</Option>
            <Option value="stageUpdatedAt">stage updated</Option>
            {entityName === 'WorkOrder' &&
            <Option value="ServiceAppointment.dbRecords.properties.Date">Service Appointment</Option>}
            {entityName === 'Invoice' &&
            <Option value="properties.DueDate">Due Date</Option>}
          </Select>
        </div>
        {this.state.property && <div style={{ marginTop: 12 }}>
          <RangePicker
          ranges={{
          Yesterday: [dayjs(), dayjs()],
          Today: [dayjs(), dayjs()],
          'This Week': [dayjs().startOf('month'), dayjs().endOf('month')],
          'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
          'This Year': [dayjs().startOf('month'), dayjs().endOf('month')],
          }}
          onChange={this.onChangePeriod.bind(this)}
          />
        </div>}
      </div>
    )
  }

  private fetchData() {
    const { searchRecords, recordReducer, queryBuilderReducer, schemaReducer, moduleName, entityName } = this.props;

    if(moduleName && entityName) {
      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);
      if(schema) {
        searchRecords({
          schema: schema,
          searchQuery: {
            schemas: schema.id,
            terms: recordReducer.searchQuery.terms,
            sort: recordReducer.searchQuery.sort,
            boolean: queryBuilderReducer.queries,
          },
        });
      }
    }
  }

  render() {
    return (
      <div style={{ margin: '10px', width: '95%' }}>
        <Col>
          {this.renderFieldInput()}
        </Col>
      </div>
    )
  }

}


const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  recordTableReducer: state.recordTableReducer,
  schemaReducer: state.schemaReducer,
  queryBuilderReducer: state.queryBuilderReducer,
});

const mapDispatch = (dispatch: any) => ({
  configure: (params: any) => dispatch(setSearchQuery(params)),
  searchRecords: (params: { schema: SchemaEntity, searchQuery: SearchQueryType }) => dispatch(searchRecordsRequest(
    params)),
  setQuery: (query: IDateRangeQuery) => dispatch(setDateRangeQuery(query)),
});

export default connect(mapState, mapDispatch)(DateFilters);
