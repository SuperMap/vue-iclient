const fakeDataServiceResult = {
    "result": {
        "currentCount": 1,
        "totalCount": 1,
        "features": {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "SMID": "1",
                        "NAME": "四川省",
                    },
                    "geometry": {
                        "type": "MultiPolygon",
                        "coordinates": [
                            [
                                [
                                    [
                                        101.84004968,
                                        26.0859968692659
                                    ],

                                    [
                                        101.95654423,
                                        26.0888446242659
                                    ],
                                    [
                                        101.84004968,
                                        26.0859968692659
                                    ]
                                ]
                            ]
                        ]
                    },
                }
            ]
        }
    }
};



const fakeMapServiceResult = {
    "result": {
        "recordsets": [
            {
                "datasetName": "Capitals@World#1",
                "features": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {
                                "SMID": "1",
                                "NAME": "四川省",
                            },
                            "geometry": {
                                "type": "MultiPolygon",
                                "coordinates": [
                                    [
                                        [
                                            [
                                                101.84004968,
                                                26.0859968692659
                                            ],

                                            [
                                                101.95654423,
                                                26.0888446242659
                                            ],
                                            [
                                                101.84004968,
                                                26.0859968692659
                                            ]
                                        ]
                                    ]
                                ]
                            },
                        }
                    ],
                    "fieldCaptions": [
                        "SmID",
                        "SmX",
                        "SmY"
                    ],
                    "fieldTypes": [
                        "INT32",
                        "DOUBLE",
                        "DOUBLE"
                    ],
                    "fields": [
                        "SmID",
                        "SmX",
                        "SmY"
                    ]
                }
            }
        ],
        "totalCount": 1,
        "currentCount": 1,
        "customResponse": null
    }
};

const featureResults = {
    "features": [
        {
            "stringID": null,
            "fieldNames": [
                "SMID",
                "NAME"
            ],
            "geometry": {
                "center": {
                    "x": 102.815664598142,
                    "y": 30.1731543892007
                },
                "parts": [
                    3
                ],
                "style": null,
                "prjCoordSys": null,
                "id": 1,
                "type": "REGION",
                "partTopo": [
                    1
                ],
                "points": [
                    {
                        "x": 101.84004968,
                        "y": 26.0859968692659
                    },
                    {
                        "x": 101.95654423,
                        "y": 26.0888446242659
                    },
                    {
                        "x": 101.84004968,
                        "y": 26.0859968692659
                    }
                ]
            },
            "fieldValues": [
                "1",
                "四川省"
            ],
            "ID": 1
        }
    ],
    "featureUriList": [],
    "totalCount": 1,
    "featureCount": 1
};

const datas = {
    "dataMetaInfo": null,
    "lastModfiedTime": 1552361419799,
    "fileName": "sichuan(2).geojson",
    "thumbnail": "http://192.168.12.230:8092/services/../web/static/portal/img/map/cloud.png",
    "dataItemServices": [
        {
            "serviceType": "RESTMAP",
            "accessCount": 0,
            "address": "http://192.168.12.230:8095/portalproxy/iserver/services/map_sichuan-2-/rest",
            "dataID": 1962026684,
            "createTime": null,
            "serviceStatus": "PUBLISHED",
            "editable": false,
            "updateTime": null,
            "serviceNode": "z62wol8e",
            "serviceID": "map_sichuan-2-",
            "serviceName": "map_sichuan-2-"
        },
        {
            "serviceType": "RESTDATA",
            "accessCount": 0,
            "address": "http://192.168.12.230:8095/portalproxy/iserver/services/data_sichuan-2-/rest",
            "dataID": 1962026684,
            "createTime": null,
            "serviceStatus": "PUBLISHED",
            "editable": true,
            "updateTime": null,
            "serviceNode": "z62wol8e",
            "serviceID": "data_sichuan-2-",
            "serviceName": "data_sichuan-2-"
        }
    ],
    "dataCheckResult": {
        "serviceCheckInfos": [
            {
                "serviceType": "RESTDATA",
                "checkStatus": "SUCCESS",
                "checkMsg": null,
                "dataType": "GEOJSON",
                "id": 9,
                "MD5": "c1e4a265e355de9a4aa2d5e40612285d"
            },
            {
                "serviceType": "RESTMAP",
                "checkStatus": "SUCCESS",
                "checkMsg": null,
                "dataType": "GEOJSON",
                "id": 35,
                "MD5": "c1e4a265e355de9a4aa2d5e40612285d"
            }
        ],
        "dataCheckInfo": {
            "checkStatus": "SUCCESS",
            "checkMsg": null,
            "dataType": "GEOJSON",
            "id": 9,
            "MD5": "c1e4a265e355de9a4aa2d5e40612285d"
        }
    },
    "publishInfo": null,
    "authorizeSetting": [
        {
            "aliasName": null,
            "entityRoles": null,
            "entityType": "USER",
            "entityName": "admin_123",
            "dataPermissionType": "DELETE",
            "entityId": null
        },
        {
            "aliasName": "GUEST",
            "entityRoles": null,
            "entityType": "USER",
            "entityName": "GUEST",
            "dataPermissionType": "DOWNLOAD",
            "entityId": null
        }
    ],
    "description": null,
    "userName": "admin_123",
    "type": "GEOJSON",
    "tags": [
        "用户数据"
    ],
    "coordType": null,
    "size": 7490,
    "createTime": 1552361419799,
    "serviceStatus": "PUBLISHED",
    "nickname": null,
    "id": 1962026684,
    "serviceId": null,
    "downloadCount": 0,
    "storageId": "2ari8ma4_gjd5mitu_2922171f_4f32_4c99_914b_2bbf258387e8",
    "status": "OK",
    "MD5": "c1e4a265e355de9a4aa2d5e40612285d"
};


