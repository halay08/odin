import React from 'react'
import { connect } from 'react-redux'
import { Card, Col, Descriptions, Divider, Layout, PageHeader, Row, Spin, Typography } from 'antd'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { IRecordReducer } from '../../core/records/store/reducer'
import { IRecordAssociationsReducer } from '../../core/recordsAssociations/store/reducer'
import history from "../../shared/utilities/browserHisory"
import { createRecordsRequest, ISearchRecords, searchRecordsRequest } from "../../core/records/store/actions"
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from "../../core/schemas/store/actions"
import { SchemaReducerState } from "../../core/schemas/store/reducer"
import { DbRecordEntityTransform } from "@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform";
import { getRecordFromShortListById, getRecordRelatedFromShortListById } from "../utilities/recordHelpers";
import { FolderOutlined } from '@ant-design/icons';
import "./styles.scss"


type PathParams = {
  url: string,
  recordId: string
}

type PropsType = RouteComponentProps<PathParams> & {
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  match?: any,
  hasColumnMappings?: boolean,
  visibleProperties?: string[],
  schemaReducer: SchemaReducerState,
  identityReducer: any,
  searchRecords: any,
  getSchema: any,
  createRecord: any,
  navigationReducer: any
}


class PlainRecordDetailView extends React.Component<PropsType> {


  getRecord = () => {

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

  renderRecordProperties(record: any) {

    const keys = Object.keys(record.properties)


    return (
      <Descriptions bordered>
        {
          keys.map((key, index) => {
            return <Descriptions.Item label={key}>
              {record.properties[key]
                ? record.properties[key]
                : '-'
              }
            </Descriptions.Item>
          })
        }
      </Descriptions>
    )


  }

  render() {
    const { recordReducer, navigationReducer } = this.props
    const { Text } = Typography
    const record = this.getRecord()


    return (
      <>

        {/* Page Header */}
        <PageHeader
          className="page-header"
          ghost={false}
          title={
            <span
              onClick={() =>
                history.push(navigationReducer.previousPage)
              }>
              Back
            </span>
          }
          onBack={() => history.push(navigationReducer.previousPage)}
        >

          <Row>
            <Col span={24}>
              <Divider style={{ marginTop: 0, marginBottom: '15px' }}/>
            </Col>
          </Row>

          {/* Record Title */}
          <Row style={{ textAlign: 'center', backgroundColor: '#e4f2ff', borderRadius: '5px', padding: '12px' }}>
            <Col span={24}>
              <Text>{
                record
                  ? record.entity.split(':')[1]
                  : 'Unknown Entity'
              }</Text>
            </Col>
            <Col span={24} style={{ paddingTop: '5px' }}>
              <Spin spinning={recordReducer.isRequesting}>
              <span style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{
                record ? record.title : '-'
              }</span>
              </Spin>
            </Col>
          </Row>

        </PageHeader>


        <Layout className='record-detail-view'>
          <Row gutter={12} className="record-main-content-row">

            {/* Address Details Card */}
            <Col span={24} style={{ marginBottom: '15px' }}>

              <Card title={<span><FolderOutlined className="mobileCardIcon"/>Record Details</span>}>

                <Spin spinning={recordReducer.isRequesting}>
                {
                  record
                    ? this.renderRecordProperties(record)
                    : <></>
                }
                </Spin>


              </Card>

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
  getSchema: (params: ISchemaByModuleAndEntity) => dispatch(getSchemaByModuleAndEntityRequest(params)),
})

export default withRouter(connect(mapState, mapDispatch)(PlainRecordDetailView));
