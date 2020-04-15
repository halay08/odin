import { SearchOutlined } from '@ant-design/icons';
import { SchemaModuleEntityTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.entity.types';
import { SchemaModuleTypeEnums } from '@d19n/models/dist/schema-manager/schema/types/schema.module.types';
import { SchemaTypeEntity } from '@d19n/models/dist/schema-manager/schema/types/schema.type.entity';
import { Button, Card, Input, Select } from 'antd';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { connect } from 'react-redux';
import { MapReducerUpdate, MapSearch, setMapSearchQuery, updateMapState } from '../../../../../core/gis/store/actions';
import { MapReducer } from '../../../../../core/gis/store/reducer';
import { ISearchRecords, resetRecordsList, searchRecordsRequest } from '../../../../../core/records/store/actions';
import { IRecordReducer } from '../../../../../core/records/store/reducer';
import { SchemaReducerState } from '../../../../../core/schemas/store/reducer';
import { displayMessage } from '../../../../../shared/system/messages/store/reducers';
import { getSchemaFromShortListByModuleAndEntity } from '../../../../../shared/utilities/schemaHelpers';

const { PROJECT_MODULE } = SchemaModuleTypeEnums;
const { FEATURE } = SchemaModuleEntityTypeEnums;
const { Search } = Input;

interface Props {
  mapReducer: MapReducer,
  recordReducer: IRecordReducer,
  schemaReducer: SchemaReducerState,
  updateMap: (params: MapReducerUpdate) => {},
  searchMap: (params: MapSearch) => {}
  resetSearchMap: any,
  searchRecords: any,
}


interface State {
}

class FeatureSearchCard extends React.Component<Props, State> {

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {

    if(prevProps.mapReducer.queries !== this.props.mapReducer.queries) {
      this.fetchData()
    }

    if(prevProps.recordReducer.isSearching !== this.props.recordReducer.isSearching) {
      const schema = getSchemaFromShortListByModuleAndEntity(
        this.props.schemaReducer.shortList,
        PROJECT_MODULE,
        FEATURE,
      )
      if(schema && this.props.recordReducer.isSearching) {
        if(this.props.recordReducer.list[schema.id] && this.props.recordReducer.list[schema.id].length < 1) {
          // this.handleGisSearch()
        }
      }
    }
  }


  fetchData() {

    const { schemaReducer, searchRecords, mapReducer } = this.props;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE)

    if(schema) {
      searchRecords({
        schema: schema,
        searchQuery: {
          terms: null,
          fields: null,
          schemas: schema.id,
          sort: [ { schemaPosition: { order: 'desc' } } ],
          boolean: mapReducer.queries,
        },
      })
    }
  }

  handleAddFeatureMenuClick(LayerName: string) {
    const { updateMap } = this.props;

    updateMap({
      queryLayer: LayerName,
    })

  }

  clearSearch() {

    const { updateMap, resetSearchMap, mapReducer } = this.props;

    const { map } = mapReducer;

    if(map) {

      map?.getLayers().forEach((layer: any) => {

        if(layer) {

          if(layer.className_ === 'feature_by_id_layer') {
            map.removeLayer(layer);

            console.log('CLEAR_SEARCH_1', map?.getLayers());
            console.log('CLEAR_SEARCH_2', map?.getLayers().getLength());
            console.log('CLEAR_SEARCH_3', map?.getLayers().pop());
          }

          if(layer.className_ === 'feature_by_id_vector_circle') {
            map.removeLayer(layer);
          }

        }

      });
    }

    resetSearchMap()

    updateMap({
      map,
      drawEnabled: false,
      query: undefined,
      queryLayer: undefined,
    })


  }

  handleMapSearch(searchQuery: any) {

    const { mapReducer, searchMap } = this.props;
    const { queryLayer } = mapReducer;

    this.handleGisSearch(searchQuery);

    searchMap({
      featureIds: searchQuery,
    })

  }

  // When no data is returned from the handleMapSearch in Odin
  handleGisSearch(searchQuery: string) {

    const { updateMap, mapReducer } = this.props;
    const { queryLayer, searchTerms } = mapReducer;

    updateMap({
      query: `type=${queryLayer}&featureId=${searchQuery}`,
    })

  }


  render() {

    const { mapReducer, schemaReducer, recordReducer } = this.props;
    const { queryLayer } = mapReducer;
    const { Option } = Select;
    const schema = getSchemaFromShortListByModuleAndEntity(schemaReducer.shortList, PROJECT_MODULE, FEATURE);

    let SearchFeatures = schema?.types?.map((type: SchemaTypeEntity) =>
      <Option key={type.name} value={type.name.toLowerCase()}>{type.name.toLowerCase()}</Option>,
    )

    return (
      <div>
        <Card size="small"
              title={<span><SearchOutlined style={{ marginRight: '5px' }}/>Search Features</span>}
              extra={
                <Button
                  danger
                  ghost
                  disabled={schema ? !recordReducer.list[schema!.id] : false}
                  onClick={() => this.clearSearch()}
                >
                  {isMobile ? 'Clear' : 'Clear Search'}
                </Button>
              }
        >

          <Search
            disabled={!queryLayer}
            loading={recordReducer.isSearching}
            placeholder="Feature ID"
            onPressEnter={(e: any) => this.handleMapSearch(e.target.value)}
            onSearch={(value: any, event: any) => this.handleMapSearch(value)}
          />

          <Select
            placeholder="Select Feature"
            value={mapReducer.queryLayer}
            onChange={(e) => {
              this.handleAddFeatureMenuClick(e.toString())
            }}
            style={{ width: '100%', marginTop: '10px' }}>
            {SearchFeatures}
          </Select>

        </Card>
      </div>
    )
  }
}

const mapState = (state: any) => ({
  schemaReducer: state.schemaReducer,
  recordReducer: state.recordReducer,
  mapReducer: state.mapReducer,
});

const mapDispatch = (dispatch: any) => ({
  alertMessage: (params: { body: string, type: string }) => dispatch(displayMessage(params)),
  searchRecords: (params: ISearchRecords) => dispatch(searchRecordsRequest(params)),
  updateMap: (params: MapReducerUpdate) => dispatch(updateMapState(params)),
  searchMap: (params: MapSearch) => dispatch(setMapSearchQuery(params)),
  resetSearchMap: () => dispatch(resetRecordsList()),
});

export default connect(mapState, mapDispatch)(FeatureSearchCard);
