import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Card, Col, Layout, Row, Steps } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import RecordPageHeader from '../../../../../core/records/components/PageHeader';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import OrderItemProductManager from '../ReplaceProduct/OrderItemProductManager';

const { Step } = Steps;

interface Props {
  recordReducer: IRecordReducer,
  sendConfirmation: any,
  match: any,
  schemaReducer: any,
}

interface State {
  currentStep: number
}

const { NOTE } = SchemaModuleEntityTypeEnums;

class OrderItemReplaceProductView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      currentStep: 0,
    }
  }

  render() {
    const { recordReducer, match } = this.props;
    const record = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);

    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">
        <Col span={24}>
          <RecordPageHeader disableClone disableDelete disableEdit record={record}/>
          <Col span={24}>
            <Card style={{marginTop: '1rem'}}>
              <Steps direction="vertical" current={0}>
                <Step title="Select Replacement Product"
                      description="Select a product and submit."/>
                <OrderItemProductManager record={record}/>
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
});

const mapDispatch = (dispatch: any) => ({
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(OrderItemReplaceProductView));
