import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaEntity } from '@d19n/models/dist/schema-manager/schema/schema.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SearchQueryType } from '@d19n/models/dist/search/search.query.type';
import { Button, Card, Collapse, Descriptions, Layout, List, Row, Spin, Tag, Typography } from 'antd';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { resetRecordsList, searchRecordsRequest } from '../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../core/records/store/reducer';
import { IRecordAssociationsReducer } from '../../../../core/recordsAssociations/store/reducer';
import { getSchemaByModuleAndEntityRequest } from '../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../core/schemas/store/reducer';
import StageNameTag from '../../../../shared/components/StageNameTag';
import { parseDateToLocalFormat } from '../../../../shared/utilities/dateHelpers';
import { getBrowserPath, getRecordListFromShortListById } from '../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';

interface Props {
  moduleName: string,
  entityName: string,
  identityReducer: any,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  searchRecords: any,
  getSchemaByEntity: any,
  resetRecordReducer: any
}

interface State {
  selectedDate: string
}

const { FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { WORK_ORDER } = SchemaModuleEntityTypeEnums;

class EngineerWorkOrders extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { selectedDate: moment().format('YYYY-MM-DD') };
  }

  componentDidMount() {
    const { getSchemaByEntity } = this.props;

    getSchemaByEntity({ moduleName: FIELD_SERVICE_MODULE, entityName: WORK_ORDER });
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    if(prevProps.schemaReducer.isRequesting != this.props.schemaReducer.isRequesting) {
      this.fetchData();
    }

    if(prevState.selectedDate != this.state.selectedDate) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    const { resetRecordReducer } = this.props;
    resetRecordReducer();
  }


  private fetchData() {
    const { schemaReducer, searchRecords } = this.props;
    const { selectedDate } = this.state;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, FIELD_SERVICE_MODULE, WORK_ORDER);

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          schemas: schema.id,
          terms: '',
          sort: [ { 'ServiceAppointment.dbRecords.properties.TimeBlock.keyword': { order: 'asc' } } ],
          boolean: {
            should: [
              {
                query_string: {
                  fields: [ 'stage.key' ],
                  query: 'WorkOrderStageScheduled',
                  lenient: true,
                  default_operator: 'OR',
                },
              },
              {
                query_string: {
                  fields: [ 'stage.key' ],
                  query: 'WorkOrderStageSurveyInProgress',
                  lenient: true,
                  default_operator: 'OR',
                },
              },
            ],
            filter: [
              {
                range: {
                  ['ServiceAppointment.dbRecords.properties.Date']: {
                    'lte': 'now-10d',
                  },
                },
              },
            ],
          },
        },
      });
    }
  }

  private renderWorkOrderList() {
    const { recordReducer, schemaReducer } = this.props;
    const { Panel } = Collapse;

    const schema = getSchemaFromShortListByModuleAndEntity(
      schemaReducer.shortList,
      SchemaModuleTypeEnums.FIELD_SERVICE_MODULE,
      SchemaModuleEntityTypeEnums.WORK_ORDER,
    );

    if(schema && schema.id) {
      return (
        <List
          dataSource={getRecordListFromShortListById(recordReducer.list, schema.id)}
          renderItem={(item, index) => (
            <List.Item key={index}>
              <div>
                <Row>
                  <Typography.Title level={4}>{item.recordNumber}</Typography.Title>
                </Row>
                <Row style={{ marginTop: 5, marginBottom: 8 }}>
                  <Link to={getBrowserPath(item) + '/Survey'} component={Typography.Link}>{item.title}</Link>
                </Row>
                <Descriptions size="small">
                  <Descriptions.Item
                    label="Date/Time">
                    <div style={{ display: 'flex' }}>
                      <div style={{ marginRight: 14 }}>
                        {parseDateToLocalFormat(getProperty(item.ServiceAppointment.dbRecords[0], 'Date'))}
                      </div>
                      <Tag>{getProperty(item.ServiceAppointment.dbRecords[0], 'TimeBlock')}</Tag>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Type">{item.properties.Type ? item.properties.Type : '-'}</Descriptions.Item>
                  <Descriptions.Item label="Stage">{item.stage && item.stage.name ?
                    <StageNameTag record={item} text={item.stage.name}/> :
                    <Tag>None</Tag>}</Descriptions.Item>
                  <Descriptions.Item label="Engineer">{item?.ownedBy?.fullName}</Descriptions.Item>
                </Descriptions>
              </div>
            </List.Item>
          )}
        />
      );
    }
  }

  render() {
    const { recordReducer } = this.props;
    const { selectedDate } = this.state;

    return (
      <Layout style={{ padding: 10 }}>
        <Card size="small" title={
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography.Text>Survey Requessts</Typography.Text>
            <Typography.Text
              style={{ fontWeight: 400 }}>{moment(selectedDate).format('dddd MMM Do')}</Typography.Text>
          </div>
        } extra={[
          <Button onClick={() => this.fetchData()}>Refresh</Button>,
        ]}>
          <Spin spinning={recordReducer.isSearching} size="small">
            {this.renderWorkOrderList()}
          </Spin>
        </Card>
      </Layout>
    )
  }
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  searchRecords: (params: { schema: SchemaEntity, searchQuery: SearchQueryType }) => dispatch(searchRecordsRequest(
    params)),
  getSchemaByEntity: (params: any) => dispatch(getSchemaByModuleAndEntityRequest(params)),
  resetRecordReducer: () => dispatch(resetRecordsList()),
});

export default connect(mapState, mapDispatch)(EngineerWorkOrders);
