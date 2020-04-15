import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Row } from 'antd';
import { DrawEvent } from 'ol/interaction/Draw';
import proj4 from 'proj4';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapCoordinatesState, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { FEATURE_NAMES } from '../constants';
import AddPointModal from '../Forms/AddPointModal';
import '../styles.scss'

interface Props {
  mapReducer: MapReducer,
  userReducer: any,
  schemaReducer: SchemaReducerState,
  updateMap: (params: MapReducerUpdate) => {},
  updateMapCoord: any
}

interface State {
  addFeatureVector: any,
}

class AddPoint extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      addFeatureVector: undefined,
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

    // if another component changes addEnabled to false then we want to remove
    // it from the map layer
    if(prevProps.mapReducer.addEnabled !== this.props.mapReducer.addEnabled) {
      if(this.props.mapReducer.addEnabled) {
        this.enableAdd();
      } else {
        this.disableAdd();
      }
    }


    // if(prevProps.mapReducer.zoomLevel !== this.props.mapReducer.zoomLevel) {
    //   const newZoom = mapReducer.map?.getView().getZoom();
    //   if(addEnabled) {
    //     this.enableAdd(!newZoom);
    //   }
    // }

    // if(prevProps.mapReducer.coordinates[0] && mapReducer.coordinates[0]) {
    //   if(prevProps.mapReducer.coordinates[0][0] !== mapReducer.coordinates[0][0] && addEnabled) {
    //     const newZoom = mapReducer.map?.getView().getZoom();
    //     if(addEnabled) {
    //       this.enableAdd(!newZoom);
    //     }
    //   }
    // }
  }

  /*
   * Select features on the map using the draw feature
   * hold down shift + then click and craw the points to select
   */
  enableAdd(withZoom: boolean = true) {
    const { mapReducer, updateMap, updateMapCoord } = this.props;
    const { map } = mapReducer;

    if(map) {

      updateMap({
        addLineEnabled: false,
        addEnabled: true,
        drawEnabled: false,
        infoPopupVisible: false,
        addPointConfirmVisible: false,
      })

      map.on('singleclick', (evt) => {

        console.log('add event enabled', evt);
        console.log('evt?.coordinate', evt?.coordinate);
        console.log('mapReducer.addEnabled', mapReducer.addEnabled);
        console.log('mapReducer.addLineEnabled', mapReducer.addLineEnabled);
        console.log('IS_TRUE', mapReducer.addEnabled && !mapReducer.addLineEnabled);

        if(mapReducer.addEnabled && !mapReducer.addLineEnabled) {
          // log the coordinates and lon/lat
          // @ts-ignore
          this.setCoordinatesAndShowConfirm(evt)

        }

      });
    }
  }

  setCoordinatesAndShowConfirm(evt: any) {

    const { mapReducer, updateMap, updateMapCoord } = this.props;
    const { map } = mapReducer;

    const coords = evt?.coordinate;
    if(map && mapReducer.addEnabled && !mapReducer.addLineEnabled) {
      console.log('coords', coords);
      proj4.defs(
        'EPSG:27700',
        '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
      );

      const source = proj4.Proj('EPSG:3857');
      const dest = proj4.Proj('EPSG:27700');

      const point = proj4.toPoint([ coords[0], coords[1] ])
      const trans = proj4.transform(source, dest, point);
      const newCoordinates = [ [ trans.x, trans.y ] ];

      updateMap({ coordinates: newCoordinates });

      const overlay = map.getOverlayById(2);
      overlay.setPosition(coords);

      updateMap({ addPointConfirmVisible: mapReducer.addEnabled })

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
            if(layer.className_ === 'add_feature_circle') {
              map.removeLayer(layer);
            }
          }
        }
      });

      updateMap({
        addPointModal: false,
        addEnabled: false,
      })
    }
  }


  handleAddFeatureMenuClick(e: { key: string }) {

    const { updateMap } = this.props;

    // @ts-ignore
    const featureName = FEATURE_NAMES[e.key.toUpperCase()];
    updateMap({
      showCreateModal: true,
      addEnabled: true,
      infoPopupVisible: false,
      featureName,
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
    const { addEnabled } = mapReducer;

    return (
      <Row>
        <AddPointModal/>
        {
          /* Show Apply / Cancel Floating buttons */
          !addEnabled ? <></> :
            <div
              className="floatingApplyCancelContainer"
            >
              <Button
                icon={<CheckOutlined/>}
                shape="circle"
                size="large"
                type="primary"
                className="floatingButton floatingApplyButton"
                onClick={() => updateMap({ addPointModal: true })}
              />
              <Button
                icon={<CloseOutlined/>}
                shape="circle"
                size="large"
                type="primary"
                className="floatingButton floatingCancelButton"
                onClick={() => updateMap({ addEnabled: false, addPointConfirmVisible: false })}
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
  }

);

const mapDispatch = (dispatch: any) => (
  {
    alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
    updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
    updateMapCoord: (params: MapReducerUpdate) => dispatch(updateMapCoordinatesState(params)),
  }
);

export default connect(mapState, mapDispatch)(AddPoint);
