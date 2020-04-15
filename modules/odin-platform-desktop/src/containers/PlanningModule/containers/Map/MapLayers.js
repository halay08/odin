import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import LayerGroup from 'ol/layer/Group';
import ImageWMS from 'ol/source/ImageWMS';
import XYZ from 'ol/source/XYZ';

const REACT_APP_QGIS_SERVER_URL = process.env.REACT_APP_QGIS_SERVER_URL || 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

const minZoom = {
    polygon: 5,
    line: 10,
    point: 10
}

const debounce = 300;

export const mapLayers = [

    /* PLAN ***********************/
    new LayerGroup({
        title: 'plan',
        fold: "close",
        zIndex: 9999,
        layers: [
            new LayerGroup({
                title: 'point',
                fold: "close",
                layers: [
                    new ImageLayer({
                        zIndex: 9989,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['exchange'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'exchange',
                        visible: true,
                    }),
                    new ImageLayer({
                        zIndex: 9989,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['closure'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'closure',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9979,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['chamber'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'chamber',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9969,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['pole'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'pole',
                        visible: false,
                    }),
                ],
            }),
            new LayerGroup({
                title: 'line',
                fold: "close",
                zIndex: 8888,
                minZoom: minZoom.line,
                layers: [
                    new ImageLayer({
                        zIndex: 8878,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['cable'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'cable',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 8868,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['duct'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'duct',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 8858,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['rope'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'rope',
                        visible: false,
                    }),
                ],
            }),
        ],
    }),

    /* BUILD ***********************/
    new LayerGroup({
        title: 'build',
        fold: "close",
        zIndex: 7777,
        layers: [
            new LayerGroup({
                title: 'point',
                fold: "close",
                minZoom: minZoom.point,
                layers: [
                    new ImageLayer({
                        zIndex: 7767,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['build_closure'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'build_closure',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 7757,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['build_chamber'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'build_chamber',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 7747,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['build_pole'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'build_pole',
                        visible: false,
                    }),
                ],
            }),
            new LayerGroup({
                title: 'line',
                fold: "close",
                zIndex: 6666,
                minZoom: minZoom.line,
                layers: [
                    new ImageLayer({
                        zIndex: 6656,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['build_cable'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'build_cable',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 6646,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['build_duct'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'build_duct',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 6636,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['build_rope'],
                            },
                            ratio: 1,
                            serverType: 'qgis',
                            imageLoadFunction: function (image, src) {
                                this.timeout && clearTimeout(this.timeout);
                                this.timeout = setTimeout(() => {
                                    image.getImage().src = src;
                                }, debounce);
                            }
                        }),
                        title: 'build_rope',
                        visible: false,
                    }),
                ],
            }),
        ],
    }),

    /* POLYGON ***********************/
    new ImageLayer({
        zIndex: 5000,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': ['polygon'],
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, debounce);
            }
        }),
        title: 'polygon',
        visible: true,
    }),

    /* SURVEY ***********************/
    new LayerGroup({
        title: 'survey',
        fold: "close",
        zIndex: 4500,
        layers: [

            /* SURVEY / HAZARD */
            new ImageLayer({
                zIndex: 4400,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': 'hazard',
                    },
                    ratio: 1,
                    serverType: 'qgis',
                }),
                title: 'hazard',
                visible: false,
            }),

            /* SURVEY / BLOCKAGE */
            new ImageLayer({
                zIndex: 4300,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': 'blockage',
                    },
                    ratio: 1,
                    serverType: 'qgis',
                }),
                title: 'blockage',
                visible: false,
            }),


            /* SURVEY / SURVEY STRUCTURE */
            new ImageLayer({
                zIndex: 4200,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': 'survey_structure',
                    },
                    ratio: 1,
                    serverType: 'qgis',
                }),
                title: 'survey_structure',
                visible: false,
            }),


            /* SURVEY / SURVEY ROUTE */
            new ImageLayer({
                zIndex: 4100,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': 'survey_route',
                    },
                    ratio: 1,
                    serverType: 'qgis',
                }),
                title: 'survey_route',
                visible: false,
            }),

        ]
    }),

    /* ODIN ***********************/
    new ImageLayer({
        zIndex: 3000,
        source: new ImageWMS({
            url: REACT_APP_QGIS_SERVER_URL,
            params: {
                'LAYERS': ['orders'],
            },
            ratio: 1,
            serverType: 'qgis',
            imageLoadFunction: function (image, src) {
                this.timeout && clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    image.getImage().src = src;
                }, debounce);
            }
        }),
        title: 'odin',
        visible: false,
    }),

    /* OPENREACH ***********************/
    new LayerGroup({
        title: 'openreach',
        visible: false,
        fold: "close",
        zIndex: 2500,
        layers: [
            new ImageLayer({
                zIndex: 2400,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': ['pia_duct'],
                    },
                    ratio: 1,
                    serverType: 'qgis',
                    imageLoadFunction: function (image, src) {
                        this.timeout && clearTimeout(this.timeout);
                        this.timeout = setTimeout(() => {
                            image.getImage().src = src;
                        }, debounce);
                    }
                }),
                title: 'pia_duct',
                visible: false,
            }),
            new ImageLayer({
                zIndex: 2300,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': ['pia_structure'],
                    },
                    ratio: 1,
                    serverType: 'qgis',
                    imageLoadFunction: function (image, src) {
                        this.timeout && clearTimeout(this.timeout);
                        this.timeout = setTimeout(() => {
                            image.getImage().src = src;
                        }, debounce);
                    }
                }),
                title: 'pia_structure',
                visible: false,
            }),
        ],
    }),

    /* OS ***********************/
    new LayerGroup({
        title: 'os',
        fold: "close",
        zIndex: 1500,
        layers: [
            new ImageLayer({
                zIndex: 1400,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {
                        'LAYERS': ['ab_plus'],
                    },
                    ratio: 1,
                    serverType: 'qgis',
                    imageLoadFunction: function (image, src) {
                        this.timeout && clearTimeout(this.timeout);
                        this.timeout = setTimeout(() => {
                            image.getImage().src = src;
                        }, debounce);
                    }
                }),
                title: 'ab_plus',
                visible: false,
            }),
            new ImageLayer({
                zIndex: 1300,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {'LAYERS': ['topographicline']},
                    ratio: 1,
                    serverType: 'qgis',
                }),
                title: 'topographicline',
                visible: false,
            }),
        ],
    }),

    /* MAPS ***********************/
    new LayerGroup({
        title: 'maps',
        zIndex: -100,
        fold: "close",
        layers: [
            new TileLayer({
                source: new XYZ({
                    url: 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
                }),
                title: 'google Roads',
                visible: true,
                zIndex: -100
            }),
            new TileLayer({
                source: new XYZ({
                    url: 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
                }),
                title: 'google Satelite',
                visible: false,
                zIndex: -100
            }),
            new TileLayer({
                source: new XYZ({
                    url: 'https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
                }),
                title: 'google Hybrid',
                visible: false,
                zIndex: -100
            }),
        ],
    }),

];


