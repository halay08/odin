import { AimOutlined, EyeOutlined, RadiusSettingOutlined } from '@ant-design/icons';
import { getProperty } from '@d19n/models/dist/schema-manager/helpers/dbRecordHelpers';
import { SchemaColumnOptionEntity } from '@d19n/models/dist/schema-manager/schema/column/option/schema.column.option.entity';
import { SchemaColumnTypes } from '@d19n/models/dist/schema-manager/schema/column/types/schema.column.types';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { Button, Card, Col, Divider, Image, Row, Spin, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { constantCase } from 'change-case';
import moment from 'moment';
import Feature from 'ol/Feature';
import { Circle } from 'ol/geom';
import ImageLayer from 'ol/layer/Image';
import VectorLayer from 'ol/layer/Vector';
import ImageWMS from 'ol/source/ImageWMS';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import pdfIcon from '../../../../../assets/images/pdf.png'
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import RecordProperties from '../../../../../core/records/components/DetailView/RecordProperties';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpGet } from '../../../../../shared/http/requests';
import { canUserGetRecord } from '../../../../../shared/permissions/rbacRules';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import FeatureSearchCard from '../components/FeatureSearchCard';
import '../styles.scss'

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;

interface Props {
  mapReducer: MapReducer,
  schemaReducer: SchemaReducerState,
  recordReducer: IRecordReducer,
  updateMap: (params: MapReducerUpdate) => {},
  alertMessage: any,
  userReducer: any,
}

interface State {
  collapsed: boolean
}

type featureSource = 'ODIN' | 'GIS'

class SidebarFeatures extends React.Component<Props, State> {

  constructor(props: any) {
    super(props)
    this.state = { collapsed: true }
  }

  async handleViewRecord(feat: any, featureSource: featureSource) {
    const { alertMessage, updateMap, mapReducer } = this.props;

    updateMap({
      isLoadingView: true,
    })

    const query = featureSource === 'ODIN'
      ? `ProjectModule/v1.0/db/Feature/${feat.id}`
      : `ProjectModule/v1.0/cst/Feature/${mapReducer.queryLayer}/${feat.id.split('.')[1]}`

    await httpGet(
      query,
    ).then(res => {

      updateMap({
        recordId: res.data.data.id,
        isLoadingView: false,
      })

    }).catch(err => {
      updateMap({
        isLoadingView: false,
      })

      const error = err.response ? err.response.data : undefined;
      alertMessage({ body: error && error.message || 'error loading feature', type: 'error' });

    });
  }

  renderAssociatedMedia(feature: any) {

    if(feature && feature.File && feature.File.dbRecords) {

      return (
        <div>
          <Row>
            <Col span={24} style={{ marginBottom: '5px' }}>
            <span>
              <strong>Media:</strong>
            </span>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Image.PreviewGroup>
                {
                  feature.File.dbRecords.map((file: any, index: any) => (
                    getProperty(file, 'Mimetype') === 'image/jpeg'
                      ?
                      <div style={{ paddingRight: '4px', display: 'inline' }}>
                        <Image
                          style={{ borderRadius: '3px' }}
                          width={40}
                          height={40}
                          src={getProperty(file, 'Url')}/>
                      </div>
                      :
                      <a href={getProperty(file, 'Url')} target="_blank">
                        <div style={{ paddingRight: '4px', display: 'inline' }}>
                          <Image
                            style={{ borderRadius: '3px', border: '2px solid red' }}
                            preview={false}
                            width={40}
                            height={40}
                            src={pdfIcon}/>
                        </div>
                      </a>
                  ))
                }
              </Image.PreviewGroup>
            </Col>
          </Row>
        </div>
      )
    } else {
      return <></>
    }

  }

