import LayerGroup from 'ol/layer/Group';
import ImageLayer from 'ol/layer/Image';
import { changeToCapitalCase, chunkArray } from '../../../../shared/utilities/dataTransformationHelpers';

export const createFeatures = [
  'blockage',
  'hazard',
];

export const updateFeatures = [
  'blockage',
  'chamber',
  'closure',
  'rope',
  'cable',
  'duct',
  'pole',
  'hazard',
  'polygon',
];

export const deleteFeatures = [
  'blockage',
  'chamber',
  'closure',
  'rope',
  'cable',
  'duct',
  'pole',
  'hazard',
  'surveyroute', // survey_route
  'surveystructure', // survey_structure
];

/**
 *
 * @param feature
 */
export function getLayerFeatureName(feature: any) {

  let featureName;

  if(feature && feature.id) {

    const split = feature.id.split('.');
    featureName = split[0];

  }

  return featureName ? featureName.toLowerCase() : undefined;

}

/**
 * we pass in the feature type in the map url
 * this function parses that to conform to our internal feature names
 * @param feature
 */
export function transformFeatureNameFromUrl(feature: any) {

  let featureName;

  if(feature) {

    featureName = feature;

    // exceptions
    // if(feature.includes('survey_route') ||
    //   feature.includes('survey_structure') ||
    //   feature.includes('pia_structure') ||
    //   feature.includes('pia_duct')) {
    //   // we remove the _
    //   // surveystructure
    //   // surveyroute
    //   // const name = feature.replace('_', '');
    //   featureName = name;
    //
    // } else {
    //   // const split = feature.split('_');
    //
    //   // featureName = split[split.length - 1];
    //   featureName = feature;
    // }
  }

  return featureName ? featureName.toLowerCase() : undefined;

}


export function getLayerType(feature: any) {

  const split = feature.id.split('.');
  const featureName = split[0];

  return featureName;
}

export function getCardTitleFromFeatureId(feature: any) {

  const split = feature.id.split('.');
  const featureName = split[0];

  return changeToCapitalCase(featureName);

}

/**
 *
 */
export const getLayersAndCoordinates = (poly: any, map: any) => {

  const polygonCoordinates = chunkArray(poly.flatCoordinates, 2);
  const flatCoordinateQuery = parsePolygonFlatCoordinatesToWMSQuery(polygonCoordinates);

  const allLayers: string[] = [];
  const allFilters: string[] = [];

  map?.getLayers().forEach((mapLayer: any) => {
      const { layers, layersFilters } = getVisibleImageLayerNames(mapLayer);
      allLayers.push(...layers);
      allFilters.push(...layersFilters);
    },
  );

  return {
    layers: allLayers,
    filters: allFilters,
    coordinates: flatCoordinateQuery,
  }
}

/**
 *
 * @param layer
 * @param length
 * @param i
 */
export const getVisibleImageLayerNames = (layer: any): { layers: string[], layersFilters: string[] } => {

  const layers: string[] = [];
  const layersFilters: string[] = [];

  // we only want ImageLayers
  if(layer instanceof LayerGroup) {


    const isVisible = layer.getVisible();
    if(isVisible) {
      const layersArray = layer.getLayersArray();

      for(const lyr of layersArray) {

        console.log('layer_name', lyr.get('layerName'));

        if(lyr instanceof ImageLayer) {

          if(lyr.getVisible()) {

            if(lyr.get('filter')) {

              console.log('lyr_filter', lyr.get('filter'));

              layers.push(lyr.get('layerName'))
            } else {

              console.log('lyr_source', lyr.get('source'));

              const layersArr = lyr.get('source')['params_']['LAYERS'];
              const layersFilter = lyr.get('source')['params_']['FILTER'];

              layers.push(...layersArr);

              if(layersFilter) {

                layersFilters.push(layersFilter);
              }
            }
          }
        }
      }
    }
  }

  return { layers, layersFilters };

}

/**
 * Helper method to check if elem is a function
 * @param functionToCheck
 */
function isFunction(functionToCheck: any) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}


/**
 *
 * @param query
 */
export function parseMapQuery(query: string | undefined): any {

  if(query) {

    const split = query.split('&');
    const splitType = split[0].split('type=');
    const splitFeatId = split[1].split('featureId=');

    return {
      type: splitType[1],
      featureId: splitFeatId[1],
    }

  }
}

/**
 * Helper if
 * @param poly
 */
function parsePolygonFlatCoordinatesToWMSQuery(poly: any[]) {

  let base = 'POLYGON ((#coordinates#))';

  let stringOfCoordinates = '';

  poly.forEach(
    (el: any, i: number) => {
      if(poly.length !== i + 1) {

        stringOfCoordinates += `${el[0]} ${el[1]},`;

      } else {

        stringOfCoordinates += `${el[0]} ${el[1]}`;

      }
    },
  )

  return base.replace('#coordinates#', stringOfCoordinates);
}


// Temporary key: value for id columns

export const blockageModels: { [key: number]: string } = {

  1: 'First',
  2: 'Next',
  3: 'Desilt',
}

export const chamberModels: { [key: number]: string } = {

  1: 'fw4',
  7: 'fw2',
  2: 'fw6',
  10: 'fw10',
  3: 'cw1',
  4: 'cw2',
  8: 'Toby',
  9: 'Openreach',
}
export const chamberSurfaceTypes: { [key: number]: string } = {

  0: '1- Null',
  1: '2- Soft',
  2: '3- FW',
  3: '4- CW',
  4: '5- Special',
}

export const closureTypes: { [key: number]: string } = {

  1: 'L0',
  2: 'L1',
  3: 'L2',
  4: 'L3',
  5: 'L4',
  6: 'LX',
  9: 'ODF',
  10: 'OLT',
}

export const ductTypes: { [key: number]: string } = {
  1: '1-Duct',
  2: '2-Sduct',
  3: '3-Lead-in',
  4: 'Openreach',
}

export const cableTypes: { [key: number]: string } = {
  1: 'Spine',
  2: 'Distribution',
  3: 'Access',
  4: 'Feed',
  5: 'Drop',
  6: 'Temp',
  7: 'CableLink',
}

export const poleModels: { [key: number]: string } = {
  1: 'Generic',
  3: 'Medium',
  4: 'Light',
  5: 'Stout',
  6: 'Openreach',
}

export const buildStatuses: { [key: number]: string } = {
  1: '1-Plan',
  2: '2-Survey',
  3: '3-Design',
  4: '4-Plan Done',
  5: '5-Done',
  6: '6-In Progress',
  7: '7-Build Done',
  8: '8-RFS',
}

