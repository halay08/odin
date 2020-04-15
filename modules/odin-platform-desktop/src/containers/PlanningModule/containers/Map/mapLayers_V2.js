import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import LayerGroup from 'ol/layer/Group';
import ImageWMS from 'ol/source/ImageWMS';
import XYZ from 'ol/source/XYZ';
import {buildStatusLayers, ductCableRope, poleChamberClosure} from "./mapLayerTemplates_V2";

const REACT_APP_QGIS_SERVER_URL = process.env.REACT_APP_QGIS_SERVER_URL || 'https://api.odin.prod.netomnia.com/cgi-bin/qgis_mapserv.fcgi?map=/home/qgis/projects/project.qgs';

export const mapLayers = [

    /* FTTH **************************/
    new LayerGroup({
        title: 'FTTH',
        fold: "close",
        zIndex: 9999,
        layers: [

            /* FTTH / POINT */
            new LayerGroup({
                title: 'Point',
                fold: "close",
                layers: [

                    /* FTTH / POINT / EXCHANGE */
                    new LayerGroup({
                        title: 'Exchange',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Exchange',
                                        'FILTER': `Exchange:"kci" = 1`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Order Raised',
                                visible: false,
                            }),
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Exchange',
                                        'FILTER': `Exchange:"kci" = 2`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'In Survey',
                                visible: false,
                            }),
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Exchange',
                                        'FILTER': `Exchange:"kci" = 3`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Survey Completed',
                                visible: false,
                            }),
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Exchange',
                                        'FILTER': `Exchange:"kci" = 4`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'In Build',
                                visible: false,
                            }),
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Exchange',
                                        'FILTER': `Exchange:"kci" = 5`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Ready for Handover',
                                visible: false,
                            }),
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Exchange',
                                        'FILTER': `Exchange:"kci" = 6`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Live',
                                visible: false,
                            }),

                        ]
                    }),

                    /* FTTH / POINT / CLOSURE */
                    new LayerGroup({
                        title: 'Closure',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new LayerGroup({
                                title: 'L0',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 1)
                            }),
                            new LayerGroup({
                                title: 'L1',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 2)
                            }),
                            new LayerGroup({
                                title: 'L2',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 3)
                            }),
                            new LayerGroup({
                                title: 'L3',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 4)
                            }),
                            new LayerGroup({
                                title: 'L4',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 5)
                            }),
                            new LayerGroup({
                                title: 'LM',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 11)
                            }),
                            new LayerGroup({
                                title: 'LX',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 6)
                            }),
                            new LayerGroup({
                                title: 'ODF',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 9)
                            }),
                            new LayerGroup({
                                title: 'OLT',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Closure', 10)
                            }),
                        ]
                    }),

                    /* FTTH / POINT / CHAMBER */
                    new LayerGroup({
                        title: 'Chamber',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new LayerGroup({
                                title: 'CW1',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 3)
                            }),
                            new LayerGroup({
                                title: 'CW2',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 4)
                            }),
                            new LayerGroup({
                                title: 'Toby',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 8)
                            }),
                            new LayerGroup({
                                title: 'Openreach',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 9)
                            }),
                            new LayerGroup({
                                title: 'FW2',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 1)
                            }),
                            new LayerGroup({
                                title: 'FW4',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 2)
                            }),
                            new LayerGroup({
                                title: 'FW6',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 7)
                            }),
                            new LayerGroup({
                                title: 'FW10',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Chamber', 10)
                            }),
                        ]
                    }),

                    /* FTTH / POINT / POLE */
                    new LayerGroup({
                        title: 'Pole',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new LayerGroup({
                                title: 'Medium',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Pole', 3)
                            }),
                            new LayerGroup({
                                title: 'Light',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Pole', 4)
                            }),
                            new LayerGroup({
                                title: 'Stout/Generic',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: [

                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 9 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 9 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '0-Backlog (9)',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 1 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 1 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '1-Plan',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 2 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 2 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '2-Survey',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 3 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 3 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '3-Design',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 4 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 4 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '4-Plan Done',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 5 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 5 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '5-ToDo',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 6 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 6 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '6-In Progress',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 7 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 7 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '7-Build Done',
                                        visible: false,
                                    }),
                                    new ImageLayer({
                                        zIndex: 9899,
                                        source: new ImageWMS({
                                            url: REACT_APP_QGIS_SERVER_URL,
                                            params: {
                                                'LAYERS': 'Pole',
                                                'FILTER': `Pole:"build_status_id" = 8 AND "model_id" = 1 AND "eco" = 'true' OR "build_status_id" = 8 AND "model_id" = 5 AND "eco" = 'true'`,
                                            },
                                            ratio: 1,
                                            serverType: 'qgis',
                                        }),
                                        title: '8-RFS',
                                        visible: false,
                                    }),


                                ]
                            }),
                            new LayerGroup({
                                title: 'Openreach',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Pole', 6)
                            }),
                        ]
                    })
                ],
            }),

            /* FTTH / LINE */
            new LayerGroup({
                title: 'Line',
                fold: "close",
                layers: [

                    /* FTTH / LINE / CABLE */
                    new LayerGroup({
                        title: 'Cable',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new LayerGroup({
                                title: 'Spine',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 1, 'AND "ground_id" = 2')
                            }),
                            new LayerGroup({
                                title: 'Distribution',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 2, 'AND "ground_id" = 2')
                            }),
                            new LayerGroup({
                                title: 'Access_UG',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 3, 'AND "ground_id" = 2')
                            }),
                            new LayerGroup({
                                title: 'Access_OH',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 3, 'AND "ground_id" = 1')
                            }),
                            new LayerGroup({
                                title: 'Feed_UG',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 4, 'AND "ground_id" = 2')
                            }),
                            new LayerGroup({
                                title: 'Feed_OH',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 4, 'AND "ground_id" = 1')
                            }),
                            new LayerGroup({
                                title: 'Drop_UG',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 5, 'AND "ground_id" = 2')
                            }),
                            new LayerGroup({
                                title: 'Drop_OH',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 5, 'AND "ground_id" = 1')
                            }),
                            new LayerGroup({
                                title: 'Temp',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 6)
                            }),
                            new LayerGroup({
                                title: 'CableLink',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Cable', 7)
                            })
                        ]
                    }),

                    /* FTTH / LINE / DUCT */
                    new LayerGroup({
                        title: 'Duct',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new LayerGroup({
                                title: 'Duct',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Duct', 1)
                            }),
                            new LayerGroup({
                                title: 'Subduct',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Duct', 2)
                            }),
                            new LayerGroup({
                                title: 'Openreach',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Duct', 4)
                            }),
                        ]
                    }),

                    /* FTTH / LINE / ROPE */
                    new LayerGroup({
                        title: 'Rope',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: [
                            new LayerGroup({
                                title: 'Spine',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Rope', 1)
                            }),
                            new LayerGroup({
                                title: 'Distribution',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Rope', 2)
                            }),
                            new LayerGroup({
                                title: 'Access',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Rope', 3)
                            }),
                            new LayerGroup({
                                title: 'Feed',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Rope', 4)
                            }),
                            new LayerGroup({
                                title: 'No type',
                                visible: false,
                                fold: "close",
                                zIndex: 9899,
                                layers: buildStatusLayers('Rope', 'null')
                            }),
                        ]
                    }),
                ]
            }),

            /* FTTH / POLYGON */
            new LayerGroup({
                title: 'Polygon',
                fold: "close",
                zIndex: 9999,
                layers: [
                    new ImageLayer({
                        source: new ImageWMS({
                            zIndex: 9699,
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Polygon',
                                'FILTER': `Polygon:"name" = 'EX'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'EX',
                        visible: false,
                    }),
                    new LayerGroup({
                        title: 'L0',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: buildStatusLayers('Polygon', "'L0'")
                    }),
                    new LayerGroup({
                        title: 'L1',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: buildStatusLayers('Polygon', "'L1'")
                    }),
                    new LayerGroup({
                        title: 'L2',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: buildStatusLayers('Polygon', "'L2'")
                    }),
                    new LayerGroup({
                        title: 'L3',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: buildStatusLayers('Polygon', "'L3'")
                    }),
                    new LayerGroup({
                        title: 'L4',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: buildStatusLayers('Polygon', "'L4'")
                    }),
                    new LayerGroup({
                        title: 'LM',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: buildStatusLayers('Polygon', "'LM'")
                    }),
                ]
            })

        ]
    }),

    /* OPENREACH *********************/
    new LayerGroup({
        title: 'Openreach',
        fold: "close",
        zIndex: 9999,
        layers: [

            /* OPENREACH / STRUCTURE */
            new LayerGroup({
                title: 'Structure',
                fold: "close",
                layers: [
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'EXCH'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Exchange',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'CAB'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Cabinet',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'MH'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Manhole',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'JB'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Jointing Chamber',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'POLE'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Pole',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'TEE'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Duct Tee',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'RED'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Reducer',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'OTHER' AND "type_name" = 'SPLIT COUPLING'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Split Coupling',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Structure',
                                'FILTER': `Structure:"object_class" = 'OTHER' AND "type_name" = 'CHANGE OF STATE' OR "object_class" = 'JP' AND "type_name" = 'CHANGE_OF_STATE'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Change of State',
                        visible: false,
                    }),
                ]
            }),

            /* OPENREACH / DUCT */
            new LayerGroup({
                title: 'Duct',
                fold: "close",
                layers: [
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Duct',
                                'FILTER': `Duct:"ND"`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Change of State',
                        visible: false,
                    }),
                ]
            })

        ]
    }),

    /* SURVEY ***********************/
    new LayerGroup({
        title: 'Survey',
        fold: "close",
        zIndex: 9999,
        layers: [

            /* SURVEY / HAZARD */
            new LayerGroup({
                title: 'Hazard',
                fold: "close",
                zIndex: 9999,
                layers: [
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '2'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Section 58',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '3'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Joint User Pole',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '6'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'D-Pole',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '7'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Pole Network Adjustments',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '8'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Tree Trimming',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '9'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Wayleave',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '10'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'TM - Bus Stop',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '11'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'TM - Road Closure',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '12'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'TM - Emergency Entrance',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '13'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'TM - Constructions Works',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '14'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'TM - Pedestrians Diversion',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Hazard',
                                'FILTER': `Hazard:"model_id" = '15'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'No Access to Asset',
                        visible: false,
                    }),
                ]
            }),

            /* SURVEY / BLOCKAGE */
            new LayerGroup({
                title: 'Blockage',
                fold: "close",
                zIndex: 9999,
                layers: [
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Blockage',
                                'FILTER': `Blockage:"model_id" = '1'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'First',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Blockage',
                                'FILTER': `Blockage:"model_id" = '7'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Next',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Blockage',
                                'FILTER': `Blockage:"model_id" = '6'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Deslit',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Blockage',
                                'FILTER': `Blockage:"model_id" = '8'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Water',
                        visible: false,
                    }),
                ]
            }),

            /* SURVEY / SURVEY STRUCTURE */
            new LayerGroup({
                title: 'Survey Structure',
                fold: "close",
                zIndex: 9999,
                layers: [
                    new LayerGroup({
                        title: 'Relocate Asset',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: poleChamberClosure('Survey Structure', 1)
                    }),
                    new LayerGroup({
                        title: 'Missing Inventory',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: poleChamberClosure('Survey Structure', 2)
                    }),
                    new LayerGroup({
                        title: 'Non Existent',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: poleChamberClosure('Survey Structure', 3)
                    }),
                    new LayerGroup({
                        title: 'New Asset',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: poleChamberClosure('Survey Structure', 4)
                    }),

                ]
            }),

            /* SURVEY / SURVEY ROUTE */
            new LayerGroup({
                title: 'Survey Route',
                fold: "close",
                zIndex: 9999,
                layers: [
                    new LayerGroup({
                        title: 'Relocate Asset',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: ductCableRope('Survey Route', 1)
                    }),
                    new LayerGroup({
                        title: 'Missing Inventory',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: ductCableRope('Survey Route', 2)
                    }),
                    new LayerGroup({
                        title: 'Non Existent',
                        visible: false,
                        fold: "close",
                        zIndex: 9899,
                        layers: ductCableRope('Survey Route', 3)
                    }),

                ]
            })

        ]
    }),

    /* ODIN  ************************/
    new LayerGroup({
        title: 'Odin',
        fold: "close",
        zIndex: 9999,
        layers: [

            /* ODIN / ADDRESSES BY L4 STATUS */
            new LayerGroup({
                title: 'Addresses by L4 Status',
                fold: "close",
                layers: [

                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Addresses by L4 Status',
                                'FILTER': `Addresses by L4 Status:NOT "l4_p_status" = 2 AND NOT "l4_p_status" = 3 AND NOT "l4_p_status" = 4 AND NOT "l4_p_status" = 5 AND NOT "l4_p_status" = 6 AND NOT "l4_p_status" = 7 AND NOT "l4_p_status" = 8`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Backlog',
                        visible: false,
                    }),

                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Addresses by L4 Status',
                                'FILTER': `Addresses by L4 Status:"l4_p_status" = 2 OR "l4_p_status" = 3`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'In planning',
                        visible: false,
                    }),

                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Addresses by L4 Status',
                                'FILTER': `Addresses by L4 Status:"l4_p_status" = 4 OR "l4_p_status" = 5`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Planned',
                        visible: false,
                    }),

                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Addresses by L4 Status',
                                'FILTER': `Addresses by L4 Status:"l4_p_status" = 6`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'In Progress',
                        visible: false,
                    }),

                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Addresses by L4 Status',
                                'FILTER': `Addresses by L4 Status:"l4_p_status" = 7`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Build Done',
                        visible: false,
                    }),

                    new ImageLayer({
                        zIndex: 9899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': 'Addresses by L4 Status',
                                'FILTER': `Addresses by L4 Status:"l4_p_status" = 8`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Ready for Sale',
                        visible: false,
                    })
                ]
            }),

            /* ODIN / ORDERS VIEW */
            new LayerGroup({
                title: 'Orders View',
                fold: "close",
                layers: [

                    /* ODIN / ORDERS VIEW / LEAD */
                    new LayerGroup({
                        title: 'Lead',
                        fold: "close",
                        layers: [

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'lead' AND "l4_p_status" = 2 OR "address_status" = 'lead' AND "l4_p_status" = 3`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'In Planning',
                                visible: false,
                            }),

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'lead' AND "l4_p_status" = 4 OR "address_status" = 'lead' AND "l4_p_status" = 5`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Planned',
                                visible: false,
                            }),

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'lead' AND "l4_p_status" = 5 OR "address_status" = 'lead' AND "l4_p_status" = 6`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'In Build',
                                visible: false,
                            }),

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'lead' AND "l4_p_status" = 7 OR "address_status" = 'lead' AND "l4_p_status" = 8`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Live',
                                visible: false,
                            })

                        ]
                    }),

                    /* ODIN / ORDERS VIEW / PRE-ORDER */
                    new LayerGroup({
                        title: 'Pre-Order',
                        fold: "close",
                        layers: [

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'pre_order' AND "l4_p_status" = 2 OR "address_status" = 'pre_order' AND "l4_p_status" = 3`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'In Planning',
                                visible: false,
                            }),

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'pre_order' AND "l4_p_status" = 4 OR "address_status" = 'pre_order' AND "l4_p_status" = 5`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Planned',
                                visible: false,
                            }),

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'pre_order' AND "l4_p_status" = 5 OR "address_status" = 'pre_order' AND "l4_p_status" = 6`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'In Build',
                                visible: false,
                            }),

                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'pre_order' AND "l4_p_status" = 7 OR "address_status" = 'pre_order' AND "l4_p_status" = 8`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'Live',
                                visible: false,
                            })

                        ]
                    }),

                    /* ODIN / ORDERS VIEW / INSTALL SCHEDULED */
                    new LayerGroup({
                        title: 'Install Scheduled',
                        fold: "close",
                        layers: [
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'in_progress' AND NOT "l4_p_status" = 7 OR "address_status" = 'in_progress' AND NOT "l4_p_status" = 8`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'L4 Not Live',
                                visible: false,
                            }),
                        ]
                    }),

                    /* ODIN / ORDERS VIEW / ACTIVE */
                    new LayerGroup({
                        title: 'Active',
                        fold: "close",
                        layers: [
                            new ImageLayer({
                                zIndex: 9899,
                                source: new ImageWMS({
                                    url: REACT_APP_QGIS_SERVER_URL,
                                    params: {
                                        'LAYERS': 'Orders View',
                                        'FILTER': `Orders View:"address_status" = 'active' AND NOT "l4_p_status" = 7 OR "address_status" = 'active' AND NOT "l4_p_status" = 8`,
                                    },
                                    ratio: 1,
                                    serverType: 'qgis',
                                }),
                                title: 'L4 Not Live',
                                visible: false,
                            }),
                        ]
                    }),

                ]
            }),

        ]
    }),

    /* OS  **************************/
    new LayerGroup({
        title: 'OS',
        fold: "close",
        zIndex: 5999,
        layers: [
            new ImageLayer({
                zIndex: 5999,
                source: new ImageWMS({
                    url: REACT_APP_QGIS_SERVER_URL,
                    params: {'LAYERS': ['boundaryline']},
                    ratio: 1,
                    serverType: 'qgis',
                }),
                title: 'boundaryline',
                visible: false,
            }),
            new LayerGroup({
                zIndex: 5899,
                title: 'ab_plus',
                layers: [
                    new ImageLayer({
                        zIndex: 5899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['ab_plus'],
                                'FILTER': `ab_plus:"class_1" = 'C'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'C',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 5899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['ab_plus'],
                                'FILTER': `ab_plus:"class_1" = 'R'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'R',
                        visible: false,
                    }),
                    new ImageLayer({
                        zIndex: 5899,
                        source: new ImageWMS({
                            url: REACT_APP_QGIS_SERVER_URL,
                            params: {
                                'LAYERS': ['ab_plus'],
                                'FILTER': `ab_plus:"class_1" != 'R' AND != 'C'`,
                            },
                            ratio: 1,
                            serverType: 'qgis',
                        }),
                        title: 'Other',
                        visible: false,
                    })
                ]
            }),
            new ImageLayer({
                zIndex: 5799,
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

    /* BASE MAPS  ********************/
    new LayerGroup({
        title: 'Base maps',
        zIndex: -100,
        fold: "close",
        layers: [
            new TileLayer({
                source: new XYZ({
                    url: 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
                }),
                title: 'Google Roads',
                visible: true,
                zIndex: -100
            }),
            new TileLayer({
                source: new XYZ({
                    url: 'https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
                }),
                title: 'Google Satelite',
                visible: false,
                zIndex: -100
            }),
            new TileLayer({
                source: new XYZ({
                    url: 'https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
                }),
                title: 'Google Hybrid',
                visible: false,
                zIndex: -100
            }),
        ],
    }),

];
