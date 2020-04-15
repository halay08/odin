import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { PipelineStageEntity } from '@d19n/models/dist/schema-manager/pipeline/stage/pipeline.stage.entity';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Col, Descriptions, Layout, Popconfirm, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MailActivityFeed from '../../../../../core/notifications/components/MailActivityFeed';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import ActivityFeed from '../../../../../core/records/components/ActivityFeed';
import DetailPanelLeft from '../../../../../core/records/components/DetailPanelLeft';
import FileUploaderDragAndDrop from '../../../../../core/records/components/Files/FileUploaderDragAndDrop';
import NoteForm from '../../../../../core/records/components/Note/NoteForm';
import Pipeline from '../../../../../core/records/components/Pipeline/Pipeline';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import AssociationCardWithTabsList
  from '../../../../../core/recordsAssociations/components/AssociationCardWithTabsList';
import AssociationDataTable from '../../../../../core/recordsAssociations/components/AssociationDataTable/DataTable';
import AssociationDescriptionList from '../../../../../core/recordsAssociations/components/AssociationDescriptionList';
import CardWithTabs from '../../../../../shared/components/CardWithTabs';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import SwapCustomerDeviceRouter from '../../../../ServiceModule/SwapCustomerDeviceRouter';
import ServiceAppointmentCancelModal from '../../ServiceAppointmentCancelModal';
import WorkOrderCancellationWorkflow from '../WorkOrderCancelModal';

const { ORDER_MODULE, CRM_MODULE, FIELD_SERVICE_MODULE } = SchemaModuleTypeEnums;
const { ORDER, ADDRESS, CONTACT, SERVICE_APPOINTMENT, ORDER_ITEM, ACCOUNT } = SchemaModuleEntityTypeEnums;

interface Props {
  recordReducer: IRecordReducer,
  match: any,
  sendConfirmation: any,
}

interface State {
  nextStage: PipelineStageEntity | undefined,
}


class WorkOrderDetaiLView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      nextStage: undefined,
    }

  }

  /* Get WO Type and assign appropriate Sendgrid template */
  getEmailActionType(workOrder:any){
    if(workOrder){

      const workOrderType = getProperty(workOrder, 'Type')

      switch(workOrderType){
        case 'INSTALL': return 'SENDGRID_WORK_ORDER_CONFIRMATION'
        case 'SERVICE': return 'SENDGRID_WORK_ORDER_SERVICE_CONFIRMATION'
        default: return null
      }

    }
  }

  render() {

    const { recordReducer, match, sendConfirmation } = this.props;
    const { nextStage } = this.state;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);
    console.log('WorkOrderDetaiLView_RECORD', record);
    console.log('nextStage', nextStage);

    return (<Layout className='record-detail-view'>

      <WorkOrderCancellationWorkflow stage={nextStage} record={record}
                                     onClosEvent={() => this.setState({ nextStage: undefined })}/>
      <ServiceAppointmentCancelModal/>
      <SwapCustomerDeviceRouter/>
      <Row gutter={{ xs: 8, sm: 14, md: 14, lg: 14 }}>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-left-panel">
            <DetailPanelLeft record={record}>
              <Descriptions
                style={{ marginBottom: 14 }}
                size="small"
                layout="vertical"
                column={1}
              >
                <Descriptions.Item label={'Type'}>{getProperty(
                  record,
                  'Type',
                )}</Descriptions.Item>
                <Descriptions.Item label={'Requested Delivery'}>{getProperty(
                  record,
                  'RequestedDeliveryDate',
                )}</Descriptions.Item>
              </Descriptions>
            </DetailPanelLeft>


            <AssociationDescriptionList
              title="Contact"
              record={record}
              moduleName={CRM_MODULE}
              entityName={CONTACT}
              layout="vertical"
              showRecordTitle
              hasColumnMappings
              addRecordTitleLink
              disableListActions
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'EmailAddress',
                'Phone',
              ]}/>

            <AssociationDescriptionList
              title="Address"
              record={record}
              moduleName={CRM_MODULE}
              entityName={ADDRESS}
              layout="vertical"
              showRecordTitle
              hasColumnMappings
              addRecordTitleLink
              disableListActions
              recordKeys={[
                'title',
              ]}
              propKeys={[
                'Type',
                'SalesStatus',
              ]}/>

          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="record-detail-left-panel">
            <Pipeline className="record-pipeline" record={record}
                      overrideInitializeFormOnFail={(stage: PipelineStageEntity) => this.setState({ nextStage: stage })}
            />
            <CardWithTabs
              title="Options"
              defaultTabKey="Summary"
              tabList={[
                {
                  key: 'Summary',
                  tab: 'Summary',
                },
                {
                  key: 'Order',
                  tab: 'Order',
                },
                {
                  key: 'Account',
                  tab: 'Account',
                },
                {
                  key: 'Address',
                  tab: 'Address',
                },
                {
                  key: 'Contact',
                  tab: 'Contact',
                },
                {
                  key: 'Files',
                  tab: 'Files',
                },
                {
                  key: 'Communication',
                  tab: 'Communications',
                },
              ]}
              contentList={{
                Summary: <div>
                  <AssociationDataTable
                    title={SERVICE_APPOINTMENT}
                    record={record}
                    moduleName={FIELD_SERVICE_MODULE}
                    entityName={SERVICE_APPOINTMENT}/>

                  <AssociationDataTable
                    title={'Cancellation Reason'}
                    record={record}
                    moduleName={FIELD_SERVICE_MODULE}
                    entityName={'CancellationReason'}
                    isCreateHidden/>

                  <AssociationCardWithTabsList
                    title={'Products'}
                    hideTabs={[ 'Summary', 'Product' ]}
                    record={record}
                    moduleName={ORDER_MODULE}
                    entityName={ORDER_ITEM}/>

                </div>,
                Order: <AssociationDataTable
                  title={ORDER}
                  record={record}
                  moduleName={ORDER_MODULE}
                  entityName={ORDER}/>,
                Account: <AssociationDataTable
                  title={ACCOUNT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ACCOUNT}/>,
                Address: <AssociationDataTable
                  title={ADDRESS}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={ADDRESS}/>,
                Contact: <AssociationDataTable
                  title={CONTACT}
                  record={record}
                  moduleName={CRM_MODULE}
                  entityName={CONTACT}/>,
                Communication: <div>
                  <div style={{ display: 'flex' }}>
                    <Popconfirm
                      title={
                        `Do you want to send the ${record ? getProperty(record, 'Type') : ''} email confirmation?`
                      }
                      onConfirm={() => sendConfirmation(`FieldServiceModule/v1.0/WorkOrder/${record ? record.id : null}/email/${record ? this.getEmailActionType(record) : null}`)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="primary">Send Confirmation</Button>
                    </Popconfirm>
                  </div>
                  <MailActivityFeed record={record}/>
                </div>,
                Files:
                  <div>
                    <FileUploaderDragAndDrop record={record}/>
                    <AssociationDataTable
                      title="Files"
                      record={record}
                      moduleName="SchemaModule"
                      entityName="File"/>
                  </div>,
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={6}>
          <div className="record-detail-right-panel">
            <CardWithTabs
              title="Updates"
              defaultTabKey="Notes"
              tabList={[
                {
                  key: 'Notes',
                  tab: 'Notes',
                },
                {
                  key: 'Activity',
                  tab: 'Activity',
                },
              ]}
              contentList={{
                Notes: <NoteForm record={record}/>,
                Activity: <ActivityFeed/>,
              }}
            />
          </div>
        </Col>
      </Row>
    </Layout>)
  }

}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(WorkOrderDetaiLView));
