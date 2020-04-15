import { Button, Card, Descriptions, Drawer, Modal, Spin } from 'antd';
import React from 'react';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { httpGet } from '../../../../../shared/http/requests';
import { canUserGetRecord } from '../../../../../shared/permissions/rbacRules';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';
import {
  blockageModels,
  buildStatuses,
  cableTypes,
  chamberModels,
  closureTypes,
  ductTypes,
  getCardTitleFromFeatureId,
  getLayerFeatureName,
  getLayerType,
  poleModels,
} from '../helpers';
import { Feature } from '../interfaces/feature.interface';
import FeaturePreview from './FeaturePreview';


interface Props {
  alertMessage: any,
  userReducer: any,
  schemaReducer: SchemaReducerState,
  mapReducer: MapReducer,
  updateMap: (params: MapReducerUpdate) => {}
}

interface State {
}

class FeatureListModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

  }


  renderFeatureList() {
    const { mapReducer, updateMap, schemaReducer, userReducer } = this.props;
    const { isLoadingView, features, isRequesting } = mapReducer;


    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, 'ProjectModule', 'Feature');

    return features.map(feat => (
      <Card
        style={{ marginBottom: 10 }}
        title={getCardTitleFromFeatureId(feat)}
        extra={[
          // <Button
          //   ghost
          //   style={{ marginRight: 8 }}
          //   disabled={![ ...updateFeatures ].includes(getLayerFeatureName(feat)) || !canUserUpdateRecord(
          //     userReducer,
          //     schema,
          //   )}
          //   loading={isRequesting} size="small" type="primary"
          //   onClick={() => updateMap({
          //     showUpdateModal: true,
          //     isRequesting: false,
          //     featureId: feat.properties.id || feat.properties.objectid,
          //     featureName: getLayerFeatureName(feat),
          //     feature: feat,
          //     buildStatusId: feat.properties.build_status_id,
          //   })}>Edit</Button>,
          <Button
            loading={isLoadingView}
            size="small"
            type="primary"
            ghost
            onClick={() => this.handleViewRecord(feat) || !canUserGetRecord(
              userReducer,
              schema,
            )}>view</Button>,
        ]}>

        {this.renderFeatureDescription(feat)}
      </Card>
    ))
  }

  stringToUrl(description: any) {

    if(description && typeof description === 'string' && description.indexOf('http') > -1) {

      return <a href={description} target="__blank">{description}</a>;

    } else {
      return description;
    }
  }


  renderFeatureDescription(feature: Feature) {

    const layerName = getLayerType(feature);

    if(layerName.indexOf('closure') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item
          label="type">{closureTypes[Number(feature.properties.type_id || feature.properties.type)]}</Descriptions.Item>
        <Descriptions.Item label="power">{feature.properties.power}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('duct') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id || feature.properties.objectid}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item
          label="type">{ductTypes[Number(feature.properties.type_id || feature.properties.type)]}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('rope') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('pole') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item
          label="model">{poleModels[feature.properties.model || feature.properties.model_id]}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('chamber') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item
          label="model">{chamberModels[feature.properties.model || feature.properties.model_id]}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('cable') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item
          label="type">{cableTypes[Number(feature.properties.type_id || feature.properties.type)]}</Descriptions.Item>
      </Descriptions>;
    }
    if(layerName.indexOf('blockage') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item
          label="model">{blockageModels[feature.properties.model || feature.properties.model_id]}</Descriptions.Item>
      </Descriptions>;
    }
    if(layerName.indexOf('hazard') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
        <Descriptions.Item label="build status">{buildStatuses[feature.properties.build_status_id]}</Descriptions.Item>
        <Descriptions.Item label="model">{feature.properties.model || feature.properties.model_id}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('survey_structure') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item
          label="model">{this.stringToUrl(feature.properties.model || feature.properties.model_id)}</Descriptions.Item>
        <Descriptions.Item
          label="type">{this.stringToUrl(feature.properties.type || feature.properties.type_id)}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.comment)}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('survey_point') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.id}</Descriptions.Item>
        <Descriptions.Item
          label="model">{this.stringToUrl(feature.properties.model || feature.properties.model_id)}</Descriptions.Item>
        <Descriptions.Item
          label="type">{this.stringToUrl(feature.properties.type || feature.properties.type_id)}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.comment)}</Descriptions.Item>
      </Descriptions>;
    }

    if(layerName.indexOf('structure') > -1) {
      return <Descriptions column={1}>
        <Descriptions.Item label="id">{feature.properties.objectid}</Descriptions.Item>
        <Descriptions.Item label="description">{this.stringToUrl(feature.properties.description)}</Descriptions.Item>
      </Descriptions>;
    }

    return <pre>{JSON.stringify(feature, null, 2)}</pre>;

  }

  async handleViewRecord(feat: Feature) {
    const { alertMessage, updateMap } = this.props;
    // create find or create the feature in odin
    // open the drawer with the feature detail
    // add file attachments

    updateMap({
      isLoadingView: true,
    })

    await httpGet(
      `ProjectModule/v1.0/cst/Feature/${getLayerFeatureName(feat)}/${feat.properties.id || feat.properties.objectid}`,
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
    const { recordId, isLoadingView, features } = mapReducer;

    return (
      <>
        <Modal
          title="Selected Features"
          zIndex={500}
          bodyStyle={{ maxHeight: 600, overflow: 'auto' }}
          maskClosable={false}
          destroyOnClose
          centered
          footer={false}
          /*visible={features && features.length > 0}*/
          visible={false}
          onCancel={() =>
            updateMap({
              recordId: undefined,
              isLoadingView: false,
              features: [],
            })}>
          {this.renderFeatureList()}
        </Modal>

        <Drawer
          width={'100%'}
          visible={!isLoadingView && !!recordId}
          onClose={() => updateMap({ recordId: undefined })}
          destroyOnClose>
          {isLoadingView && !recordId ? <Spin>Loading...</Spin> :
            <FeaturePreview/>
          }
        </Drawer>
      </>
    )
  }

}

const mapState = (state: any) => ({
  userReducer: state.userReducer,
  schemaReducer: state.schemaReducer,
  mapReducer: state.mapReducer,
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
});

export default connect(mapState, mapDispatch)(FeatureListModal);
