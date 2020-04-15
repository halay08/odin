import { BlockOutlined } from '@ant-design/icons';
import { Card, Col, Row } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';

interface Props {
  mapReducer: MapReducer,
  layerSwitcherRef: any,
  updateMap: (params: MapReducerUpdate) => {},
}

interface State {
}

class SidebarLayers extends React.Component<Props, State> {


  render() {

    const { mapReducer, layerSwitcherRef } = this.props;

    return (
      <Row style={{ display: mapReducer.mapSidebarSection === 'layers' ? 'block' : 'none' }}>
        {/* Layers */}
        <Col span={24} style={{ marginBottom: '15px' }}>
          <Card size="small"
                title={<span><BlockOutlined style={{ marginRight: '5px' }}/>Layers</span>}
          >
            <div ref={layerSwitcherRef} id="layer-switcher" className="layer-switcher"/>
          </Card>
        </Col>
      </Row>
    )

  }
}

const mapState = (state: any) => ({
  mapReducer: state.mapReducer,
});

const mapDispatch = (dispatch: any) => ({
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
});

export default connect(mapState, mapDispatch)(SidebarLayers);
