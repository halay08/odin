import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { canUserCreateRecord } from '../../../../../shared/permissions/rbacRules';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import AddLine from './AddLine';
import AddPoint from './AddPoint';

interface Props {
  mapReducer: MapReducer,
  userReducer: any,
  schemaReducer: SchemaReducerState,
  updateMap: (params: MapReducerUpdate) => {},
}

interface State {
}

class FeatureAdd extends React.Component<Props, State> {


  handleSelection(type: 'line' | 'point') {
    const { updateMap } = this.props;

    if(type === 'point') {

      updateMap({
        addFeatureModal: false,
        addPointModal: false,
        addEnabled: true,
      })

    } else {

      updateMap({
        addFeatureModal: false,
        addLineModal: false,
        addEnabled: false,
        addLineEnabled: true,
      })

    }

  }


  render() {

    const { updateMap, mapReducer, userReducer, schemaReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, 'ProjectModule', 'Feature');
    const { addEnabled } = mapReducer;

    return (
      <div>

        <AddPoint/>
        <AddLine/>

        {/* Add Feature Floating Button */}
        {addEnabled ? <></> :
          <Button
            icon={<PlusOutlined/>}
            shape="circle"
            size="large"
            type="primary"
            className="floatingButton floatingAddButton"
            disabled={!canUserCreateRecord(userReducer, schema) || mapReducer.drawEnabled}
            onClick={() => updateMap({ addFeatureModal: true, infoPopupVisible: false, addPointConfirmVisible: false })}
          />
        }

        <Modal
          centered
          className="FeatureCreateModal"
          title="Add Feature"
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          visible={mapReducer.addFeatureModal}
          onCancel={() => {
            updateMap({ addFeatureModal: false, addPointConfirmVisible: false })
          }}
        >
          <Row>

            <Col span={24} key="point">
              <Card
                key="point"
                style={{ margin: '8px', padding: '10px' }}
                onClick={() => this.handleSelection('point')}
              >
                <Row>
                  <Col span={24}>
                    <h3>Point</h3>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24} key="line">
              <Card
                key="line"
                style={{ margin: '8px', padding: '10px' }}
                onClick={() => this.handleSelection('line')}
              >
                <Row>
                  <Col span={24}>
                    <h3>Line</h3>
                  </Col>
                </Row>
              </Card>
            </Col>

          </Row>
        </Modal>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  mapReducer: state.mapReducer,
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
});

const mapDispatch = (dispatch: any) => ({
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
});

export default connect(mapState, mapDispatch)(FeatureAdd);