const datas_mapjson={
    "extent": {
        "leftBottom": {
            "x": -20037508.3427892,
            "y": -20037508.3427891
        },
        "rightTop": {
            "x": 20037508.3427892,
            "y": 20037508.3427891
        }
    },
    "level": 5,
    "center": {
        "x": 11810617.9363554,
        "y": 4275239.3340175
    },
    "baseLayer": {
        "layerType": "TILE",
        "name": "China",
        "url": "http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China"
    },
    "layers": [
        {
            "layerType": "UNIQUE",
            "visible": true,
            "themeSetting": {
                "themeField": "2016起降架次（架次）",
                "customSettings": {},
                "colors": [
                    "#D53E4F",
                    "#FC8D59",
                    "#FEE08B",
                    "#FFFFBF",
                    "#E6F598",
                    "#99D594",
                    "#3288BD"
                ]
            },
            "name": "民航数",
            "featureType": "POINT",
            "style": {
                "strokeWidth": 1,
                "fillColor": "#3288bd",
                "fillOpacity": 0.9,
                "radius": 7,
                "strokeColor": "#ffffff",
                "type": "BASIC_POINT",
                "strokeOpacity": 1
            },
            "projection": "EPSG:4326",
            "enableFields": [
                "机场",
                "X坐标",
                "Y坐标",
                "名次",
                "2017旅客吞吐量（人次）",
                "2016旅客吞吐量（人次）",
                "同比增速%",
                "2017货邮吞吐量（吨）",
                "2016货邮吞吐量（吨）",
                "2017起降架次（架次）",
                "2016起降架次（架次）"
            ],
            "dataSource": {
                "type": "PORTAL_DATA",
                "serverId": "1920557079"
            }
        }
    ],
    "description": "",
    "projection": "EPSG:3857",
    "title": "unique_民航数据",
    "version": "1.0"
};
const datasources = {
    "datasourceNames": [
        "supermap1_pg"
    ],
    "childUriList": [
        "http://192.168.12.230:8095/portalproxy/iserver/services/data_sichuan-2-/rest/data/datasources/name/supermap1_pg"
    ],
    "datasourceCount": 1
}

const datasets = {
    "datasetCount": 1,
    "datasetNames": [
        "dataGeoJson_509705538"
    ],
    "childUriList": [
        "http://192.168.12.230:8095/portalproxy/iserver/services/data_sichuan-2-/rest/data/datasources/supermap1_pg/datasets/dataGeoJson_509705538"
    ]
};

const queryResults = {
    "recordsets": [
        {
            "datasetName": "Capitals@World#1",
            "features": [
                {
                    "fieldNames": [
                        "SmID",
                        "SmX",
                        "SmY"
                    ],
                    "ID": 1,
                    "fieldValues": [
                        "1",
                        "-47.8977476573595",
                        "-15.792110943058866",
                    ],
                    "geometry": {
                        "id": 1,
                        "center": {
                            "y": -15.7921109430589,
                            "x": -47.8977476573595
                        },
                        "style": null,
                        "parts": [
                            1
                        ],
                        "partTopo": [],
                        "points": [
                            {
                                "y": -15.7921109430589,
                                "x": -47.8977476573595
                            }
                        ],
                        "type": "POINT"
                    }
                }
            ],
            "fieldCaptions": [
                "SmID",
                "SmX",
                "SmY"
            ],
            "fieldTypes": [
                "INT32",
                "DOUBLE",
                "DOUBLE"
            ],
            "fields": [
                "SmID",
                "SmX",
                "SmY"
            ]
        }
    ],
    "totalCount": 1,
    "currentCount": 1,
    "customResponse": null
};

