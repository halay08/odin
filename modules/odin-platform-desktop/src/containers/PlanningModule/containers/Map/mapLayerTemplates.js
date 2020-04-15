import {Image as ImageLayer} from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';

const REACT_APP_QGIS_SERVER_URL = process.env.REACT_APP_QGIS_SERVER_URL || 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

/**
 * Generic template for build status layers
 * @param layerName
 * @param opacity
 * @returns {ImageLayer[]}
 */
export const buildStatusLayers = (layerName, opacity = undefined) =>
    [
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 1`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '1-Plan',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 2`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '2-Survey',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 3`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '3-Design',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 4`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '4-Plan Done',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 5`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '5-ToDo',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 6`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '6-In Progress',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 7`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '7-Build Done',
            visible: false,
            opacity: opacity ? opacity : 1
        }),
        new ImageLayer({
            zIndex: 8695,
            source: new ImageWMS({
                url: REACT_APP_QGIS_SERVER_URL,
                params: {
                    'LAYERS': [layerName],
                    'FILTER': `${layerName}:"build_status_id" = 8`,
                },
                ratio: 1,
                serverType: 'qgis',
                imageLoadFunction: function (image, src) {
                    this.timeout && clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        image.getImage().src = src;
                    }, 200);
                }
            }),
            title: '8-Done',
            visible: false,
            opacity: opacity ? opacity : 1
        })
    ];


/**
 *
 * @param layerName
 * @returns {[ImageLayer, ImageLayer, ImageLayer]}
 */
export const blockageLayers = (layerName) => [
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 1`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'First',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 7`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Next',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 6`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Desilt',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 8`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Water',
        visible: false,
    }),
];


/**
 * For Hazards
 * @param layerName
 * @returns {ImageLayer[]}
 */
export const hazardLayers = (layerName) => [
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 2`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'D-Chamber',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 3`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'D-Pole',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 4`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'H&S',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 5`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Permits',
        visible: false,
    }),

]


/**
 * For Poles
 * @param layerName
 * @returns {ImageLayer[]}
 */
export const planPoleLayers = (layerName) => [
    new ImageLayer({
        source: new ImageWMS({
            zIndex: 9699,
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 3 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Medium',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            zIndex: 9699,
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 4 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Light',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            zIndex: 9699,
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 5 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Stout',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            zIndex: 9699,
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 6 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Openreach',
        visible: false,
    }),
    new ImageLayer({
        source: new ImageWMS({
            zIndex: 9699,
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"eco" = 'false'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'eco=false',
        visible: false,
    })
]

/**
 * For Chambers
 * @param layerName
 * @returns {ImageLayer[]}
 */
export const planChamberLayers = (layerName) => [
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 3 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'cw1',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 4 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'cw2',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 7 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'fw2',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 1 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'fw4',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 2 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'fw6',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 10 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'fw10',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 8 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Toby',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"model_id" = 9 AND "eco" = 'true'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'Openreach',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9799,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"eco" = 'false'`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'eco=false',
        visible: false,
    })
]


/**
 * For Closure
 * @param layerName
 * @returns {ImageLayer[]}
 */
export const planClosureLayers = (layerName) => [
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 1`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'L0',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 2`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'L1',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 3`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'L2',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 4`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'L3',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 5`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'L4',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 6`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'LX',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 11`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'LM',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 12`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'LT',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 9`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'ODF',
        visible: false,
    }),
    new ImageLayer({
        zIndex: 9899,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': [layerName],
                'FILTER': `${layerName}:"type_id" = 10`,
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, 200);
            }
        }),
        title: 'OLT',
        visible: false,
    })
]
