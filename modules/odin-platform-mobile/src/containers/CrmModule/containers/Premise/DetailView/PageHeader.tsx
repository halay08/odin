import { Button, Col, Form, Modal, PageHeader, Row, Select, Spin, Statistic, Typography } from 'antd';
import { Option } from 'antd/es/mentions';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import history from '../../../../../shared/utilities/browserHisory';
import { updatePremiseSalesStatusRequest } from '../store/actions';
import { PremiseReducerState } from '../store/reducer';
import { Premise } from '../types/premise.interface';
import { IRecordReducer } from "../../../../../core/records/store/reducer";


interface IProps {
  record: Premise,
  identityReducer: any,
  premiseReducer: PremiseReducerState,
  recordReducer: IRecordReducer,
  updatePremiseStatus: (
    params: { createUpdate: { udprn: number | { order: string }; statusId: number; umprn: number }[] },
    cb: () => void,
  ) => {},
  refresh: () => void,
}

interface IState {
  showStatusChangeModal: boolean;
  statusId: number | null;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

class RecordPageHeader extends React.Component<IProps, IState> {

  constructor(props: any) {
    super(props);
    this.state = {
      showStatusChangeModal: false,
      statusId: null,
    };
  }

  private toggleStatusModal() {
    const { showStatusChangeModal } = this.state;
    this.setState({ showStatusChangeModal: !showStatusChangeModal });
  };


  handleSubmit = () => {
    const { statusId } = this.state;
    const { updatePremiseStatus, premiseReducer, refresh } = this.props;
    if(!!premiseReducer.selected) {
      const { UDPRN, UMPRN } = premiseReducer.selected.properties;

      const payload = [
        {
          udprn: UDPRN,
          umprn: UMPRN,
          statusId: Number(statusId),
        },
      ];

      console.log('payload', payload);

      updatePremiseStatus({ createUpdate: payload }, () => {
        this.toggleStatusModal();
        refresh();
      });
    }
  };


  render() {

    const { showStatusChangeModal } = this.state;
    const { premiseReducer, recordReducer } = this.props;
    const { Text } = Typography;


    return (
      <Fragment>

        <Modal
          className='dynamic-form-modal'
          style={{ top: 20 }}
          title="change status"
          visible={showStatusChangeModal}
          onOk={this.handleSubmit}
          confirmLoading={premiseReducer.isRequesting}
          onCancel={() => this.toggleStatusModal()}
        >
          <Form
            {...layout}
            className="dynamic-form"
            initialValues={{ remember: true }}
          >
            <Select defaultValue={!!premiseReducer.selected ? premiseReducer.selected.sales_status_id : null}
                    style={{ width: '100%' }}
                    onChange={(val) => this.setState({ statusId: val })}>
              <Option value='1'>Order</Option>
              <Option value='2'>Pre order</Option>
              <Option value='3'>Register interest</Option>
            </Select>
          </Form>
        </Modal>

        <PageHeader
          className="page-header"
          ghost={false}
          onBack={() => history.push('/CrmModule/Premise')}
          /*title={'Premise'}*/
          extra={[
            <Button key="1" type="primary" size="middle"
                    style={{ width: 150 }}
                    onClick={() => this.toggleStatusModal()}>Change status</Button>,
          ]}
        >
          <Spin spinning={premiseReducer.isRequesting}>
            <Row>
              <Col span={24} style={{ paddingTop: '10px' }}>
                <Text>Address</Text>
              </Col>
              <Col span={24} style={{ paddingTop: '7px' }}>
                <span style={{fontSize:'1.2em', fontWeight:'bold'}}>{!!premiseReducer.selected ? premiseReducer.selected.title : null}</span>
              </Col>


              {/*<Statistic title="Address" value={!!premiseReducer.selected ? premiseReducer.selected.title : null}/>*/}
            </Row>
          </Spin>
        </PageHeader>
      </Fragment>
    )
  }
}

const mapState = (state: any) => ({
  identityReducer: state.identityReducer,
  premiseReducer: state.premiseReducer,
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  updatePremiseStatus: (payload: any, cb: () => {}) => dispatch(updatePremiseSalesStatusRequest(payload, cb)),
});


export default connect(mapState, mapDispatch)(RecordPageHeader);