const fakeLandUse = {
    "childUriList": [
        "http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R/fields",
        "http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R/features",
        "http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R/domain"
    ],
    "supportAttachments": true,
    "supportFeatureMetadatas": false,
    "datasetInfo": {
        "charset": "GB18030",
        "recordCount": 101,
        "isFileCache": false,
        "description": "",
        "type": "REGION",
        "dataSourceName": "Jingjin",
        "tableName": "Landuse_R",
        "isReadOnly": false,
        "encodeType": "NONE",
        "bounds": {
            "top": 41.0405421705869,
            "left": 115.438731076072,
            "bottom": 38.5673427409879,
            "leftBottom": {
                "x": 115.438731076072,
                "y": 38.5673427409879
            },
            "right": 118.071395439998,
            "rightTop": {
                "x": 118.071395439998,
                "y": 41.0405421705869
            }
        },
        "name": "Landuse_R",
        "prjCoordSys": {
            "distanceUnit": "METER",
            "projectionParam": null,
            "epsgCode": 4326,
            "coordUnit": "DEGREE",
            "name": "Longitude / Latitude Coordinate System---GCS_WGS_1984",
            "projection": null,
            "type": "PCS_EARTH_LONGITUDE_LATITUDE",
            "coordSystem": {
                "datum": {
                    "name": "D_WGS_1984",
                    "type": "DATUM_WGS_1984",
                    "spheroid": {
                        "flatten": 0.00335281066474748,
                        "name": "WGS_1984",
                        "axis": 6378137,
                        "type": "SPHEROID_WGS_1984"
                    }
                },
                "unit": "DEGREE",
                "spatialRefType": "SPATIALREF_EARTH_LONGITUDE_LATITUDE",
                "name": "GCS_WGS_1984",
                "type": "GCS_WGS_1984",
                "primeMeridian": {
                    "longitudeValue": 0,
                    "name": "Greenwich",
                    "type": "PRIMEMERIDIAN_GREENWICH"
                }
            }
        },
        "datasourceConnectionInfo": null
    }
}

const chartResult = {
    "features": {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "SMID": "1",
                    "SMSDRIW": "116.38831",
                    "SMSDRIN": "40.980675",
                    "SMSDRIE": "116.60729",
                    "SMSDRIS": "40.803284",
                    "SMUSERID": "4",
                    "SMAREA": "1.3188454380984211E8",
                    "SMPERIMETER": "79616.58012922351",
                    "SMGEOMETRYSIZE": "588",
                    "LANDTYPE": "用材林",
                    "AREA": "132.0",
                    "AREA_1": "132",
                    "stringID": null,
                    "ID": 1
                },
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [
                            [
                                [
                                    116.452409755349,
                                    40.92656164358
                                ],
                                [
                                    116.483357386004,
                                    40.9069469918439
                                ],

                                [
                                    116.442423257771,
                                    40.9417511118507
                                ],
                                [
                                    116.452409755349,
                                    40.92656164358
                                ]
                            ]
                        ],
                        [
                            [
                                [
                                    116.560117987415,
                                    40.9749988417875
                                ],

                                [
                                    116.547892153981,
                                    40.9705907375336
                                ],
                                [
                                    116.552270926448,
                                    40.980672910927
                                ],
                                [
                                    116.560117987415,
                                    40.9749988417875
                                ]
                            ]
                        ]
                    ]
                },
                "id": 1
            },
            {
                "type": "Feature",
                "properties": {
                    "SMID": "2",
                    "SMSDRIW": "116.60084",
                    "SMSDRIN": "41.040543",
                    "SMSDRIE": "116.72102",
                    "SMSDRIS": "40.853382",
                    "SMUSERID": "4",
                    "SMAREA": "9.680888002534656E7",
                    "SMPERIMETER": "50298.305148811625",
                    "SMGEOMETRYSIZE": "360",
                    "LANDTYPE": "用材林",
                    "AREA": "97.0",
                    "AREA_1": "97",
                    "stringID": null,
                    "ID": 2
                },
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [
                            [
                                [
                                    116.656010024549,
                                    41.036635850958
                                ],

                                [
                                    116.656010024549,
                                    41.036635850958
                                ]
                            ]
                        ]
                    ]
                },
                "id": 2
            },


            {
                "type": "Feature",
                "properties": {
                    "SMID": "101",
                    "SMSDRIW": "117.33055",
                    "SMSDRIN": "38.620922",
                    "SMSDRIE": "117.53431",
                    "SMSDRIS": "38.56734",
                    "SMUSERID": "9",
                    "SMAREA": "4.042988389975608E7",
                    "SMPERIMETER": "39763.54581827346",
                    "SMGEOMETRYSIZE": "264",
                    "LANDTYPE": "水浇地",
                    "AREA": "40.0",
                    "AREA_1": "40",
                    "stringID": null,
                    "ID": 101
                },
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [
                            [
                                [
                                    117.525891381017,
                                    38.6144829360722
                                ],

                                [
                                    117.525891381017,
                                    38.6144829360722
                                ]
                            ]
                        ]
                    ]
                },
                "id": 101
            }
        ]
    },
    "featureUriList": [],
    "totalCount": 3,
    "featureCount": 3,
    "succeed": true
};