  renderLastModifiedFields(feature: any, featureSource: featureSource) {

    const renderFields = (updatedBy: string, updatedAt: string) => {
      return (
        <Row style={{ marginBottom: '5px' }}>
          <Col span={24} style={{ marginBottom: '5px' }}>
              <span>
                <strong>Updated by: </strong>{updatedBy}
              </span>
          </Col>
          <Col span={24}>
              <span>
                <strong>Updated at: </strong>{moment(updatedAt).format('MM/DD/YYYY hh:mm a').toUpperCase()}
              </span>
          </Col>
        </Row>
      )
    }

    if(featureSource === 'ODIN') {

      if(feature.lastModifiedBy && feature.lastModifiedBy.fullName && feature.updatedAt) {

        return renderFields(feature.lastModifiedBy.fullName, feature.updatedAt)

      }

    } else if(featureSource === 'GIS') {

      if(feature.properties && feature.properties.modified_at && feature.properties.modified_by) {

        return renderFields(feature.properties.modified_by, feature.properties.modified_at)

      }

    } else return <></>

  }

  renderFeature(feature: any, featureSource: featureSource) {

    const { mapReducer, updateMap, userReducer, schemaReducer } = this.props
    const { queryLayer } = mapReducer;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE)

    if(schema && mapReducer.queryLayer && feature) {

      /* GIS */
      let featureProperties: { [x: string]: any; }[] = [];
      let featureType: string = '';

      const schemaType = schema.types.find(elem => elem.name === constantCase(mapReducer.queryLayer!));
      const filteredCols = schema.columns.filter(elem => elem.schemaTypeId === schemaType!.id || !elem.schemaTypeId);

      featureType = schemaType ? schemaType.name : 'UNKNOWN TYPE'


      for(const key of Object.keys(feature)) {

        const col = filteredCols.find(elem => elem.mapping === key);

        if(col) {

          let value = feature[key];

          if(col.name === 'ExternalRef') {
            value = feature[key].split('.')[1];
          }

          if(col?.type === SchemaColumnTypes.ENUM) {

            // For enum values we want to show the label instead of the value
            const option = col.options.find((opt: SchemaColumnOptionEntity) => opt.value === value);

            if(option) {

              featureProperties.push({ [key]: option.label })

            } else {

              featureProperties.push({ [key]: value });

            }
          } else {

            featureProperties.push({ [key]: value });

          }
        }
      }

      return (
        <Col span={24} className={`sidebarFeatureSearchResult`}
             key={feature.id}>

          {/* Feature Header */}
          <Card
            style={{ padding: '3px' }}
            size="small"
            title={
              <h3>{
                featureSource === 'ODIN'
                  ? feature.type
                  : featureType
              }</h3>
            }
            extra={
              <div>
                <Tooltip placement="top" title="Locate Feature">
                  <Button
                    style={{ marginRight: '5px' }}
                    icon={<AimOutlined/>}
                    onClick={() => {

                      const query = `type=${queryLayer}&featureId=${featureSource === 'ODIN' ? feature.properties.ExternalRef : feature.id.split(
                        '.')[1]}`;

                      updateMap({
                        mapSidebarVisible: !isMobile,
                      })

                      this.getFeatureByIdAndZoom(query)
                    }}
                  />
                </Tooltip>
                <Tooltip placement="top" title="View Details">
                  <Button
                    icon={<EyeOutlined/>}
                    onClick={() => this.handleViewRecord(feature, featureSource) || !canUserGetRecord(
                      userReducer,
                      schema,
                    )}>
                  </Button>
                </Tooltip>
              </div>
            }
          >
            <Spin spinning={mapReducer.isLoadingView}>
              <Row style={{ fontSize: '0.9em' }}>

                {/* Feature Descriptions */}
                <Col span={24}>
                  <Row>
                    {
                      featureSource === 'ODIN'
                        ?
                        <RecordProperties columns={1} record={feature}/>
                        :
                        featureProperties.map((featureProp: any) => (
                          <Col span={24} style={{ marginBottom: '5px', wordWrap: 'break-word' }}>
                              <span>
                                <strong>
                                  {Object.keys(featureProp)}</strong>: {Object.values(featureProp).toString() ? Object.values(
                                featureProp) : '-'}
                              </span>
                          </Col>
                        ))
                    }


                    {/* Last Updated by / when */}
                    {this.renderLastModifiedFields(feature, featureSource)}

                    <Col span={24}>
                      <Divider style={{ margin: '4px' }}/>
                    </Col>


                    {/* Source: ODIN | GIS */}
                    <Col span={24} style={{ marginTop: '5px' }}>
                      <strong style={{ marginRight: '3px' }}>Source: </strong>
                      <Tag color={featureSource === 'GIS' ? 'green' : 'blue'}>
                        {featureSource}
                      </Tag>
                    </Col>

                  </Row>
                </Col>

                {/* Feature Media */}
                <Col span={24}>
                  {this.renderAssociatedMedia(feature)}
                </Col>

              </Row>
            </Spin>
          </Card>
        </Col>
      )

    } else {
      return <></>
    }

  }

  getSearchResults() {
    const { schemaReducer, recordReducer, mapReducer } = this.props;

    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE)

    let odinExternalRefs: number[] = [];
    let dataSet: any[] = [];

    /* Records are searching */
    if(recordReducer.isSearching) {
      return (
        <Col span={24} style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large"/>
        </Col>
      )
    } else {

      /* Any data coming back from GIS ? */
      if(mapReducer.features && mapReducer.features.length > 0) {

        mapReducer.features.map((feature: any) => {
          dataSet.push({ feature, featureSource: 'GIS' })
        })

      }

      /* Results coming back from Odin */
      if(schema && recordReducer && recordReducer.list[schema.id]) {

        recordReducer.list[schema.id].map((feature: any) => {
          // return this.renderFeature(feature, 'ODIN')
          odinExternalRefs.push(Number(getProperty(feature, 'ExternalRef')));
          dataSet.push({ feature, featureSource: 'ODIN' })
        })

      }


      if(dataSet.length > 0) {

        return dataSet.map(elem => {
          // if GIS check that we do not have an odin record
          if(elem.featureSource === 'GIS') {
            if(elem.feature.properties.id && !odinExternalRefs.includes(elem.feature.properties.id)) {
              return this.renderFeature(elem.feature, elem.featureSource)
            } else if(elem.feature.properties.objectid && !odinExternalRefs.includes(elem.feature.properties.objectid)) {
              return this.renderFeature(elem.feature, elem.featureSource)
            }
          } else if(elem.featureSource === 'ODIN') {
            return this.renderFeature(elem.feature, elem.featureSource)
          }
        })

      }

      /* Return Feature selection placeholder */
      else {
        return (
          <Col span={24} style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
              <div style={{ marginTop: '15px' }}>
                <p><h3 style={{ color: 'rgba(0, 0, 0, 0.25)' }}>No features selected</h3></p>
                <p>Use Feature selection<br/>button on map</p>
                <p><RadiusSettingOutlined
                  style={{
                    border: '1px solid',
                    marginTop: '10px',
                    padding: '10px',
                    fontSize: '1.3em',
                    borderRadius: '50px',
                  }}/>
                </p>
              </div>
            </div>
          </Col>
        )
      }
    }
  }

  async getFeatureByIdAndZoom(query: string) {

    const { mapReducer, alertMessage, updateMap } = this.props;
    const { map } = mapReducer;

    const REACT_APP_QGIS_SERVER_URL = 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

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
          maxZoom = 12;
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

        map?.addLayer(addFeatureVector);

        if(!addFeatureSource.isEmpty()) {

          map?.getView().fit(addFeatureSource.getExtent(), {
            maxZoom: maxZoom,
            duration: 500,
          });
        }

      }
    }
  }


  render() {

    const { mapReducer } = this.props;

    return (
      <Row style={{ display: mapReducer.mapSidebarSection === 'features' ? 'block' : 'none' }}>

        <FeatureSearchCard/>
        <div style={{ height: isMobile ? '55vh' : '60vh', overflowY: 'auto', marginTop: '15px' }}>
          <Row>
            <Col span={24} style={{ paddingRight: '15px' }}>
              <Row>
                {this.getSearchResults()}
              </Row>
            </Col>
          </Row>
        </div>
      </Row>
    )

  }
}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
  schemaReducer: state.schemaReducer,
  mapReducer: state.mapReducer,
  userReducer: state.userReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
});

export default connect(mapState, mapDispatch)(SidebarFeatures);
