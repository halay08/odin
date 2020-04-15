import { AimOutlined, CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Alert, Button, Col, Layout, Radio, Row, Typography } from 'antd';
import axios from 'axios';
import { Geolocation } from 'ol';
import LayerSwitcher from 'ol-layerswitcher'
import { toStringHDMS } from 'ol/coordinate';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import Point from 'ol/geom/Point';
import { defaults as DefaultInteractions } from 'ol/interaction';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { toLonLat } from 'ol/proj';
import ImageWMS from 'ol/source/ImageWMS';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import View from 'ol/View';
import ol from 'openlayers';
import proj4 from 'proj4';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { MapReducerUpdate, MapSearch, setMapSearchQuery, updateMapState } from '../../../../core/gis/store/actions';
import { MapReducer } from '../../../../core/gis/store/reducer';
import { updateUserRolesAndPermissionsRequest } from '../../../../core/identity/store/actions';
import {
  getRecordByIdRequest,
  IGetRecordById,
  ISearchRecords,
  searchRecordsRequest,
} from '../../../../core/records/store/actions';
import { getSchemaByModuleAndEntityRequest, ISchemaByModuleAndEntity } from '../../../../core/schemas/store/actions';
import { displayMessage } from '../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../shared/utilities/schemaHelpers';
import FeatureAdd from './components/FeatureAdd';
import FeatureSelect from './components/FeatureSelect';
import { transformFeatureNameFromUrl } from './helpers';
import { mapLayers } from './MapLayers';
import './styles.scss';
import SidebarFeatures from './Views/SidebarFeatures';
import SidebarLayers from './Views/SidebarLayers';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;

interface Props {
  mapReducer: MapReducer,
  recordReducer: any,
  schemaReducer: any,
  navigationReducer: any,
  alertMessage: any,
  getSchema: any,
  updateMap: (params: MapReducerUpdate) => {},
  match: any,
  updateUserRolesAndPermissions: any,
  searchRecords: any,
  searchMap: (params: MapSearch) => {}
}

interface State {
  // map: Map | undefined,
  geolocation: Geolocation | undefined,
  lonLat: any,
  dragging: boolean
}


class PlanningModuleMap extends React.Component<Props, State> {
  private layerSwitcherRef = React.createRef<HTMLDivElement>()
  private popupContentRef = React.createRef<HTMLDivElement>()
  private popupContainerRef = React.createRef<HTMLDivElement>()
  private addPointPopupContainerRef = React.createRef<HTMLDivElement>()

  constructor(props: Props) {
    super(props);
    this.state = {
      // map: undefined,
      geolocation: undefined,
      lonLat: '',
      dragging: false,
    }
  }

  componentDidMount() {
    const { updateMap, mapReducer, schemaReducer, match, searchRecords, searchMap } = this.props;
    this.initializeMap();

    /* URL parameters for Feature ID & Feature ID are passed to Map */
    if(match.params.featureId && match.params.featureType) {

      const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE)

      updateMap({
        mapSidebarVisible: true,
        mapSidebarSection: 'features',
        query: `type=${transformFeatureNameFromUrl(match.params.featureType)}&featureId=${match.params.featureId}`,
        queryLayer: transformFeatureNameFromUrl(match.params.featureType),
      })

      searchMap({
        featureIds: match.params.featureId,
      })

      this.getFeatureByIdAndZoom();
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

    if(prevProps.mapReducer.map !== this.props.mapReducer.map) {
      this.props.mapReducer.map?.updateSize();
    }

    if(prevProps.mapReducer.geoEnabled !== this.props.mapReducer.geoEnabled) {
      this.configureGeolocator();
      this.props.mapReducer.map?.updateSize();
    }

    if(prevProps.mapReducer.query !== this.props.mapReducer.query) {
      this.getFeatureByIdAndZoom()
    }

    /*if (prevProps.mapReducer.queries !== this.props.mapReducer.queries) {
     const {schemaReducer, searchRecords, mapReducer} = this.props;
     const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE)

     if (schema) {
     searchRecords({
     schema: schema,
     searchQuery: {
     terms: null,
     fields: null,
     schemas: schema.id,
     sort: [{schemaPosition: {order: 'desc'}}],
     boolean: mapReducer.queries,
     },
     })
     }
     }*/

  }

