import { SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Select } from 'antd';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import { MapReducerUpdate, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { LAYER_NAMES } from '../constants';
import { parseMapQuery } from '../helpers';


const { Search } = Input;

interface Props {
  mapReducer: MapReducer,
  updateMap: (params: MapReducerUpdate) => {},
}

interface State {
}

class LayerSearchCard extends React.Component<Props, State> {

  handleAddFeatureMenuClick(LayerName: string) {
    const { updateMap } = this.props;

    updateMap({
      queryLayer: LayerName,
    })

  }

  clearSearch() {

    const { updateMap, mapReducer } = this.props;
    const { map } = mapReducer;

    updateMap({
      query: undefined,
    });

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
  }

  handleSearch(searchQuery: any) {
    const { updateMap, mapReducer } = this.props;
    const { queryLayer } = mapReducer;

    updateMap({
      query: `type=${queryLayer}&featureId=${searchQuery}`,
    })
   
  }


  render() {

    const { mapReducer } = this.props;
    const { query, queryLayer } = mapReducer;
    const { Option } = Select;

    let SearchLayerNames = [
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
      LAYER_NAMES.POLYGON,
    ]

    const SearchFeatures = SearchLayerNames.map((layerName) =>
      <Option key={layerName} value={layerName}>{layerName}</Option>,
    )

    return (
      <div>
        <Card size="small"
              title={<span><SearchOutlined style={{ marginRight: '5px' }}/>Search Layers</span>}
              extra={
                <Button
                  danger
                  ghost
                  disabled={!query}
                  onClick={() => this.clearSearch()}
                >
                  {isMobile ? 'Clear' : 'Clear Search'}
                </Button>
              }
        >
          <Search
            disabled={!queryLayer}
            placeholder="Feature ID"
            defaultValue={query ? parseMapQuery(query).featureId : undefined}
            onPressEnter={(e: any) => this.handleSearch(e.target.value)}
            onSearch={(e: any) => this.handleSearch(e)}
          />

          <Select
            placeholder="Select Feature"
            onChange={(e) => {
              this.handleAddFeatureMenuClick(e.toString())
            }}
            style={{ width: '100%', marginTop: '10px' }}
            value={mapReducer.queryLayer}
          >
            {SearchFeatures}
          </Select>


        </Card>
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
});

export default connect(mapState, mapDispatch)(LayerSearchCard);
