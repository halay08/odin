import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { Col, Divider, Input, Layout, List, Menu, Row, Dropdown, Tag, Spin, Button } from 'antd';
import { MoreOutlined } from "@ant-design/icons"
import Text from 'antd/es/typography/Text';
import React from 'react';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import OdinFormModal from '../../../../../core/records/components/Forms/FormModal';
import { initializeRecordForm } from '../../../../../core/records/components/Forms/store/actions';
import { createRecordsRequest, ISearchRecords, searchRecordsRequest } from '../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../../core/schemas/store/actions';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { parseDateToLocalFormat } from '../../../../../shared/utilities/dateHelpers';
import { getRecordListFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import { getDefaultFields, setSearchQuery, setSortQuery } from '../../../../../shared/utilities/searchHelpers';
import { getPremiseByUdprnAndUmprnRequest, premiseListCancelRequests, setSelectedPremise } from '../store/actions';
import { Premise } from '../types/premise.interface';
import { CREATE_DB_RECORD_REQUEST } from "../../../../../core/records/store/constants";
import history from "../../../../../shared/utilities/browserHisory";
import { SchemaModuleTypeEnums } from "@d19n/models/dist/schema-manager/schema/types/schema.module.types";

const { CRM_MODULE } = SchemaModuleTypeEnums;

const { Search } = Input;

interface Props {
  moduleName: string,
  entityName: string,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  identityReducer: any,
  cancelRequests: any,
  selectPremise: any,
  searchRecords: any,
  initializeForm: any,
  getSchema: any,
  getPremiseByUdprnAndUmprn: any
  createRecord: any,
}

interface State {
  coordinates: number[][]
}

const uuid = uuidv4();

class PremiseListView extends React.Component<Props, State> {

  constructor(props: any) {
    super(props);

    this.state = {
      coordinates: [],
    }

  }

  componentDidMount(): void {
    this.loadSchema();
  }


  loadSchema() {
    const { getSchema } = this.props;
    // get schema by module and entity and save it to the local state
    getSchema({ moduleName: 'CrmModule', entityName: 'Address' });
    getSchema({ moduleName: 'CrmModule', entityName: 'Premise' });
    getSchema({ moduleName: 'CrmModule', entityName: 'Contact' });
    getSchema({ moduleName: 'CrmModule', entityName: 'Visit' });
  }

  async initializeFormForNewVisit(params: DbRecordEntityTransform) {

    const { schemaReducer, initializeForm } = this.props;
    const { coordinates } = this.state;

    if(!!schemaReducer.list) {

      const UDPRN = getProperty(params, 'UDPRN');
      const UMPRN = getProperty(params, 'UMPRN');

      const visitSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, 'CrmModule', 'Visit');

      if(visitSchema) {
        return initializeForm({
          formUUID: uuid,
          title: 'New Visit',
          showFormModal: true,
          isBatchCreateReq: true,
          schema: visitSchema,
          modified: [
            {
              schemaId: visitSchema.id,
              properties: {
                UDPRN,
                UMPRN,
                Coordinates: coordinates,
              },
            },
          ],
          sections: [ { name: visitSchema.name, schema: visitSchema } ],
          payload: [],
        });
      }
    }
  }


  searchRecordOnChange(e: any) {
    const { schemaReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: e.target.value,
          fields: getDefaultFields(moduleName, entityName),
          schemas: schema.id,
          sort: setSortQuery(schemaReducer, recordReducer, moduleName, entityName),
        },
      });
    }
  }

  renderUserName(item: DbRecordEntityTransform) {
    const { identityReducer } = this.props;
    if(!!item.LastVisitBy) {
      if(item.LastVisitBy === identityReducer.user.id) {
        return <div className="list-item-with-label"><Text strong className="label">User: </Text>
          <div>{identityReducer.user.firstname} {identityReducer.user.lastname}</div>
        </div>
      }
    }
  }

  renderVisitBadge(item: DbRecordEntityTransform) {

    const VisitOutcome = getProperty(item, 'VisitOutcome')

    if(VisitOutcome) {
      return (
        <div className="list-item-with-label">
          <Text strong className="label">Last Visit: </Text>
          <Text>{getProperty(item, 'VisitOutcome')}</Text>
        </div>
      )
    } else {
      return <div className="list-item-with-label"><Text strong className="label">Last Visit: </Text><Text>-</Text></div>
    }
  }

  renderFollowUpTime(item: DbRecordEntityTransform) {

    const VisitFollowUpDate = getProperty(item, 'VisitFollowUpDate');

    if(VisitFollowUpDate) {
      if(parseDateToLocalFormat(VisitFollowUpDate)) {
        return (
          <div className="list-item-with-label">
            <Text strong className="label">Follow up: </Text><Text>{parseDateToLocalFormat(VisitFollowUpDate)}</Text>
          </div>
        )
      } else {
        return (
          <div className="list-item-with-label">
            <Text strong className="label">Follow up: </Text><Text>-</Text>
          </div>
        )
      }
    } else {
      return (
        <div className="list-item-with-label">
          <Text strong className="label">Follow up: </Text><Text>-</Text>
        </div>
      )
    }
  }

  handleSelectedPremise(params: any) {

    const { selectPremise } = this.props;
    selectPremise(params);

    const { schemaReducer, createRecord, getPremiseByUdprnAndUmprn } = this.props;

    const addressSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, 'CrmModule', 'Address');

    if(addressSchema) {

      const UDPRN = getProperty(params, 'UDPRN');
      const UMPRN = getProperty(params, 'UMPRN');
      const FullAddress = getProperty(params, 'FullAddress');
      const AddressLine1 = getProperty(params, 'AddressLine1');
      const AddressLine2 = getProperty(params, 'AddressLine2');
      const AddressLine3 = getProperty(params, 'AddressLine3');
      const PostalCode = getProperty(params, 'PostalCode');
      const Premise = getProperty(params, 'Premise');
      const PostTown = getProperty(params, 'PostTown');

      getPremiseByUdprnAndUmprn({ udprn: UDPRN, umprn: UMPRN }, (res: any) => {

        const newAddress = {
          entity: `${addressSchema.moduleName}:${addressSchema.entityName}`,
          schemaId: addressSchema.id,
          title: params.title,
          properties: {
            'Type': 'BILLING',
            'AddressLine1': AddressLine1,
            'AddressLine2': AddressLine2,
            'AddressLine3': AddressLine3,
            'City': 'NA',
            'PostalCode': PostalCode,
            'CountryCode': 'GB',
            'SalesStatus': res.status ? res.status.toUpperCase() : 'REGISTER_INTEREST',
            'UDPRN': UDPRN,
            'UMPRN': UMPRN,
            'AvailableSeason': null,
            'AvailableYear': null,
            'FullAddress': FullAddress,
            'Premise': Premise,
            'PostTown': PostTown,
          },
        };

        createRecord({
          schema: addressSchema,
          createUpdate: [ newAddress ],
        }, (res: DbRecordEntityTransform) => {

          if(res && res.id)
            history.push(`/${CRM_MODULE}/Address/${res.id}`)
        });

      });
    }


  }

  onFormSubmitSuccess() {
    const { schemaReducer, recordReducer, moduleName, entityName, searchRecords } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    if(schema) {
      searchRecords({ schema, searchQuery: recordReducer.searchQuery[schema.id] })
    }

  }

  render() {


    const { recordReducer, schemaReducer, moduleName, entityName } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, moduleName, entityName);

    return (

      <Layout className='premise-list-view' style={{ padding: '10px' }}>

        <OdinFormModal formUUID={uuid} onSubmitEvent={() => this.onFormSubmitSuccess()}/>

        <Search
          className="search-input"
          placeholder="search records"
          value={setSearchQuery(schemaReducer, recordReducer, moduleName, entityName)}
          onChange={e => this.searchRecordOnChange(e)}
        />
        <Spin spinning={recordReducer.isCreating}>
          <List
            bordered
            className="list"
            loading={recordReducer.isSearching}
            style={{ padding: '15px' }}
            dataSource={schema ? getRecordListFromShortListById(recordReducer.list, schema.id) : []}
            renderItem={(item: DbRecordEntityTransform) => (
              <>
                <Row>

                  {/* Address / Title */}
                  <Col style={{ textAlign: 'left', paddingTop: '2px' }}>
                    <Text style={{ color: '#1890ff' }}><span onClick={() => this.handleSelectedPremise(item)} style={{
                      fontSize: '1.1em',
                      fontWeight: 500
                    }}>{item.title}</span></Text>
                  </Col>

                  {
                    this.renderVisitBadge(item)
                      ?
                      <Col span={24}>
                        <div style={{ paddingTop: '5px' }}>{this.renderVisitBadge(item)}</div>
                      </Col>
                      :
                      <></>
                  }

                  {
                    this.renderFollowUpTime(item)
                      ?
                      <Col span={24}>
                        <div style={{ paddingTop: '5px' }}>{this.renderFollowUpTime(item)}</div>
                      </Col>
                      :
                      <></>
                  }

                  {
                    this.renderUserName(item)
                      ?
                      <Col span={24}>
                        <div style={{ paddingTop: '7px' }}>{this.renderUserName(item)}</div>
                      </Col>
                      :
                      <></>
                  }

                </Row>
                <Divider orientation="center" style={{ margin: "18px 0px", borderTopColor: "#d6d6d6" }}/>
              </>
            )}
          />
        </Spin>


      </Layout>)
  }

}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  identityReducer: state.identityReducer,
});

const mapDispatch = (dispatch: any) => ({
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  cancelRequests: () => dispatch(premiseListCancelRequests()),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
  getPremiseByUdprnAndUmprn: (params: any, cb: () => {}) => dispatch(getPremiseByUdprnAndUmprnRequest(params, cb)),
  selectPremise: (params: Premise) => dispatch(setSelectedPremise(params)),
});


export default connect(mapState, mapDispatch)(PremiseListView);
