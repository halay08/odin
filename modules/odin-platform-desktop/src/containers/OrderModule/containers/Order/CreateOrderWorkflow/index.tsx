import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { Button, Divider, Modal } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { createOrderVisible, orderTypeModalVisible } from '../../../../../core/workflow/store/actions';
import { WorkflowReducer } from '../../../../../core/workflow/store/reducer';
import CreateOrderModal from './containers/CreateOrder';

interface Props {
  orderTypeVisible: Function,
  createOrderVisible: Function,
  workflowReducer: WorkflowReducer
}

const { ORDER } = SchemaModuleEntityTypeEnums;

class OrderContactType extends React.Component<Props> {

  
  resetModalData() {
    const { orderTypeVisible } = this.props;
    orderTypeVisible();
  }

  openCreateOrderModal(type: string) {
    const { createOrderVisible, orderTypeVisible } = this.props;
    if(type === 'new') {
      orderTypeVisible();
      createOrderVisible();
    }
  }

  render() {
    const { workflowReducer } = this.props;
    return (
      <>
      <CreateOrderModal />
      <Modal className="cancel-appointment-modal"
             title="Create Order"
             visible={workflowReducer[ORDER].isSelectOrderTypeVisible}
             footer={null}
             width={750}
             style={{ top: 20 }}
             onCancel={(e) => {
               this.resetModalData()
             }}
             maskClosable={false}
      >
        <h2 title="5">Please select Contact type:</h2>
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button style={{width: '150px', marginRight: '1rem'}} onClick={() => this.openCreateOrderModal('new')} type="primary">
            New
          </Button>
          <Button style={{width: '150px'}} type="primary">
            Existing
          </Button>
        </div>
      </Modal>
    </>
    );
  }
}

const mapState = (state: any) => ({
  workflowReducer: state.workflowReducer
});

const mapDispatch = (dispatch: any) => ({
  orderTypeVisible: () => dispatch(orderTypeModalVisible()),
  createOrderVisible: () => dispatch(createOrderVisible()),
});


export default connect(mapState, mapDispatch)(OrderContactType);

