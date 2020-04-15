import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
import { BooleanQuery } from '@d19n/models/dist/search/search.query.boolean.interfaces';
import { Geolocation } from 'ol';
import { Coordinate } from 'ol/coordinate';
import Map from 'ol/Map';
import { FEATURE_NAMES } from '../../../containers/PlanningModule/containers/Map/constants';
import { Feature } from '../../../containers/PlanningModule/containers/Map/interfaces/feature.interface';
import {
  RESET_MAP_SEARCH_QUERY,
  SET_MAP_SEARCH_QUERY,
  UPDATE_MAP_COORDINATES_STATE,
  UPDATE_MAP_STATE,
} from './constants';


export interface MapReducer {

  map: Map | undefined,
  mapSidebarVisible: boolean,
  mapSidebarSection: 'layers' | 'features',
  isFilter: boolean,
  selectedFeature: any,
  isRequesting: boolean,
  mapCenter: Coordinate | undefined,
  coordinates: number[][],
  query: string | undefined;
  drawEnabled: boolean,
  addEnabled: boolean,
  addPointModal: boolean,
  addLineModal: boolean,
  addFeatureModal: boolean,
  featureSelectModal: boolean,
  features: Feature[],
  feature: Feature | undefined,
  featureId: number | undefined,
  buildStatusId: number,
  featureName?: FEATURE_NAMES
  shouldUpdate: boolean,
  showCreateModal: boolean,
  showUpdateModal: boolean,
  isLoadingView: boolean,
  recordId: string | undefined,
  isLocating: boolean,
  geoEnabled: boolean,
  geolocation: Geolocation | undefined,
  record: DbRecordEntityTransform | undefined,
  queryLayer: string | undefined,
  addLineEnabled: boolean,
  zoomLevel: number | undefined,
  searchTerms: string,
  infoPopupVisible: boolean,
  addPointConfirmVisible: boolean,
  queries: {
    must: [],
    must_not: [],
    should: [],
    filter: [],
  }
}

export const initialState: MapReducer = {

  map: undefined,
  mapSidebarVisible: false,
  mapSidebarSection: 'layers',
  isFilter: false,
  selectedFeature: undefined,
  isRequesting: false,
  mapCenter: undefined,
  coordinates: [],
  query: undefined,
  features: [],
  feature: undefined,
  drawEnabled: false,
  addEnabled: false,
  addPointModal: false,
  addLineModal: false,
  addFeatureModal: false,
  featureSelectModal: false,
  shouldUpdate: true,
  featureId: undefined,
  featureName: undefined,
  buildStatusId: 1,
  showCreateModal: false,
  showUpdateModal: false,
  isLoadingView: false,
  recordId: undefined,
  isLocating: false,
  geoEnabled: false,
  geolocation: undefined,
  record: undefined,
  queryLayer: undefined,
  addLineEnabled: false,
  zoomLevel: undefined,
  searchTerms: '',
  infoPopupVisible: false,
  addPointConfirmVisible: false,
  queries: {
    must: [],
    must_not: [],
    should: [],
    filter: [],
  },
};


function reducer(state = initialState, action: any) {
  switch (action.type) {

    case UPDATE_MAP_STATE: {
      return {
        ...state,
        ...action.params,
      }
    }

    case UPDATE_MAP_COORDINATES_STATE: {
      return {
        ...state,
        coordinates: [ ...state.coordinates, ...action.params.coordinates ],
      }
    }

    case RESET_MAP_SEARCH_QUERY: {
      return {
        ...state,
        queries: initialState.queries,
      }
    }

    case SET_MAP_SEARCH_QUERY:

      let ids: any[] = []

      ids = action.params.featureIds.split(',')
      ids = ids.map((id: string) => id.trim()).filter((id: string) => ![ '', null, undefined ].includes(id))

      const newQueries: BooleanQuery = {
        must: [
          {
            'query_string': {
              'fields': [ 'type' ],
              'query': state.queryLayer,
              'default_operator': 'AND',
              'lenient': true,
            },
          },
          {
            'terms': {
              'properties.ExternalRef': ids,
            },
          },
        ],
        must_not: [],
        should: [],
        filter: [],
      };

      return {
        ...state,
        searchTerms: ids.join(),
        queries: newQueries,
      };


    default:
      return state;
  }
}

export default reducer;


