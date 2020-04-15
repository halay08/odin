import { DbRecordEntityTransform } from '@d19n/models/dist/schema-manager/db/record/transform/db.record.entity.transform';
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

export interface MapReducerUpdate {
  map?: Map | undefined,
  mapSidebarVisible?: boolean,
  mapSidebarSection?: 'layers' | 'features',
  isFilter?: boolean,
  selectedFeature?: any,
  isRequesting?: boolean,
  mapCenter?: Coordinate | undefined,
  coordinates?: number[][],
  query?: string | undefined;
  drawEnabled?: boolean,
  addEnabled?: boolean,
  addPointModal?: boolean,
  addLineModal?: boolean,
  addFeatureModal?: boolean,
  featureSelectModal?: boolean,
  featureId?: number,
  buildStatusId?: number,
  featureName?: FEATURE_NAMES
  shouldUpdate?: boolean,
  showCreateModal?: boolean,
  showUpdateModal?: boolean,
  isLoadingView?: boolean,
  recordId?: string | undefined,
  features?: Feature[],
  feature?: Feature | undefined,
  isLocating?: boolean,
  geoEnabled?: boolean,
  geolocation?: Geolocation | undefined,
  record?: DbRecordEntityTransform | undefined,
  queryLayer?: string | undefined,
  addLineEnabled?: boolean,
  zoomLevel?: number | undefined
  infoPopupVisible?: boolean,
  addPointConfirmVisible?: boolean,
}

export interface MapSearch {
  featureIds: []
}

export function updateMapState(params: MapReducerUpdate) {
  return {

    type: UPDATE_MAP_STATE,
    params,

  }
}

export function updateMapCoordinatesState(params: MapReducerUpdate) {
  return {
    type: UPDATE_MAP_COORDINATES_STATE,
    params,

  }
}

export function setMapSearchQuery(params: MapSearch) {
  return {
    type: SET_MAP_SEARCH_QUERY,
    params,
  }
}

export function resetMapSearchQuery() {
  return {
    type: RESET_MAP_SEARCH_QUERY,
  }
}

