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

module.exports = { fakeDataServiceResult, fakeMapServiceResult, featureResults, datas, datasources, datasets, queryResults };