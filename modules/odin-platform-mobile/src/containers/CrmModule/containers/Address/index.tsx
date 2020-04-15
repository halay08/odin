import React from 'react'
import { connect } from 'react-redux'
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types'
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types'
import { Button, Card, Col, Descriptions, Divider, Layout, PageHeader, Row, Spin, Typography } from 'antd'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { IRecordReducer } from '../../../../core/records/store/reducer'
import { IRecordAssociationsReducer } from '../../../../core/recordsAssociations/store/reducer'
import history from "../../../../shared/utilities/browserHisory"
import AssociationDataTable from "../../../../core/recordsAssociations/AssociationDataTable/DataTable"
import CardWithTabs from "../../../../shared/components/CardWithTabs"
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform"
import { getProperty } from "@d19n/models/dist/schema-manager/helpers/dbRecordHelpers"
import { getSchemaFromShortListByModuleAndEntity } from "../../../../shared/utilities/schemaHelpers"
import { createRecordsRequest, ISearchRecords, searchRecordsRequest } from "../../../../core/records/store/actions"
import { initializeRecordForm } from "../../../../core/records/components/Forms/store/actions"
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from "../../../../core/schemas/store/actions"
import { SchemaReducerState } from "../../../../core/schemas/store/reducer"
import { getDefaultFields, setSortQuery } from "../../../../shared/utilities/searchHelpers"
import EmbeddedMobileForm from "../../../../core/records/components/Forms/EmbeddedMobileForm"
import OdinFormModal from "../../../../core/records/components/Forms/FormModal"
import { getPremiseByUdprnAndUmprnRequest, premiseListCancelRequests } from "../Premise/store/actions"
import { parseDateToLocalFormat } from "../../../../shared/utilities/dateHelpers";
import {
  getRecordFromShortListById,
  getRecordRelatedFromShortListById,
} from '../../../../shared/utilities/recordHelpers'
import { HomeOutlined, UserOutlined, PartitionOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from "uuid"
import "./styles.scss"

const uuid = uuidv4();
const { ORDER_MODULE, CRM_MODULE, BILLING_MODULE, FIELD_SERVICE_MODULE, SERVICE_MODULE } = SchemaModuleTypeEnums
const {
  ADDRESS, LEAD, ACCOUNT, CONTACT, INVOICE, ORDER,
  WORK_ORDER, CUSTOMER_DEVICE_ONT, CUSTOMER_DEVICE_ROUTER,
} = SchemaModuleEntityTypeEnums

type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  match: any,
  hasColumnMappings?: boolean,
  visibleProperties?: string[],
  schemaReducer: SchemaReducerState,
  identityReducer: any,
  cancelRequests: any,
  searchRecords: any,
  initializeForm: any,
  getSchema: any,
  getPremiseByUdprnAndUmprn: any
  createRecord: any,
  recordFormReducer: any,
  navigationReducer: any
}

interface State {
  coordinates: number[][],
  Visit: any,
  UDPRN: string,
  UMPRN: string
}