  componentWillUnmount() {

    const { mapReducer } = this.props;
    const { map } = mapReducer;

    map?.disposeInternal();
  }

  fetchUserPermissions() {
    const { updateUserRolesAndPermissions } = this.props;
    updateUserRolesAndPermissions();
  }

  initializeMap() {

    const { getSchema, updateMap } = this.props;

    getSchema({ moduleName: 'ProjectModule', entityName: 'Feature' });
    ol.proj.setProj4(proj4);

    // Define British National Grid Proj4js projection (copied from http://epsg.io/27700.js)
    proj4.defs(
      'EPSG:27700',
      '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs',
    );

    const layerSwitcher = new LayerSwitcher({
      activationMode: 'mouseover',
      startActive: false,
      reverse: false,
      tipLabel: 'Legend',
      collapseTipLabel: 'Collapse legend',
      groupSelectStyle: 'children',
    });

    const overlay = new Overlay({
      id: 1,
      element: this.popupContainerRef.current!,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    const addPointOverlay = new Overlay({
      id: 2,
      element: this.addPointPopupContainerRef.current!,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    const map = new Map({
      layers: mapLayers,
      target: 'map',
      view: new View({
        center: [ -148073, 7314508 ],
        zoom: 10,
        enableRotation: false,
        constrainOnlyCenter: false,
      }),
      overlays: [ overlay, addPointOverlay ],
      controls: [
        layerSwitcher,
      ],
      interactions: DefaultInteractions({
        pinchRotate: false,
      }),
    });


    layerSwitcher.hidePanel()
    LayerSwitcher.renderPanel(map, this.layerSwitcherRef?.current as HTMLDivElement, {})

    /* Show info popup when clicking on Map */
    map.on('singleclick', (e: any) => {

      const { mapReducer } = this.props;
      let coordinate = e.coordinate;
      let hdms = toStringHDMS(toLonLat(coordinate));


      if(!mapReducer.addLineEnabled && !mapReducer.drawEnabled && !mapReducer.addEnabled) {
        updateMap({ infoPopupVisible: true })

        this.setState({
          lonLat: toLonLat(e.coordinate),
        })
        overlay.setPosition(coordinate);
      }

    })

    map.on('pointerdrag', (e: any) => {
      this.setState({ dragging: true })
    })

    /* Save zoom level */
    map.on('moveend', (e: any) => {
      this.setState({ dragging: false })
      const { mapReducer, updateMap } = this.props;
      let zoomLevel = mapReducer.map?.getView().getZoom();

      setTimeout(() => {
        updateMap({
          zoomLevel: zoomLevel,
        })

      }, 5);
    })

    updateMap({
      map,
    })

    setTimeout(() => {
      map?.updateSize();
    }, 500);

  }


  async getFeatureByIdAndZoom() {

    const { mapReducer, alertMessage, updateMap } = this.props;
    const { map } = mapReducer;
    const { query } = mapReducer;

    const REACT_APP_QGIS_SERVER_URL = 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

    updateMap({
      features: [],
    })

    map?.getLayers().forEach((layer: any) => {

      if(layer) {

        const isVisible = layer.getVisible();

        if(isVisible) {
          if(layer.className_ === 'feature_by_id_layer') {
            map.removeLayer(layer);
          }

          if(layer.className_ === 'feature_by_id_vector_circle') {
            map.removeLayer(layer);
          }

        }
      }

    });

    if(query) {

      const split = query.split('&');
      const splitType = split[0].split('type=');
      const splitFeatId = split[1].split('featureId=');

      // const WFSURL = REACT_APP_QGIS_SERVER_URL + '&SERVICE=WFS&VERSION=1.0.0&REQUEST=DescribeFeatureType';
      const WFSURL = REACT_APP_QGIS_SERVER_URL + `&SERVICE=WFS&REQUEST=GetFeature&VERSION=1.1.0&TYPENAME=${
        splitType[1]}&MAXFEATURES=1&OUTPUTFORMAT=GeoJSON&FEATUREID=${splitType[1]}.${splitFeatId[1]}`;

      const data = await axios.get(WFSURL);
      let maxZoom = 19.5;
      let featureType;

      let coords;

      if(data.data.features && data.data.features[0]) {

        const geom = data.data.features[0] ? data.data.features[0].geometry : undefined;
        coords = geom ? geom.coordinates : [];

        console.log('geom', geom);

        // closures
        if(geom.type === 'Point') {

          maxZoom = 21;
          featureType = geom.type;

        }

        // cables
        if(geom.type === 'LineString') {

          coords = coords[0];
          maxZoom = 21;
          featureType = geom.type;

        }

        // polygons
        if(geom.type === 'Polygon') {

          coords = coords[0][0];
          maxZoom = 19.5;
          featureType = geom.type;

        }
      } else {
        return alertMessage({ body: 'no data found, verify that the feature and id exist', type: 'info' });
      }

      const layer = new ImageLayer({
        className: 'feature_by_id_layer',
        zIndex: 50000,
        source: new ImageWMS({
          url: REACT_APP_QGIS_SERVER_URL,
          params: {
            'LAYERS': [ splitType[1] ],
            'FILTER': `${splitType[1]}:"id" = ${splitFeatId[1]}`,
          },
          ratio: 1,
          serverType: 'qgis',
        }),
        opacity: featureType === 'Polygon' ? 0.5 : 1,
        visible: true,
      });

      map?.addLayer(layer);

      if(coords) {

        console.log('coords', coords);
        const source = proj4.Proj('EPSG:4326');
        const dest = proj4.Proj('EPSG:3857');

        const point = proj4.toPoint(coords)
        const trans = proj4.transform(source, dest, point)

        const circleFeature = new Feature({
          geometry: new Circle([ trans.x, trans.y ], 10),
        });

        const addFeatureSource = new VectorSource({
          features: [ circleFeature ],
        });

        const addFeatureVector = new VectorLayer({
          updateWhileInteracting: true,
          className: 'feature_by_id_vector_circle',
          source: addFeatureSource,
        });

        if(!addFeatureSource.isEmpty()) {

          map?.getView().fit(addFeatureSource.getExtent(), {
            maxZoom: maxZoom,
            duration: 500,
          });

        }

        map?.addLayer(addFeatureVector);
      }
    }
  }


  disableGeoLocation() {

    const { updateMap, mapReducer } = this.props;
    const { map } = mapReducer;

    if(map) {

      map.getLayers().forEach((layer: any) => {
        if(layer) {
          const isVisible = layer.getVisible();
          if(isVisible) {
            if(layer.className_ === 'add_geolocation_circle') {
              console.log('layer removed');
              map.removeLayer(layer);
            }
          }
        }
      });

      updateMap({
        isLocating: false,
        geoEnabled: false,
        geolocation: undefined,
      })

      this.state.geolocation?.setTracking(false);
      this.setState({
        geolocation: undefined,
      })

    }

  }

  /**
   * handles geolocation
   * @param geoSource
   * @param map
   */
  enableGeoLocation() {
    const { updateMap, mapReducer } = this.props;
    updateMap({
      isLocating: true,
      geoEnabled: true,
    })
  }


  /**
   *
   */
  configureGeolocator() {

    const { updateMap, mapReducer } = this.props;
    const { geoEnabled, map } = mapReducer;

    function el(id: string) {
      return document.getElementById(id);
    }

    if(geoEnabled) {

      var view = new View({
        center: [ 0, 0 ],
        zoom: 2,
      });

      var geolocation = new Geolocation({
        // enableHighAccuracy must be set to true to have the heading value.
        trackingOptions: {
          enableHighAccuracy: true,
        },
        projection: view.getProjection(),
      });

      this.setState({
        geolocation,
      })

      geolocation.setTracking(geoEnabled);

      el('track')?.addEventListener('change', () => {
        geolocation.setTracking(geoEnabled);
      });

      geolocation.on('error', (e) => {
        console.error(e);
      })

      // update the HTML page when the position changes.
      geolocation.on('change', () => {
        const accuracy = el('accuracy');
        const altitude = el('altitude');
        const altitudeAccuracy = el('altitudeAccuracy');
        const heading = el('heading');
        const speed = el('speed');

        if(accuracy) {
          accuracy.innerText = geolocation.getAccuracy() + ' [m]';
        }
        if(altitude) {
          altitude.innerText = geolocation.getAltitude() + ' [m]';
        }
        // altitudeAccuracy.innerText = geolocation.getAltitudeAccuracy() + ' [m]';
        if(heading) {
          heading.innerText = geolocation.getHeading() + ' [rad]';
        }
        // el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
      });

      geolocation.on('error', (error) => {
        const info = document.getElementById('info');
        if(info) {
          info.innerHTML = error.message;
          info.style.display = '';
        }
      });

      var positionFeature = new Feature();
      positionFeature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({
              color: '#3399CC',
            }),
            stroke: new Stroke({
              color: '#fff',
              width: 2,
            }),
          }),
        }),
      );

      geolocation.on('change:position', function () {
        var coordinates = geolocation.getPosition();

        if(coordinates) {
          map?.getView().fit(new Point(coordinates).getExtent(), {
            maxZoom: 19.5,
            duration: 500,
          });
          updateMap({
            isLocating: false,
          })
        }

        positionFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
      });

      const geoLayer = new VectorLayer({
        className: 'add_geolocation_circle',
        source: new VectorSource({
          features: [ positionFeature ],
        }),
      });

      map?.addLayer(geoLayer);

      updateMap({
        geolocation,
      })
    }
  }

  refreshVisibleLayers() {

    const { mapReducer } = this.props;

    if(mapReducer.map) {
      const getZoom = mapReducer.map.getView().getZoom();
      const newZoomIn = Number(getZoom) + 0.0000001;
      const newZoomOut = Number(getZoom) + 0.0000001;

      mapReducer.map?.getView().setZoom(newZoomIn);
      mapReducer.map?.getView().setZoom(newZoomOut);
    }
  }

  renderMapCursor() {
    const { mapReducer } = this.props;

    if(this.state.dragging) {
      return 'move'
    } else if(mapReducer.addEnabled) {
      return 'crosshair'
    } else {
      return 'default'
    }
  }

  render() {

    const { mapReducer, navigationReducer, updateMap } = this.props;
    const { geoEnabled, isLocating, geolocation } = mapReducer;
    const { Content } = Layout;
    const tabsInViewport = navigationReducer.tabHistory ? navigationReducer.tabHistory.length : 0
    const radioOptions = [
      { label: 'Layers', value: 'layers' },
      { label: 'Features', value: 'features' },
    ]

    return (
      <Layout style={{ overflow: 'hidden' }}>


        {/* Map Collapse/Show Floating Button*/}
        <Button
          shape="circle"
          size="large"
          icon={<MenuOutlined/>}
          style={{ display: mapReducer.mapSidebarVisible ? 'none' : 'block' }}
          className={'floatingSidebarButton ' + (tabsInViewport ? 'floatingSidebarButtonTabs' : 'floatingSidebarButtonNoTabs')}
          onClick={() => updateMap({ mapSidebarVisible: !mapReducer.mapSidebarVisible })}
        />
        <Button
          type="primary"
          shape="circle"
          size="large"
          className={`floatingLocateMeButton ${geoEnabled ? 'activeFloatingButton' : ''}`}
          icon={<AimOutlined/>}
          loading={isLocating}
          onClick={() => geoEnabled ? this.disableGeoLocation() : this.enableGeoLocation()}>
        </Button>

        <FeatureAdd/>
        <FeatureSelect/>

        <div className="ol-popup" ref={this.addPointPopupContainerRef}
             style={{ display: mapReducer.addPointConfirmVisible && mapReducer.addEnabled ? 'block' : 'none' }}>
          <div onClick={() => updateMap({ addPointConfirmVisible: false })}>
            <a href="#" className="ol-popup-closer"/>
          </div>
          <Row className="popup-content" style={{ textAlign: 'center' }}>
            <Col span={24} style={{ marginTop: '10px' }}>
              <Typography.Text>The point will be located here.</Typography.Text>
            </Col>
            <Col span={24} style={{ marginTop: '10px' }}>
              <Button style={{ width: '100%' }} type="primary" onClick={() => updateMap({ addPointModal: true })}>
                Add Point
              </Button>
            </Col>
          </Row>
        </div>

        <div className="ol-popup" ref={this.popupContainerRef}
             style={{ display: mapReducer.infoPopupVisible ? 'block' : 'none' }}>
          <div onClick={() => updateMap({ infoPopupVisible: false })}>
            <a href="#" className="ol-popup-closer"/>
          </div>
          <Row className="popup-content" style={{ textAlign: 'center' }}>
            <Col span={24}>
              <strong>Coordinates</strong>
            </Col>
            <Col span={24} style={{ marginTop: '10px' }}>
              {toStringHDMS(this.state.lonLat)}
            </Col>
            <Col span={24} style={{ marginTop: '10px' }}>
              <a href={`http://maps.google.com/maps?q=&layer=c&cbll=${this.state.lonLat[1]},${this.state.lonLat[0]}`}
                 target="_blank">
                <Button style={{ width: '100%' }} type="primary">
                  Open in Street View
                </Button>
              </a>
            </Col>
          </Row>
        </div>

        <Content>
          <Row>
            {/* Map alerts */}
            {mapReducer.addEnabled &&
            <Alert style={{ zIndex: 100, width: '100%' }} message="Adding a new point"
                   description="click with your mouse to add a new point" type="info"
                   showIcon/>}
            {mapReducer.addLineEnabled && <Alert style={{ zIndex: 100, width: '100%' }} message="Adding a new line"
                                                 description="click to add point drag and click to end line, repeat for lines with multiple vertices"
                                                 type="info" showIcon/>}
          </Row>
          <Row>
            <Col
              className="mapSidebar"
              flex={mapReducer.mapSidebarVisible ? (isMobile ? '3' : '0.3') : '0'}
              style={{
                padding: mapReducer.mapSidebarVisible ? (isMobile ? '15px' : '15px 20px') : '0',
              }}>
              <Row>

                {/* Close Sidebar Button */}
                <Col span={24} style={{ textAlign: 'right' }}>
                  <Button
                    size="large"
                    icon={<CloseOutlined/>}
                    style={{
                      border: 0,
                      color: '#000',
                      padding: 0,
                      marginBottom: '15px',
                      paddingRight: 0,
                      boxShadow: 'none',
                      height: 'auto',
                      textAlign: 'right',
                    }}
                    onClick={() => {
                      updateMap({ mapSidebarVisible: !mapReducer.mapSidebarVisible })
                    }}
                    ghost/>


                </Col>

              </Row>

              <Row>
                {/* Sidebar Radio buttons - Layers / Features */}
                <Col span={24}>
                  <Radio.Group
                    className="sideMenuSelector"
                    style={{ width: '100%', marginBottom: '25px' }}
                    options={radioOptions}
                    value={mapReducer.mapSidebarSection}
                    optionType="button"
                    buttonStyle="solid"
                    onChange={(e) => updateMap({ mapSidebarSection: e.target.value })}
                  />

                </Col>
              </Row>

              {/* Sidebar Content - Layers / Features */}
              <SidebarLayers layerSwitcherRef={this.layerSwitcherRef}/>
              <SidebarFeatures/>


            </Col>
            <Col flex="auto" style={{ background: 'transparent' }}/>
          </Row>
        </Content>
        <div id="map" style={{ touchAction: 'none', position: 'fixed', cursor: this.renderMapCursor() }}/>
      </Layout>
    )
  }

}

const mapState = (state: any) => ({

  mapReducer: state.mapReducer,
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  navigationReducer: state.navigationReducer,

});

const mapDispatch = (dispatch: any) => ({

  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  getRecordById: (payload: IGetRecordById, cb: any) => dispatch(getRecordByIdRequest(payload, cb)),
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  getSchema: (params: ISchemaByModuleAndEntity, cb: any) => dispatch(getSchemaByModuleAndEntityRequest(params, cb)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
  updateUserRolesAndPermissions: () => dispatch(updateUserRolesAndPermissionsRequest()),
  searchMap: (params: MapSearch) => dispatch(setMapSearchQuery(params)),

});

// @ts-ignore
export default withRouter(connect(mapState, mapDispatch)(PlanningModuleMap));

