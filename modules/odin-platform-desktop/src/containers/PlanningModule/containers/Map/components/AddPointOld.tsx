import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Row } from 'antd';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import { DrawEvent } from 'ol/interaction/Draw';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style } from 'ol/style';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
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

    const { mapReducer } = this.props;
    const { addEnabled } = mapReducer;

    // if another component changes addEnabled to false then we want to remove
    // it from the map layer
    if(prevProps.mapReducer.addEnabled !== this.props.mapReducer.addEnabled) {
      if(!this.props.mapReducer.addEnabled) {
        this.disableAdd();
      } else {
        this.enableAdd();
      }
    }


    if(prevProps.mapReducer.zoomLevel !== this.props.mapReducer.zoomLevel) {
      const newZoom = mapReducer.map?.getView().getZoom();
      if(addEnabled) {
        this.enableAdd(!newZoom);
      }
    }

    if(prevProps.mapReducer.coordinates[0] && mapReducer.coordinates[0]) {
      if(prevProps.mapReducer.coordinates[0][0] !== mapReducer.coordinates[0][0] && addEnabled) {
        const newZoom = mapReducer.map?.getView().getZoom();
        if(addEnabled) {
          this.enableAdd(!newZoom);
        }
      }
    }
  }

  /*
   * Select features on the map using the draw feature
   * hold down shift + then click and craw the points to select
   */
  enableAdd(withZoom: boolean = true) {
    const { mapReducer, updateMap } = this.props;
    const { map } = mapReducer;

    if(map) {
      updateMap({
        addEnabled: true,
        drawEnabled: false,
        addLineEnabled: false,
        infoPopupVisible: false,
      })

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

      let mapCenter = map.getView().getCenterInternal();

      if(mapCenter) {

        // @ts-ignore
        let radius = map.getView().getResolution() * 30

        const circleFeature = new Feature({
          geometry: new Circle(mapCenter, radius),
        });

        circleFeature.setStyle(
          new Style({
            renderer: function renderer(coordinates, state) {
              var coordinates_0 = coordinates[0];
              // @ts-ignore
              var x = coordinates_0[0];
              // @ts-ignore
              var y = coordinates_0[1];
              var coordinates_1 = coordinates[1];
              // @ts-ignore
              var x1 = coordinates_1[0];
              // @ts-ignore
              var y1 = coordinates_1[1];
              var ctx = state.context;
              var dx = x1 - x;
              var dy = y1 - y;
              var radius = Math.sqrt(dx * dx + dy * dy);

              ctx.beginPath();

              ctx.lineTo(x, y);
              ctx.strokeStyle = '#1890ff';
              ctx.stroke();

              ctx.lineWidth = 5.5;

              ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
              ctx.strokeStyle = '#1890ff';
              ctx.stroke();
            },
          }),
        );

        const addFeatureSource = new VectorSource({
          features: [ circleFeature ],
        });

        const addFeatureVector = new VectorLayer({
          updateWhileInteracting: true,
          className: 'add_feature_circle',
          source: addFeatureSource,
        });

        if(!addFeatureSource.isEmpty() && withZoom) {
          map.getView().fit(addFeatureSource.getExtent(), {
            maxZoom: 24.5,
            duration: 500,
          });
        }
        map.addLayer(addFeatureVector);
      }
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
                onClick={() => updateMap({ addEnabled: false })}
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
  }
);

export default connect(mapState, mapDispatch)(AddPoint);