const datas_chart = {
    "dataMetaInfo": {
        "firstRowIsHead": false,
        "previewURL": null,
        "fileEncoding": "UTF-8",
        "proxiedServiceType": null,
        "hasScene": false,
        "xIndex": null,
        "yField": null,
        "yIndex": null,
        "separator": null,
        "url": null,
        "baseLayerType": null,
        "xField": null,
        "epsgCode": 0,
        "realspaceType": null,
        "releaseTimeMilli": 0,
        "fieldTypes": null,
        "bounds": null,
        "proxiedServiceUrl": null,
        "providers": null
    },
    "lastModfiedTime": 1525947856586,
    "fileName": "671个气象站观测数据(5).xlsx",
    "thumbnail": "http://support.supermap.com.cn:8092/services/../web/static/portal/img/map/cloud.png",
    "dataItemServices": [],
    "dataCheckResult": {
        "serviceCheckInfos": [],
        "dataCheckInfo": null
    },
    "publishInfo": null,
    "authorizeSetting": [
        {
            "aliasName": "supermap",
            "entityRoles": null,
            "entityType": "USER",
            "entityName": "supermap",
            "dataPermissionType": "DELETE",
            "entityId": null
        },
        {
            "aliasName": "GUEST",
            "entityRoles": null,
            "entityType": "USER",
            "entityName": "GUEST",
            "dataPermissionType": "DOWNLOAD",
            "entityId": null
        }
    ],
    "description": null,
    "userName": "supermap",
    "type": "EXCEL",
    "tags": [],
    "coordType": null,
    "size": 57719,
    "createTime": 1525947856586,
    "serviceStatus": "UNPUBLISHED",
    "nickname": "supermap",
    "id": 888186112,
    "serviceId": null,
    "downloadCount": 1,
    "storageId": "hglvnuxh_emz1xllp_5d982d0d_29f0_4ade_96d3_ba8b8d127f74",
    "status": "OK",
    "MD5": "b77a03f565df9b17a5bfea85c7ce5d54"
}

const iportal_content={
    "fileName": "671个气象站观测数据(5).xlsx",
    "type": "EXCEL",
    "lineNumber": 589,
    "content": {
        "colTitles": [
            "区站号",
            "站台",
            "省份",
            "X",
            "Y",
            "海拔",
            "平均最低气温",
            "最热七天气温",
            "最高气温",
            "最低气温",
            "年均降雨"
        ],
        "rows": [
            [
                "50136",
                "漠河",
                "黑龙江",
                "122.37",
                "53.47",
                "296",
                "-47",
                "29",
                "33",
                "-53",
                "366.1"
            ],
           
            [
                "59446",
                "灵山",
                "广西",
                "109.3",
                "22.42",
                "66",
                "2",
                "35",
                "37",
                "0",
                "1462.4"
            ],
            [
                "59453",
                "玉林",
                "广西",
                "110.17",
                "22.65",
                "81.8",
                "3",
                "35",
                "37",
                "1",
                "1637.4"
            ]
         
        ]
    }
}
module.exports = { fakeDataServiceResult, fakeMapServiceResult, featureResults, datas, datasources, datasets, queryResults, fakeLandUse, chartResult, datas_chart,iportal_content ,datas_mapjson};