class AddressDetailView extends React.Component<PropsType, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      coordinates: [],
      Visit: null,
      UDPRN: '',
      UMPRN: ''
    }
  }

  async initializeFormForNewVisit() {

    const record = this.getAddressRecord()
    const { coordinates } = this.state;
    const { schemaReducer, initializeForm } = this.props;

    if(!!schemaReducer.list && record) {

      const visitSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, 'Visit');

      if(visitSchema) {
        return initializeForm({
          formUUID: uuid,
          title: 'Record New Visit',
          showFormModal: true,
          isBatchCreateReq: true,
          schema: visitSchema,
          modified: [
            {
              schemaId: visitSchema.id,
              properties: {
                UDPRN: this.state.UDPRN,
                UMPRN: this.state.UMPRN,
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

  /* Get schema by module and entity and save it to the local state */
  loadSchema() {
    const { getSchema } = this.props
    getSchema({ moduleName: CRM_MODULE, entityName: ADDRESS })
    getSchema({ moduleName: CRM_MODULE, entityName: CONTACT })
    getSchema({ moduleName: CRM_MODULE, entityName: LEAD })
    getSchema({ moduleName: CRM_MODULE, entityName: 'Visit' })
  }

  /* Get location that we need for saving the Visit */
  getGeolocation() {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((res) => {
        this.setState({
          coordinates: [ [ res.coords.longitude, res.coords.latitude ] ],
        })
      }, (err) => {
        console.error(err)
      })
    }
  }

  searchVisitOnUDPRN = () => {

    const { searchRecords, schemaReducer, recordReducer } = this.props
    const visitSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, 'Visit')

    if(visitSchema) {
      searchRecords({
        schema: visitSchema,
        searchQuery: {
          terms: this.state.UDPRN + ' ',
          fields: getDefaultFields(CRM_MODULE, 'Visit'),
          schemas: visitSchema.id,
          sort: setSortQuery(schemaReducer, recordReducer, CRM_MODULE, 'Visit'),
        },
      })
    }

  }


  /* If previous and current search results for Visit record differ -> update the State with new Premise  */
  componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<State>, snapshot?: any) {
    const { schemaReducer, recordReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, 'Visit');

    if(schema) {

      if(prevProps.recordReducer.list[schema.id] !== recordReducer.list[schema.id]) {

        const visit = recordReducer.list[schema.id].find(visit => {
          return getProperty(visit, 'UDPRN') == this.state.UDPRN
        })

        if(visit)
          this.setState({ Visit: visit })

      }
    }
  }

  getAddressRecord = () => {

    let record: DbRecordEntityTransform
    const { recordReducer, match, hasColumnMappings, recordAssociationReducer } = this.props

    if(hasColumnMappings) {
      record = getRecordRelatedFromShortListById(
        recordAssociationReducer.shortList,
        match.params.dbRecordAssociationId,
        match.params.recordId,
      )
    } else {
      record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId)
    }

    return record

  }


  componentDidMount() {

    this.loadSchema()
    this.getGeolocation()
    const record = this.getAddressRecord()

    /* Search for Premise on UDPRN extracted from Address record */
    if(record && !this.state.Visit) {
      this.setState({
        UDPRN: getProperty(record, 'UDPRN'),
        UMPRN: getProperty(record, 'UMPRN'),
      }, () => this.searchVisitOnUDPRN())

    }

  }

  /* Save Contact form with the related Address record */
  handleContactFormSave = () => {

    const record = this.getAddressRecord()
    const { schemaReducer, recordFormReducer, createRecord } = this.props

    const contactSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, CONTACT)
    const leadSchema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, CRM_MODULE, LEAD)

    let modified = recordFormReducer.modified;


    if(contactSchema && leadSchema) {

      if(modified[0]) {

        modified[0].associations = [ { recordId: record.id } ]
        modified[0].title = `${getProperty(modified[0], 'FirstName')} ${getProperty(modified[0], 'LastName')}`

        /* Create Contact */
        createRecord({
          schema: contactSchema,
          upsert: recordFormReducer.upsert,
          createUpdate: modified
        }, () => {

          /* Then Create Lead */
          createRecord({
            schema: leadSchema,
            upsert: recordFormReducer.upsert,
            createUpdate: [
              {
                title: `${getProperty(modified[0], 'FirstName')} ${getProperty(modified[0], 'LastName')}`,
                schemaId: leadSchema.id,
                entity: LEAD,
                associations: [ { recordId: record.id } ]
              }
            ]
          })

        })

      }

    }

  }


  render() {

    const { Text } = Typography;
    const record = this.getAddressRecord()
    const { schemaReducer, recordReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, 'CrmModule', 'Contact');

    return (
      <>

        {/* Page Header */}
        <PageHeader
          className="page-header"
          ghost={false}
          title={
            <span
              onClick={() => history.push('/CrmModule/Premise')}>
              Back
            </span>
          }
          onBack={() => history.push('/CrmModule/Premise')}
        >
          <OdinFormModal formUUID={uuid} onSubmitEvent={() => this.searchVisitOnUDPRN()}/>

          <Row>
            <Col span={24}>
              <Divider style={{ marginTop: 0, marginBottom: '15px' }}/>
            </Col>
          </Row>

          {/* Address Title */}
          <Row style={{ textAlign: 'center', backgroundColor: '#e4f2ff', borderRadius: '5px', padding: '12px' }}>
            <Col span={24}>
              <Text>Address</Text>
            </Col>
            <Col span={24} style={{ paddingTop: '5px' }}>
              <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{record ? record.title : '-'}</span>
            </Col>
          </Row>

        </PageHeader>


        <Layout className='record-detail-view'>
          <Row gutter={12} className="record-main-content-row">

            {/* Address Details Card */}
            <Col span={24} style={{ marginBottom: '15px' }}>

              <Card title={
                <span><HomeOutlined className="mobileCardIcon"/>Address Details</span>
              }
                    extra={
                      <Button
                        type="primary"
                        onClick={() => this.initializeFormForNewVisit()}>
                        Update Visit
                      </Button>
                    }
              >

                <Descriptions bordered>

                  <Descriptions.Item label="Follow up date">
                    {
                      <Spin spinning={recordReducer.isSearching}>
                        {getProperty(this.state.Visit, 'FollowUpDate')
                          ? parseDateToLocalFormat(getProperty(this.state.Visit, 'FollowUpDate'))
                          : '-'}
                      </Spin>
                    }
                  </Descriptions.Item>

                  <Descriptions.Item label="Not Interested Reason">
                    {
                      <Spin spinning={recordReducer.isSearching}>
                        {getProperty(this.state.Visit, 'NotInterestedReason')
                          ? getProperty(this.state.Visit, 'NotInterestedReason')
                          : '-'}
                      </Spin>
                    }
                  </Descriptions.Item>

                  <Descriptions.Item label="Outcome">
                    {
                      <Spin spinning={recordReducer.isSearching}>
                        {getProperty(this.state.Visit, 'Outcome')
                          ? getProperty(this.state.Visit, 'Outcome')
                          : '-'}
                      </Spin>
                    }
                  </Descriptions.Item>

                  <Descriptions.Item label="Sales status">
                    <Spin spinning={recordReducer.isSearching}>
                      {
                        recordReducer.isSearching
                          ? '-'
                          : getProperty(record, 'SalesStatus')
                      }
                    </Spin>
                  </Descriptions.Item>

                </Descriptions>

              </Card>

            </Col>


            {/* Contact Details Card */}
            <Col span={24} style={{ marginBottom: '15px' }}>


              <Card title={
                <span><UserOutlined className="mobileCardIcon"/>Contact Details</span>
              }
                    extra={
                      <Button
                        type="primary"
                        loading={recordReducer.isCreating}
                        onClick={() => this.handleContactFormSave()}>
                        Update Details
                      </Button>
                    }
              >
                <div style={{ padding: '10px' }}>
                  <EmbeddedMobileForm
                    moduleName="CrmModule"
                    entityName="Contact"
                    formUUID={uuid}
                    schema={schema}
                    isCreateRecord={true}
                  />
                </div>
              </Card>
            </Col>


            {/* Associated Records */}
            <Col span={24} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                <CardWithTabs
                  title={
                    <span><PartitionOutlined className="mobileCardIcon"/>Associated Records</span>
                  }
                  defaultTabKey="Order"
                  tabList={[
                    {
                      key: 'Order',
                      tab: 'Orders',
                    },
                    {
                      key: 'WorkOrder',
                      tab: 'WorkOrders',
                    },
                    {
                      key: 'Billing',
                      tab: 'Billing',
                    },
                    {
                      key: 'CustomerDevices',
                      tab: 'CustomerDevices',
                    },
                    {
                      key: 'Contact',
                      tab: 'Contacts',
                    },
                    {
                      key: 'Lead',
                      tab: 'Leads',
                    },
                    {
                      key: 'Account',
                      tab: 'Accounts',
                    },
                  ]}
                  contentList={{
                    Billing: <AssociationDataTable
                      title={INVOICE}
                      record={record}
                      moduleName={BILLING_MODULE}
                      entityName={INVOICE}/>,
                    Order: <AssociationDataTable
                      title={ORDER}
                      record={record}
                      moduleName={ORDER_MODULE}
                      entityName={ORDER}/>,
                    WorkOrder: <AssociationDataTable
                      title={WORK_ORDER}
                      record={record}
                      moduleName={FIELD_SERVICE_MODULE}
                      entityName={WORK_ORDER}/>,
                    Contact: <AssociationDataTable
                      title={CONTACT}
                      record={record}
                      moduleName={CRM_MODULE}
                      entityName={CONTACT}/>,
                    CustomerDevices:
                      <div>
                        <AssociationDataTable
                          title={CUSTOMER_DEVICE_ONT}
                          record={record}
                          moduleName={SERVICE_MODULE}
                          entityName={CUSTOMER_DEVICE_ONT}/>
                        <AssociationDataTable
                          title={CUSTOMER_DEVICE_ROUTER}
                          record={record}
                          moduleName={SERVICE_MODULE}
                          entityName={CUSTOMER_DEVICE_ROUTER}/>
                      </div>,
                    Lead: <AssociationDataTable
                      title={LEAD}
                      record={record}
                      moduleName={CRM_MODULE}
                      entityName={LEAD}/>,
                    Account: <AssociationDataTable
                      title={ACCOUNT}
                      record={record}
                      moduleName={CRM_MODULE}
                      entityName={ACCOUNT}/>,
                  }}
                />

              </div>
            </Col>
          </Row>
        </Layout>
      </>

    )
  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  recordAssociationReducer: state.recordAssociationReducer,
  schemaReducer: state.schemaReducer,
  identityReducer: state.identityReducer,
  recordFormReducer: state.recordFormReducer,
  navigationReducer: state.navigationReducer
})


const mapDispatch = (dispatch: any) => ({
  createRecord: (params: any, cb: any) => dispatch(createRecordsRequest(params, cb)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  cancelRequests: () => dispatch(premiseListCancelRequests()),
  initializeForm: (params: any) => dispatch(initializeRecordForm(params)),
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
  getPremiseByUdprnAndUmprn: (params: any, cb: () => {}) => dispatch(getPremiseByUdprnAndUmprnRequest(params, cb)),
})

export default withRouter(connect(mapState, mapDispatch)(AddressDetailView));
