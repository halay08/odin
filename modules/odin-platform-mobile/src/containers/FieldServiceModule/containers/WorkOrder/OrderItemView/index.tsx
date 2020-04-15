import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { Col, Layout, Row, Tabs, Typography } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { sendConfirmationEmail } from '../../../../../core/notifications/email/store/actions';
import { closeRecordForm } from '../../../../../core/records/components/Forms/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { getBrowserPath, getRecordFromShortListById } from '../../../../../shared/utilities/recordHelpers';
import AddOntDevice from './AddOntDevice';
import AddRouterDevice from './AddRouterDevice';
import { showCustomerDeviceOnt, showCustomerDeviceRouter } from './component-rendering-conditions';

interface Props {
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  sendConfirmation: any,
  match: any,
  closeForm: any,
}

interface State {
  selectedTab?: string
}

class WorkOrderOrderItemView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedTab: undefined,
    }
  }

  componentDidMount() {
    this.setDefaultTab();
  }

  setDefaultTab(targetRecord?: DbRecordEntityTransform) {
    if(targetRecord) {
      if(showCustomerDeviceOnt(targetRecord)) {
        if(!this.state.selectedTab) {
          this.setState({
            selectedTab: '#tab1_ONT',
          });
        }
        return '#tab1_ONT';
      } else {
        if(!this.state.selectedTab) {
          this.setState({
            selectedTab: '#tab1_Router',
          });
        }
        return '#tab1_Router';
      }
    }
  }

  render() {
    const { recordReducer, match, closeForm } = this.props;
    const sourceRecord = getRecordFromShortListById(recordReducer.shortList, match.params.parentRecordId);
    const targetRecord = getRecordFromShortListById(recordReducer.shortList, match.params.recordId);


    return (<Layout className='record-detail-view'>
      <Row gutter={12} className="record-main-content-row">
        <Col span={24}>
          <Link to={getBrowserPath(sourceRecord)}>Back to work order</Link>
        </Col>
        <Col span={24}>
          <Typography.Title level={4}>{targetRecord?.title}</Typography.Title>
          <Tabs style={{ background: '#fff', margin: 0, padding: 12 }}
                defaultActiveKey={this.setDefaultTab(targetRecord)}
                activeKey={this.state.selectedTab}
                destroyInactiveTabPane={true}
                onChange={(key) => {
                  this.setState({ selectedTab: key });
                  closeForm();
                }}
          >
            {showCustomerDeviceOnt(targetRecord) &&
            <Tabs.TabPane forceRender={true} tab="ONT" key={`#tab1_ONT`}>
              {this.state.selectedTab === '#tab1_ONT' &&
              <AddOntDevice record={targetRecord}/>
              }
            </Tabs.TabPane>
            }
            {showCustomerDeviceRouter(targetRecord) &&
            <Tabs.TabPane forceRender={true} tab="Router" key={`#tab1_Router`}>
              {this.state.selectedTab === '#tab1_Router' &&
              <AddRouterDevice record={targetRecord}/>
              }
            </Tabs.TabPane>
            }
          </Tabs>
        </Col>
      </Row>
    </Layout>)
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  closeForm: () => dispatch(closeRecordForm()),
  sendConfirmation: (payload: any) => dispatch(sendConfirmationEmail(payload)),
});

export default withRouter(connect(mapState, mapDispatch)(WorkOrderOrderItemView));
