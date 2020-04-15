import { RadiusSettingOutlined } from '@ant-design/icons';
import { Button, Card, Col, Modal, Row } from 'antd';
import axios from 'axios';
import { always } from 'ol/events/condition';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, MapSearch, setMapSearchQuery, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { LAYER_NAMES } from '../constants';
import { getLayersAndCoordinates } from '../helpers';
import FeatureListModal from '../Views/FeatureListModal';

interface Props {
  mapReducer: MapReducer,
  updateMap: (params: MapReducerUpdate) => {},
  searchMap: (params: MapSearch) => {}
}

interface State {
  drawInteraction: any,
}

class FeatureSelect extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      drawInteraction: undefined,
    }

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    // if another component changes addEnabled to false then we want to remove
    // it from the map layer
    if(prevProps.mapReducer.drawEnabled !== this.props.mapReducer.drawEnabled) {
      if(this.props.mapReducer.drawEnabled === false) {
        this.disableDraw();
      }
    }
  }

  /**
   * Select features on the map using the draw feature
   * hold down shift + then click and craw the points to select
   */
  enableDraw() {

    const { mapReducer, updateMap } = this.props;
    const { map } = mapReducer;

    const drawingSource = new VectorSource();

    // we want to disable add feature if the user wants to draw
    // conflicts with rendering the component
    updateMap({ addEnabled: false });

    // Drawing interaction
    const draw = new Draw({
      source: drawingSource,
      type: GeometryType.POLYGON,
      freehand: true,
      condition: always,
    });

    updateMap({
      drawEnabled: true,
    })

    this.setState({
      drawInteraction: draw,
    });

    map?.addInteraction(draw);

    draw.on('drawstart', function (e: DrawEvent) {
      drawingSource.clear();
    });

    draw.on('drawend', async (e: DrawEvent) => {

      const polygon: Geometry | undefined = e.feature.getGeometry();

      console.log('polygon', polygon);

      updateMap({
        drawEnabled: true,
      })

      const { coordinates } = getLayersAndCoordinates(polygon, mapReducer.map);


      await this.getFeaturesData(coordinates);
    });
  }


  disableDraw() {

    const { mapReducer, updateMap } = this.props;
    const { map } = mapReducer;

    if(map) {

      map?.removeInteraction(this.state.drawInteraction);

      updateMap({
        map,
        drawEnabled: false,
      })
    }
  }

  async getFeaturesData(coordinates: any) {

    const { updateMap, mapReducer, searchMap } = this.props;
    const { queryLayer } = mapReducer;


    const REACT_APP_QGIS_SERVER_URL = 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

    if(queryLayer) {

      const url = `${REACT_APP_QGIS_SERVER_URL}&SERVICE=WMS&REQUEST=GetFeatureInfo&LAYERS=${queryLayer}&QUERYVISIBLE=true&QUERY_LAYERS=${queryLayer}&CRS=EPSG:3857&FILTER_GEOM=${coordinates}&FEATURE_COUNT=50&INFO_FORMAT=application/json`;
      const response = await axios.get(url);

      if(response.data.features && response.data.features.length) {

        const parsed = response.data.features;

        updateMap({
          features: parsed,
          mapSidebarSection: 'features',
          mapSidebarVisible: true,
        })

        searchMap({
          featureIds: parsed.map((feature: any) => feature.properties.id).join(),
        })

      }
    }
  }

  handleChooseFeature(key: string) {
    const { updateMap } = this.props;

    updateMap({
      drawEnabled: true,
      queryLayer: key,
      features: [],
      featureSelectModal: false,
      mapSidebarVisible: false,
    })

    this.enableDraw();
  }

  handleFloatingButtonClick() {
    const { updateMap, mapReducer } = this.props;
    if(mapReducer.drawEnabled) {
      this.disableDraw()
      updateMap({ featureSelectModal: false })
    } else {
      updateMap({ featureSelectModal: true, infoPopupVisible: false })
    }

  }

  render() {
    const { mapReducer, updateMap } = this.props;
    const { drawEnabled, queryLayer } = mapReducer;

    let SelectFeatureLayers = [
      LAYER_NAMES.BLOCKAGE,
      LAYER_NAMES.CABLE,
      LAYER_NAMES.CHAMBER,
      LAYER_NAMES.CLOSURE,
      LAYER_NAMES.DUCT,
      LAYER_NAMES.HAZARD,
      LAYER_NAMES.POLE,
      LAYER_NAMES.ROPE,
      LAYER_NAMES.SURVEY_STRUCTURE,
      LAYER_NAMES.SURVEY_ROUTE,
      LAYER_NAMES.PIA_DUCT,
      LAYER_NAMES.PIA_STRUCTURE,
    ]


    return (
      <div>
        {/* Feature Select Floating button */}
        <Button
          type="primary"
          shape="circle"
          size="large"
          disabled={mapReducer.addEnabled || mapReducer.addLineEnabled}
          className={`floatingButton floatingSelectFeatureButton ${drawEnabled ? 'activeFloatingButton' : ''}`}
          icon={<RadiusSettingOutlined/>}
          onClick={() => this.handleFloatingButtonClick()}
        />

        {/* Feature Select Type Modal */}
        <Modal
          centered
          className="FeatureSelectModal"
          title="Choose Feature Type"
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          visible={mapReducer.featureSelectModal}
          onCancel={() => {
            updateMap({ featureSelectModal: false })
          }}
        >
          <Row>
            {
              SelectFeatureLayers.map((layerName) =>
                <Col span={12} key={layerName}>
                  <Card
                    key={layerName}
                    style={{
                      margin: '5px',
                    }}
                    onClick={(e: any) => this.handleChooseFeature(layerName)}
                  >
                    <Row>
                      <Col span={24}>
                        {layerName}
                      </Col>
                    </Row>

                  </Card>
                </Col>,
              )
            }
          </Row>
        </Modal>
        <FeatureListModal/>
      </div>
    )
  }

}

const mapState = (state: any) => ({
  mapReducer: state.mapReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
  searchMap: (params: MapSearch) => dispatch(setMapSearchQuery(params)),
});

export default connect(mapState, mapDispatch)(FeatureSelect);
