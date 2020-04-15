import {Image as ImageLayer} from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';

const REACT_APP_QGIS_SERVER_URL = process.env.REACT_APP_QGIS_SERVER_URL || 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

const getTypeByLayerName = (layerName) => {
    switch (layerName) {
        case 'Closure':
            return 'type_id'
        case 'Chamber':
            return 'model_id'
        case 'Pole':
            return 'model_id'
        case 'Cable':
            return 'type_id'
        case 'Duct':
            return 'type_id'
        case 'Rope':
            return 'type_id'
        case 'Polygon':
            return 'name'
        case 'Structure':
            return 'object_class'
        default:
            return 'type_id'
    }
}


const getEcoParameter = (layerName) => {
    switch (layerName) {
        case 'Closure':
            return ''
        case 'Chamber':
            return `AND "eco" = 'true'`
        case 'Pole':
            return `AND "eco" = 'true'`
        case 'Duct':
            return `AND "eco" = 'true'`
        case 'Polygon':
            return `AND "eco" = 'true'`
        default:
            return ''
    }
}

/**
 * For Closure
 * @param layerName
 * @param typeOrModelId
 * @param additionalParams
 * @returns {ImageLayer[]}
 */
export const buildStatusLayers = (layerName, typeOrModelId, additionalParams = undefined) => [

    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 9 AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '0-Backlog (9)',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 1 AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '1-Plan',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 2  AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '2-Survey',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 3 AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '3-Design',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 4 AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '4-Plan Done',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 5  AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '5-ToDo',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 6  AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '6-In Progress',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 7  AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '7-Build Done',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"build_status_id" = 8  AND "${getTypeByLayerName(layerName)}" = ${typeOrModelId} ${getEcoParameter(layerName)} ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: '8-RFS',
        visible: false,
    }),
]


export const poleChamberClosure = (layerName, typeId, additionalParams = undefined) => [

    /* Pole */
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = ${typeId} AND "model_id" = 2 ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: 'Pole',
        visible: false,
    }),

    /* Chamber */
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = ${typeId} AND "model_id" = 3 ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: 'Chamber',
        visible: false,
    }),

    /* Closure */
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = ${typeId} AND "model_id" = 1 ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: 'Closure',
        visible: false,
    })

]

export const ductCableRope = (layerName, typeId, additionalParams = undefined) => [

    /* Duct */
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = ${typeId} AND "model_id" = 3 ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: 'Duct',
        visible: false,
    }),

    /* Cable */
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = ${typeId} AND "model_id" = 2 ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: 'Cable',
        visible: false,
    }),

    /* Rope */
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = ${typeId} AND "model_id" = 1 ${additionalParams ? additionalParams : ''}`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 100);
            }
        }),
        title: 'Rope',
        visible: false,
    }),


]
