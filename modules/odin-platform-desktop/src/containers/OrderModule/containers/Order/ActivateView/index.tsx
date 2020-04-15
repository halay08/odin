import { DbRecordAssociationRecordsTransform } from '@d19n/models/dist/schema-manager/db/record/association/transform/db.record.association.records.transform';
import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Card, Col, Divider, Empty, Layout, Row, Steps, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import RecordPageHeader from '../../../../../core/records/components/PageHeader';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { IRecordAssociationsReducer } from '../../../../../core/recordsAssociations/store/reducer';
import { getBrowserPath, getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import SingleInvoiceView from '../../../../BillingModule/containers/Invoice/SingleInvoiceView';
import OrderGenerateInvoice from '../GenerateInvoice';

const { Step } = Steps;

interface Props {
  recordReducer: IRecordReducer,
  recordAssociationReducer: IRecordAssociationsReducer,
  sendConfirmation: any,
  match: any,
  schemaReducer: any,
}

interface State {
  currentStep: number
}

const { INVOICE } = SchemaModuleEntityTypeEnums;

class OrderActivateView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      currentStep: 0,
    }
  }

  sortInvoicesByCreatedAt(associationObj: { [key: string]: DbRecordAssociationRecordsTransform }) {
    if(associationObj[INVOICE].dbRecords) {

      const invoicesSorted = associationObj[INVOICE].dbRecords.sort((
        elemA: DbRecordEntityTransform,
        elemB: DbRecordEntityTransform,
      ) => {
        // @ts-ignore
        return elemA && elemB && new Date(elemB.createdAt || '') - new Date(elemA.createdAt || '')
      });
      return invoicesSorted;
    }
    return [];
  }


  render() {
    const { recordReducer, recordAssociationReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    const associationKey = `${record?.id}_${INVOICE}`;
    const associationObj: any = recordAssociationReducer.shortList[associationKey];

    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">
        <Col span={24}>
          <RecordPageHeader disableClone disableDelete disableEdit record={record}/>
          <Col span={24}>
            <Card>
              <Steps direction="vertical" current={this.state.currentStep}>
                <Step title="Select Items To Invoice"
                      description={
                        <OrderGenerateInvoice
                          record={record}
                          onStepComplete={() => this.setState({ currentStep: 2 })}/>
                      }>
                </Step>
                <Step title="Verify Invoice / Process Payment" description={<div>
                  <Row gutter={16}>
                    <Col sm={24} md={16} lg={16}>
                      {associationObj && associationObj[INVOICE] && associationObj[INVOICE].dbRecords ?
                        <div>
                          <div style={{ marginTop: 24 }}>
                            <SingleInvoiceView invoice={this.sortInvoicesByCreatedAt(associationObj)[0]}/>
                          </div>
                        </div>
                        : <Empty/>}
                    </Col>
                    <Col sm={24} md={6} lg={8}>
                      <Card type="inner" title="Existing Invoices" style={{ marginTop: 24 }}>
                        {associationObj && associationObj[INVOICE] && associationObj[INVOICE].dbRecords ?
                          <div>
                            {associationObj[INVOICE].dbRecords.map((inv: DbRecordEntityTransform) => (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <div># {inv.recordNumber}</div>
                                  <Link to={getBrowserPath(record)} component={Typography.Link}>View</Link>
                                </div>
                                <div>Status: {getProperty(inv, 'Status')}</div>
                                <div>Balance: {getProperty(inv, 'Balance')}</div>
                                <Divider/>
                              </div>
                            ))}
                          </div>
                          : <Empty/>}
                      </Card>
                    </Col>
                  </Row>
                </div>}/>
              </Steps>
            </Card>
          </Col>
        </Col>
      </Row>
    </Layout>)
  }

}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  recordAssociationReducer: state.recordAssociationReducer,
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(OrderActivateView));
