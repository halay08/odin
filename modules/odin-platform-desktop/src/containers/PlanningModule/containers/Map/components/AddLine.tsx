import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Row } from 'antd';
import GeometryType from 'ol/geom/GeometryType';
import { Draw, Snap } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapCoordinatesState, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { FEATURE_NAMES } from '../constants';
import AddLineModal from '../Forms/AddLineModal';

interface Props {
  userReducer: any,
  schemaReducer: SchemaReducerState,
  mapReducer: MapReducer,
  updateMap: (params: MapReducerUpdate) => {},
  updateMapCoord: (params: MapReducerUpdate) => {},
}

interface State {
  drawInteraction: any,
}

class AddLine extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      drawInteraction: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

    // if another component changes addEnabled to false then we want to remove
    // it from the map layer
    if(prevProps.mapReducer.addLineEnabled !== this.props.mapReducer.addLineEnabled) {
      if(this.props.mapReducer.addLineEnabled) {
        this.enableAdd()
      } else {
        this.disableAdd()
      }
    }
  }

  /**
   * Select features on the map using the draw feature
   * hold down shift + then click and craw the points to select
   */
  enableAdd() {

    const { mapReducer, updateMap, updateMapCoord } = this.props;
    const { map } = mapReducer;

    if(map) {

      updateMap({
        addLineEnabled: true,
        addEnabled: false,
        drawEnabled: false,
        infoPopupVisible: false,
        addPointConfirmVisible: false,
      })

      const addFeatureSource = new VectorSource();

      const addFeatureVector = new VectorLayer({
        className: 'add_feature_line',
        source: addFeatureSource,
      });

      const draw = new Draw({
        source: addFeatureSource,
        type: GeometryType.LINE_STRING,
        maxPoints: 2,
      });

      this.setState({
        drawInteraction: draw,
      });

      draw.on('drawend', (evt) => {

        updateMap({
          addEnabled: false,
        })

        // log the coordinates and lon/lat
        const geom = evt.feature.getGeometry();
        // @ts-ignore
        const coords = geom?.getCoordinates();

        proj4.defs(
          'EPSG:27700',
          '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
        );

        const source = proj4.Proj('EPSG:3857');
        const dest = proj4.Proj('EPSG:27700');

        const newCoordinates: number[][] = [];

        for(let i = 0; i < coords.length; i++) {

          const coord = coords[i];

          const point = proj4.toPoint(coord)
          const trans = proj4.transform(source, dest, point);
          newCoordinates.push([ trans.x, trans.y ]);

        }

        updateMapCoord({ coordinates: newCoordinates });

      });

      map.addLayer(addFeatureVector);
      map.addInteraction(draw);

      // The snap interaction must be added after the Modify and Draw interactions
      // in order for its map browser event handlers to be fired first. Its handlers
      // are responsible of doing the snapping.
      const snap = new Snap({
        source: addFeatureVector.getSource(),
      });
      map.addInteraction(snap);

    }
  }

  public disableAdd() {

    const { mapReducer, updateMap } = this.props;
    const { map } = mapReducer;

    if(map) {

      map.getLayers().forEach((layer: any) => {

        if(layer) {
          const isVisible = layer.getVisible();
          if(isVisible) {
            if(layer.className_ === 'add_feature_line') {
              map.removeLayer(layer);
            }
          }
        }
      });

      map?.removeInteraction(this.state.drawInteraction);

      updateMap({
        addLineEnabled: false,
        coordinates: [],
      })
    }
  }

  handleAddFeatureMenuClick(e: { key: string }) {
    const { updateMap } = this.props;


    // @ts-ignore
    const featureName = FEATURE_NAMES[e.key.toUpperCase()];
    updateMap({
      featureName,
      showCreateModal: true,
      addLineEnabled: true,
      mapSidebarVisible: false,
    })

  }

  refreshVisibleLayers() {
    const { mapReducer } = this.props;

    if(mapReducer.map) {
      const getZoom = mapReducer.map.getView().getZoom();
      const newZoomIn = Number(getZoom) + 0.0000001;
      const newZoomOut = Number(getZoom) + 0.0000001;

      mapReducer.map.getView().setZoom(newZoomIn);
      mapReducer.map.getView().setZoom(newZoomOut);
    }
  }


  render() {

    const { mapReducer, updateMap } = this.props;
    const { addLineEnabled } = mapReducer;

    return (

      <Row>
        <AddLineModal/>
        {
          /* Show Apply / Cancel Floating buttons */
          !addLineEnabled ? <></> :
            <div
              className="floatingApplyCancelContainer"
            >
              <Button
                icon={<CheckOutlined/>}
                shape="circle"
                size="large"
                type="primary"
                className="floatingButton floatingApplyButton"
                onClick={() => updateMap({ addLineModal: true })}
              />
              <Button
                icon={<CloseOutlined/>}
                shape="circle"
                size="large"
                type="primary"
                className="floatingButton floatingCancelButton"
                onClick={() => updateMap({ addLineEnabled: false })}
              />
            </div>
        }

      </Row>
    )
  }
}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  mapReducer: state.mapReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
  updateMapCoord: (params: MapReducerUpdate) => dispatch(updateMapCoordinatesState(params)),
});

export default connect(mapState, mapDispatch)(AddLine);
