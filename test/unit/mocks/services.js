import airport from './data/airport.json';
const fakeDataServiceResult = {
  result: {
    currentCount: 1,
    totalCount: 1,
    features: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            SMID: '1',
            NAME: '四川省'
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [101.84004968, 26.0859968692659],

                  [101.95654423, 26.0888446242659],
                  [101.84004968, 26.0859968692659]
                ]
              ]
            ]
          }
        }
      ]
    }
  }
};
// const fakeDataServiceResult =
// {'queryMode':'SpatialQuery','queryParameters':{'customParams':null,'prjCoordSys':null,'expectCount':20,'networkType':"LINE",'queryOption':"ATTRIBUTEANDGEOMETRY",'queryParams':[{'name':"Capitals@World.1",'attributeFilter':"SmID%26gt;0"}],'startRecord':0,'holdTime':10,'returnCustomResult':false,'returnFeatureWithFieldCaption':false},'geometry':{'id':0,'style':null,'parts':[5],'points':[{'id':"SuperMap.Geometry_7",'bounds':null,'SRID':null,'x':88.78538087499851,'y':21.676702703064578,'tag':null,'type':"Point",'geometryType':"Point"},{'id':"SuperMap.Geometry_8",'bounds':null,'SRID':null,'x':119.89866212499828,'y':21.676702703064578,'tag':null,'type':"Point",'geometryType':"Point"},{'id':"SuperMap.Geometry_9",'bounds':null,'SRID':null,'x':119.89866212499828,'y':49.737884922662886,'tag':null,'type':"Point",'geometryType':"Point"},{'id':"SuperMap.Geometry_10",'bounds':null,'SRID':null,'x':88.78538087499851,'y':49.737884922662886,'tag':null,'type':"Point",'geometryType':"Point"},{'id':"SuperMap.Geometry_11",'bounds':null,'SRID':null,'x':88.78538087499851,'y':21.676702703064578,'tag':null,'type':"Point",'geometryType':"Point"}],'type':"REGION",'prjCoordSys':{'epsgCode':null}},'spatialQueryMode':"INTERSECT"};

const fakeAddressMatch = {
  result: [
    {
      score: 80,
      address: '北京市海淀区中关村大街59号中国人民大学',
      location: {
        x: 116.318029039223,
        y: 39.969365325535
      },
      filters: ['北京市', '海淀区']
    }
  ]
};

const fakeMapServiceResult = {
  result: {
    recordsets: [
      {
        datasetName: 'Capitals@World#1',
        features: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                SMID: '1',
                NAME: '四川省'
              },
              geometry: {
                type: 'MultiPolygon',
                coordinates: [
                  [
                    [
                      [101.84004968, 26.0859968692659],

                      [101.95654423, 26.0888446242659],
                      [101.84004968, 26.0859968692659]
                    ]
                  ]
                ]
              }
            }
          ]
        },
        fieldCaptions: [
          'SmID',
          'SmX',
          'SmY',
          'SmLibTileID',
          'SmUserID',
          'SmGeometrySize',
          'USERID',
          'POP',
          'CAPITAL_LO',
          'CAPITAL_CH',
          'COUNTRY_CH',
          'CAPITAL_EN',
          'COUNTRY_EN',
          'COUNTRY',
          'CAP_POP',
          'CAPITAL'
        ],
        fieldTypes: [
          'INT32',
          'DOUBLE',
          'DOUBLE',
          'INT32',
          'INT32',
          'INT32',
          'INT32',
          'DOUBLE',
          'WTEXT',
          'WTEXT',
          'WTEXT',
          'WTEXT',
          'WTEXT',
          'WTEXT',
          'DOUBLE',
          'WTEXT'
        ],
        fields: [
          'SmID',
          'SmX',
          'SmY',
          'SmLibTileID',
          'SmUserID',
          'SmGeometrySize',
          'USERID',
          'POP',
          'CAPITAL_LO',
          'CAPITAL_CH',
          'COUNTRY_CH',
          'CAPITAL_EN',
          'COUNTRY_EN',
          'COUNTRY',
          'CAP_POP',
          'CAPITAL'
        ]
      }
    ],
    totalCount: 1,
    currentCount: 1,
    customResponse: null,
    succeed: true
  }
};

const featureResults = {
  features: [
    {
      stringID: null,
      fieldNames: ['SMID', 'NAME'],
      geometry: {
        center: {
          x: 102.815664598142,
          y: 30.1731543892007
        },
        parts: [3],
        style: null,
        prjCoordSys: null,
        id: 1,
        type: 'REGION',
        partTopo: [1],
        points: [
          {
            x: 101.84004968,
            y: 26.0859968692659
          },
          {
            x: 101.95654423,
            y: 26.0888446242659
          },
          {
            x: 101.84004968,
            y: 26.0859968692659
          }
        ]
      },
      fieldValues: ['1', '四川省'],
      ID: 1
    }
  ],
  featureUriList: [],
  totalCount: 1,
  featureCount: 1
};

const datas = {
  dataMetaInfo: null,
  lastModfiedTime: 1552361419799,
  fileName: 'sichuan(2).geojson',
  thumbnail: 'http://192.168.12.230:8092/services/../web/static/portal/img/map/cloud.png',
  dataItemServices: [
    {
      serviceType: 'RESTMAP',
      accessCount: 0,
      address: 'http://192.168.12.230:8095/portalproxy/iserver/services/map_sichuan-2-/rest',
      dataID: 1962026684,
      createTime: null,
      serviceStatus: 'PUBLISHED',
      editable: false,
      updateTime: null,
      serviceNode: 'z62wol8e',
      serviceID: 'map_sichuan-2-',
      serviceName: 'map_sichuan-2-'
    },
    {
      serviceType: 'RESTDATA',
      accessCount: 0,
      address: 'http://192.168.12.230:8095/portalproxy/iserver/services/data_sichuan-2-/rest',
      dataID: 1962026684,
      createTime: null,
      serviceStatus: 'PUBLISHED',
      editable: true,
      updateTime: null,
      serviceNode: 'z62wol8e',
      serviceID: 'data_sichuan-2-',
      serviceName: 'data_sichuan-2-'
    }
  ],
  dataCheckResult: {
    serviceCheckInfos: [
      {
        serviceType: 'RESTDATA',
        checkStatus: 'SUCCESS',
        checkMsg: null,
        dataType: 'GEOJSON',
        id: 9,
        MD5: 'c1e4a265e355de9a4aa2d5e40612285d'
      },
      {
        serviceType: 'RESTMAP',
        checkStatus: 'SUCCESS',
        checkMsg: null,
        dataType: 'GEOJSON',
        id: 35,
        MD5: 'c1e4a265e355de9a4aa2d5e40612285d'
      }
    ],
    dataCheckInfo: {
      checkStatus: 'SUCCESS',
      checkMsg: null,
      dataType: 'GEOJSON',
      id: 9,
      MD5: 'c1e4a265e355de9a4aa2d5e40612285d'
    }
  },
  publishInfo: null,
  authorizeSetting: [
    {
      aliasName: null,
      entityRoles: null,
      entityType: 'USER',
      entityName: 'admin_123',
      dataPermissionType: 'DELETE',
      entityId: null
    },
    {
      aliasName: 'GUEST',
      entityRoles: null,
      entityType: 'USER',
      entityName: 'GUEST',
      dataPermissionType: 'DOWNLOAD',
      entityId: null
    }
  ],
  description: null,
  userName: 'admin_123',
  type: 'GEOJSON',
  tags: ['用户数据'],
  coordType: null,
  size: 7490,
  createTime: 1552361419799,
  serviceStatus: 'PUBLISHED',
  nickname: null,
  id: 1962026684,
  serviceId: null,
  downloadCount: 0,
  storageId: '2ari8ma4_gjd5mitu_2922171f_4f32_4c99_914b_2bbf258387e8',
  status: 'OK',
  MD5: 'c1e4a265e355de9a4aa2d5e40612285d'
};

const datas_mapjson = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427891
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427891
    }
  },
  level: 5,
  center: {
    x: 11810617.9363554,
    y: 4275239.3340175
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
  },
  layers: [
    {
      layerType: 'UNIQUE',
      visible: true,
      themeSetting: {
        themeField: '2016起降架次（架次）',
        customSettings: {},
        colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
      },
      name: '民航数',
      featureType: 'POINT',
      style: {
        strokeWidth: 1,
        fillColor: '#3288bd',
        fillOpacity: 0.9,
        radius: 7,
        strokeColor: '#ffffff',
        type: 'BASIC_POINT',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: [
        '机场',
        'X坐标',
        'Y坐标',
        '名次',
        '2017旅客吞吐量（人次）',
        '2016旅客吞吐量（人次）',
        '同比增速%',
        '2017货邮吞吐量（吨）',
        '2016货邮吞吐量（吨）',
        '2017起降架次（架次）',
        '2016起降架次（架次）'
      ],
      dataSource: {
        type: 'PORTAL_DATA',
        serverId: '1920557079'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  title: 'unique_民航数据',
  version: '1.0'
};
const webmap_markerLayer = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427891
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427891
    }
  },
  level: 5,
  center: {
    x: 11810617.9363554,
    y: 4275239.3340175
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
  },
  layers: [
    {
      layerType: 'MARKER',
      visible: true,
      name: '民航数',
      serverId: 123456
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  title: 'unique_民航数据',
  version: '1.0'
};

const webmap_heatLayer = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427891
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427891
    }
  },
  level: 5,
  center: {
    x: 11810617.9363554,
    y: 4275239.3340175
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
  },
  layers: [
    {
      layerType: 'HEAT',
      visible: true,
      name: '民航数',
      featureType: 'POINT',
      themeSetting: {
        "customSettings": {},
        "radius": 10,
        "colors": [
          "#0000ff",
          "#00ffff",
          "#00ff00",
          "#ffff00",
          "#ff0000"
        ]
      },
      dataSource: {
        type: 'PORTAL_DATA',
        serverId: '1920557079'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  title: 'unique_民航数据',
  version: '1.0'
};

const webmap_vectorLayer_point = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427891
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427891
    }
  },
  level: 5,
  center: {
    x: 11810617.9363554,
    y: 4275239.3340175
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
  },
  layers: [{
    layerType: "VECTOR",
    name: "浙江省高等院校(3)",
    visible: true,
    featureType: "POINT",
    style: {
      radius: 6,
      fillColor: "#ff0000",
      fillOpacity: 0.9,
      strokeColor: "#ffffff",
      strokeWidth: 1,
      strokeOpacity: 1,
      lineDash: "solid",
      symbolType: "svg",
      type: "BASIC_POINT"
    },
    dataSource: {
      type: "PORTAL_DATA",
      serverId: '1920557079'
    }
  }],
  description: '',
  projection: 'EPSG:3857',
  title: 'unique_民航数据',
  version: '1.0'
};

const webmap_vectorLayer_line = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427891
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427891
    }
  },
  level: 5,
  center: {
    x: 11810617.9363554,
    y: 4275239.3340175
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
  },
    layers: [{
    layerType: "VECTOR",
    name: "浙江省高等院校(3)",
    visible: true,
    featureType: "LINE",
    style: {
      radius: 5,
      fillColor: "#ee4d5a",
      fillOpacity: 0.9,
      strokeColor: "#8b572a",
      strokeWidth: 7,
      strokeOpacity: 1,
      lineDash: "solid",
      type: "BASIC_POINT"
    },
    dataSource: {
      type: "PORTAL_DATA",
      serverId: '1920557079'
    }
  }],
  description: '',
  projection: 'EPSG:3857',
  title: 'unique_民航数据',
  version: '1.0'
};

const datasources = {
  datasourceNames: ['supermap1_pg'],
  childUriList: [
    'http://192.168.12.230:8095/portalproxy/iserver/services/data_sichuan-2-/rest/data/datasources/name/supermap1_pg'
  ],
  datasourceCount: 1
};

const datasets = {
  datasetCount: 1,
  datasetNames: ['dataGeoJson_509705538'],
  childUriList: [
    'http://192.168.12.230:8095/portalproxy/iserver/services/data_sichuan-2-/rest/data/datasources/supermap1_pg/datasets/dataGeoJson_509705538'
  ]
};

const queryResults = {
  recordsets: [
    {
      datasetName: 'Capitals@World#1',
      features: [
        {
          fieldNames: ['SmID', 'SmX', 'SmY'],
          ID: 1,
          fieldValues: ['1', '-47.8977476573595', '-15.792110943058866'],
          geometry: {
            id: 1,
            center: {
              y: -15.7921109430589,
              x: -47.8977476573595
            },
            style: null,
            parts: [1],
            partTopo: [],
            points: [
              {
                y: -15.7921109430589,
                x: -47.8977476573595
              }
            ],
            type: 'POINT'
          }
        }
      ],
      fieldCaptions: ['SmID', 'SmX', 'SmY'],
      fieldTypes: ['INT32', 'DOUBLE', 'DOUBLE'],
      fields: ['SmID', 'SmX', 'SmY']
    }
  ],
  totalCount: 1,
  currentCount: 1,
  customResponse: null
};

const fakeLandUse = {
  childUriList: [
    'http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R/fields',
    'http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R/features',
    'http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R/domain'
  ],
  supportAttachments: true,
  supportFeatureMetadatas: false,
  datasetInfo: {
    charset: 'GB18030',
    recordCount: 101,
    isFileCache: false,
    description: '',
    type: 'REGION',
    dataSourceName: 'Jingjin',
    tableName: 'Landuse_R',
    isReadOnly: false,
    encodeType: 'NONE',
    bounds: {
      top: 41.0405421705869,
      left: 115.438731076072,
      bottom: 38.5673427409879,
      leftBottom: {
        x: 115.438731076072,
        y: 38.5673427409879
      },
      right: 118.071395439998,
      rightTop: {
        x: 118.071395439998,
        y: 41.0405421705869
      }
    },
    name: 'Landuse_R',
    prjCoordSys: {
      distanceUnit: 'METER',
      projectionParam: null,
      epsgCode: 4326,
      coordUnit: 'DEGREE',
      name: 'Longitude / Latitude Coordinate System---GCS_WGS_1984',
      projection: null,
      type: 'PCS_EARTH_LONGITUDE_LATITUDE',
      coordSystem: {
        datum: {
          name: 'D_WGS_1984',
          type: 'DATUM_WGS_1984',
          spheroid: {
            flatten: 0.00335281066474748,
            name: 'WGS_1984',
            axis: 6378137,
            type: 'SPHEROID_WGS_1984'
          }
        },
        unit: 'DEGREE',
        spatialRefType: 'SPATIALREF_EARTH_LONGITUDE_LATITUDE',
        name: 'GCS_WGS_1984',
        type: 'GCS_WGS_1984',
        primeMeridian: {
          longitudeValue: 0,
          name: 'Greenwich',
          type: 'PRIMEMERIDIAN_GREENWICH'
        }
      }
    },
    datasourceConnectionInfo: null
  }
};

const chartResult = {
  features: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          SMID: '1',
          SMSDRIW: '116.38831',
          SMSDRIN: '40.980675',
          SMSDRIE: '116.60729',
          SMSDRIS: '40.803284',
          SMUSERID: '4',
          SMAREA: '1.3188454380984211E8',
          SMPERIMETER: '79616.58012922351',
          SMGEOMETRYSIZE: '588',
          LANDTYPE: '用材林',
          AREA: '132.0',
          AREA_1: '132',
          stringID: null,
          ID: 1
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [116.452409755349, 40.92656164358],
                [116.483357386004, 40.9069469918439],

                [116.442423257771, 40.9417511118507],
                [116.452409755349, 40.92656164358]
              ]
            ],
            [
              [
                [116.560117987415, 40.9749988417875],

                [116.547892153981, 40.9705907375336],
                [116.552270926448, 40.980672910927],
                [116.560117987415, 40.9749988417875]
              ]
            ]
          ]
        },
        id: 1
      },
      {
        type: 'Feature',
        properties: {
          SMID: '2',
          SMSDRIW: '116.60084',
          SMSDRIN: '41.040543',
          SMSDRIE: '116.72102',
          SMSDRIS: '40.853382',
          SMUSERID: '4',
          SMAREA: '9.680888002534656E7',
          SMPERIMETER: '50298.305148811625',
          SMGEOMETRYSIZE: '360',
          LANDTYPE: '用材林',
          AREA: '97.0',
          AREA_1: '97',
          stringID: null,
          ID: 2
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [116.656010024549, 41.036635850958],

                [116.656010024549, 41.036635850958]
              ]
            ]
          ]
        },
        id: 2
      },

      {
        type: 'Feature',
        properties: {
          SMID: '101',
          SMSDRIW: '117.33055',
          SMSDRIN: '38.620922',
          SMSDRIE: '117.53431',
          SMSDRIS: '38.56734',
          SMUSERID: '9',
          SMAREA: '4.042988389975608E7',
          SMPERIMETER: '39763.54581827346',
          SMGEOMETRYSIZE: '264',
          LANDTYPE: '水浇地',
          AREA: '40.0',
          AREA_1: '40',
          stringID: null,
          ID: 101
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [117.525891381017, 38.6144829360722],

                [117.525891381017, 38.6144829360722]
              ]
            ]
          ]
        },
        id: 101
      }
    ]
  },
  featureUriList: [],
  totalCount: 3,
  featureCount: 3,
  succeed: true
};

const iportal_content = {
  fileName: '民航数据1(1).csv',
  type: 'CSV',
  lineNumber: 222,
  content: airport
};

const localSearch = {
  totalHits: 1,
  poiInfos: [
    {
      uid: '1f062db5bf2e12b5b04c49e6',
      score: 0,
      address: null,
      name: '北京市',
      telephone: null,
      location: { x: 116.40699419088875, y: 39.90459558586809 }
    }
  ]
};

const portal_data1 = {
  shareSetting: { scope: { toUser: true, toDepartment: true, toGroup: true }, allowListUsers: false },
  webPrintingConfig: { webPrintingServiceAvaliable: true },
  mapViewerSetting: { displayCoords: false, displayDataLayers: false, maxFeatures: 3000 },
  dataScienceSetting: { address: null },
  dataCapabilities: { hasHostedServer: true, hasRelationship: false, binaryStorageValid: true },
  registerSetting: {
    allowUserAudit: true,
    sendEmailNotification: false,
    allowDataCenterRole: true,
    extendUserFields: [],
    defaultRole: 'PORTAL_USER',
    reservedUserNames: [],
    allowRegister: false
  },
  keyConfig: { defaultMaxCount: 10000, allowQuotaAudit: false, defaultMaxCountType: 'DAY', userDefaultMaxKeySum: null },
  customDirectorySetting: {
    allowCustomDirectory: '{"DATA":true,"SERVICE":true,"MAP":true,"SCENE":true,"INSIGHTS":false}'
  },
  appsConfig: {
    editableAppsLimitToAdmin: [],
    ROOT_NAME: 'appsConfig',
    newResourceDefaultPermission: [{ permissionType: 'PUBLIC_VIEW', portalAppType: 'DATAVIZ' }]
  },
  version: '1.0.0',
  appCenterConfig: { enableAudit: true, auditAllAttributes: false, auditedAttributes: [] },
  portalCustomSetting: { customType: null, supportMultiLanguages: { languages: null, enable: false } },
  loginSetting: { captchaConfig: { enable: false, expire: 120, length: 4 }, authenticationDelegation: null },
  departmentSetting: { enable: true, order: { orderType: 'ASC', orderField: 'CREATETIME' } },
  serviceProxy: {
    httpConnPoolInfo: null,
    enableAccessStatistics: true,
    scheme: null,
    enableBuiltinProxy: true,
    port: 8095,
    proxyServerRootUrl: 'https://iportal.supermap.io',
    rootUrlPostfix: 'portalproxy',
    enable: true,
    httpsSetting: null,
    cacheConfig: null
  },
  mapApps: { mapApps: [{ name: 'mapViewer_ol5' }] },
  mapsSetting: { allowMapAudit: true, showBatchAddMaps: true, auditedAttributes: 'all' },
  groupSetting: { enable: true },
  serviceAuditSetting: { allowServiceAudit: true, auditedAttributes: 'all' },
  clientSideKeycloakConfig: {
    clientId: null,
    baseUri: 'http://{host}:{port}/auth',
    realm: '{realmName}',
    enabled: false
  }
};

const portal_data = {
  extent: {
    leftBottom: { x: -20037508.342789248, y: -20037508.34278914 },
    rightTop: { x: 20037508.342789244, y: 20037508.342789087 }
  },
  maxScale: '1:144447.927',
  level: 5,
  center: { x: 11615300.701720804, y: 4436879.386230171 },
  baseLayer: {
    layerType: 'TILE',
    visible: true,
    name: 'ChinaDark',
    url: 'https://iserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark'
  },
  layers: [
    {
      layerType: 'UNIQUE',
      visible: true,
      themeSetting: {
        themeField: '名次',
        customSettings: {
          10: '#dc4c50',
          11: '#e05551',
          12: '#e25952',
          13: '#e15752',
          14: '#feeda1',
          15: '#e56053',
          16: '#e45e53',
          17: '#e35b52',
          18: '#e96654',
          19: '#fca769',
          1: '#d53e4f',
          2: '#d6404f',
          3: '#d8444f',
          4: '#db4a50',
          5: '#da4850',
          6: '#d94650',
          7: '#dd4f51',
          8: '#de5151',
          9: '#df5351'
        },
        colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
      },
      name: '民航数据',
      featureType: 'POINT',
      xyField: { xField: 'longitude', yField: 'latitude' },
      style: {
        strokeWidth: 1,
        offsetX: 0,
        fillColor: '#3288bd',
        offsetY: 0,
        fillOpacity: 0.9,
        radius: 8,
        strokeColor: '#ffffff',
        type: 'BASIC_POINT',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: [
        'latitude',
        'longitude',
        'altitude',
        'geometry',
        '机场',
        'X坐标',
        'Y坐标',
        '名次',
        '2017旅客吞吐量（人次）',
        '2016旅客吞吐量（人次）',
        '同比增速%',
        '2017货邮吞吐量（吨）',
        '2016货邮吞吐量（吨）',
        '2017起降架次（架次）',
        '2016起降架次（架次）'
      ],
      dataSource: { accessType: 'DIRECT', type: 'PORTAL_DATA', serverId: '676516522' }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909',
  title: '民航数据-单值',
  version: '2.2.1',
  rootUrl: 'https://iportal.supermap.io/iportal/services/../'
};

const chart_data = {
  fileName: '民航数据1(1).csv',
  type: 'CSV',
  lineNumber: 222,
  content: airport
};

const prj_data = {
  distanceUnit: 'METER',
  projectionParam: null,
  epsgCode: 4326,
  coordUnit: 'DEGREE',
  name: 'GCS_WGS_1984',
  projection: null,
  type: 'PCS_EARTH_LONGITUDE_LATITUDE',
  coordSystem: {
    datum: {
      name: 'D_WGS_1984',
      type: 'DATUM_WGS_1984',
      spheroid: { flatten: 0.0033528106647474805, name: 'WGS_1984', axis: 6378137, type: 'SPHEROID_WGS_1984' }
    },
    unit: 'DEGREE',
    spatialRefType: 'SPATIALREF_EARTH_LONGITUDE_LATITUDE',
    name: 'GCS_WGS_1984',
    type: 'GCS_WGS_1984',
    primeMeridian: { longitudeValue: 0, name: 'Greenwich', type: 'PRIMEMERIDIAN_GREENWICH' }
  }
};

const dataset_data = {
  childUriList: [
    'https://iserver.supermap.io/iserver/services/data-world/rest/data/datasources/World/datasets/Countries/fields',
    'https://iserver.supermap.io/iserver/services/data-world/rest/data/datasources/World/datasets/Countries/features',
    'https://iserver.supermap.io/iserver/services/data-world/rest/data/datasources/World/datasets/Countries/domain'
  ],
  supportAttachments: true,
  supportFeatureMetadatas: false,
  datasetInfo: {
    charset: 'UTF8',
    recordCount: 1889,
    isFileCache: false,
    description: 'NULL',
    type: 'REGION',
    dataSourceName: 'World',
    tableName: 'SMDTV_97',
    isReadOnly: false,
    encodeType: 'NONE',
    bounds: {
      top: 83.62359619140626,
      left: -180,
      bottom: -90,
      leftBottom: { x: -180, y: -90 },
      right: 180,
      rightTop: { x: 180, y: 83.62359619140626 }
    },
    name: 'Countries',
    prjCoordSys: {
      distanceUnit: 'METER',
      projectionParam: null,
      epsgCode: 4326,
      coordUnit: 'DEGREE',
      name: 'Longitude / Latitude Coordinate System---GCS_WGS_1984',
      projection: null,
      type: 'PCS_EARTH_LONGITUDE_LATITUDE',
      coordSystem: {
        datum: {
          name: 'D_WGS_1984',
          type: 'DATUM_WGS_1984',
          spheroid: { flatten: 0.00335281066474748, name: 'WGS_1984', axis: 6378137, type: 'SPHEROID_WGS_1984' }
        },
        unit: 'DEGREE',
        spatialRefType: 'SPATIALREF_EARTH_LONGITUDE_LATITUDE',
        name: 'GCS_WGS_1984',
        type: 'GCS_WGS_1984',
        primeMeridian: { longitudeValue: 0, name: 'Greenwich', type: 'PRIMEMERIDIAN_GREENWICH' }
      }
    },
    datasourceConnectionInfo: null
  }
};

const datas_chart = {
  dataMetaInfo: {
    firstRowIsHead: true,
    previewURL: null,
    fileEncoding: null,
    proxiedServiceType: null,
    hasScene: false,
    xIndex: '1',
    yField: null,
    yIndex: '0',
    separator: ',',
    url: null,
    baseLayerType: null,
    xField: null,
    epsgCode: 0,
    realspaceType: null,
    releaseTimeMilli: 0,
    fieldTypes: [
      'NUMBER',
      'NUMBER',
      'STRING',
      'STRING',
      'STRING',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER',
      'NUMBER'
    ],
    bounds: null,
    proxiedServiceUrl: null,
    providers: null
  },
  lastModfiedTime: 1600534952481,
  fileName: '民航数据1(1).csv',
  thumbnail: 'https://iportal.supermap.io/iportal/services/../web/static/portal/img/map/cloud.png',
  dataItemServices: [],
  dataCheckResult: { serviceCheckInfos: [], dataCheckInfo: null },
  publishInfo: null,
  authorizeSetting: [
    {
      aliasName: 'iclient',
      entityRoles: [],
      entityType: 'USER',
      entityName: 'iclient',
      dataPermissionType: 'DELETE',
      entityId: null
    },
    {
      aliasName: 'GUEST',
      entityRoles: [],
      entityType: 'USER',
      entityName: 'GUEST',
      dataPermissionType: 'DOWNLOAD',
      entityId: null
    }
  ],
  description: null,
  userName: 'iclient',
  type: 'CSV',
  tags: [],
  coordType: null,
  size: 24782,
  createTime: 1595486513403,
  serviceStatus: 'UNPUBLISHED',
  nickname: 'iclient',
  id: 123,
  serviceId: null,
  downloadCount: 19,
  storageId: '7p57k4bl_9dp78ahh_acc2f288_9012_4d12_ae0e_acbe770776c1',
  status: 'OK',
  MD5: '6c28cbde8eaeff1816441f5ac636c1a1'
};

const datas_charts = {
  fileName: '民航数据1(1).csv',
  type: 'CSV',
  lineNumber: 222,
  content: airport
};

const charts_content = {
  fileName: '民航数据CSV',
  type: 'GEOJSON',
  lineNumber: null,
  content:
    '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"机场":"北京/首都","X坐标":"116.588918","Y坐标":"40.071080","名次":"1","2017旅客吞吐量（人次）":"95,786,296","2016旅客吞吐量（人次）":"94,393,454","同比增速%":"-1.5","2017货邮吞吐量（吨）":"2,029,583.6","2016货邮吞吐量（吨）":"1,943,159.7","2017起降架次（架次）":"597,259","2016起降架次（架次）":"606,081"},"geometry":{"type":"Point","coordinates":[116.58891800000002,40.071079999999995]}},{"type":"Feature","properties":{"机场":"上海/浦东","X坐标":"121.812361 ","Y坐标":"31.093992 ","名次":"2","2017旅客吞吐量（人次）":"70,001,237 ","2016旅客吞吐量（人次）":"66,002,414 ","同比增速%":"3.5 ","2017货邮吞吐量（吨）":"3,824,279.9 ","2016货邮吞吐量（吨）":"3,440,279.7 ","2017起降架次（架次）":"496,774 ","2016起降架次（架次）":"479,902 "},"geometry":{"type":"Point","coordinates":[121.812361,31.093992000000014]}}]}'
};

const datas_beijing = {
  type: 'FeatureCollection',
  features: [
    {
      geometry: {
        coordinates: [
          [
            [116.720245265, 39.6245367190853],
            [116.716514385, 39.6241937840854],
            [116.71657379, 39.6229782990854],
            [116.716596995, 39.6225376940854],
            [116.716593475, 39.6222269590853],
            [116.70582801, 39.6187705190854],
            [116.720245265, 39.6245367190853]
          ]
        ],
        type: 'Polygon'
      },
      properties: {
        Field_SmUserID: 0,
        Name: '北京市',
        UserID: 0
      },
      type: 'Feature'
    }
  ]
};
const searchGeocoding = [
  {
    score: 85,
    address: '北京市西城区槐柏树街9号北京小学',
    location: {
      x: 116.360603320322,
      y: 39.89671784607
    },
    filters: ['北京市', '西城区']
  },
  {
    score: 82,
    address: '北京市昌平区回龙观镇农学院社区居委会北京农学院',
    location: {
      x: 116.308601712659,
      y: 40.0932558374159
    },
    filters: ['北京市', '昌平区']
  },
  {
    score: 80,
    address: '北京市顺义区空港开发区裕东路3号北京人文大学',
    location: {
      x: 116.55819420026,
      y: 40.099386412776
    },
    filters: ['北京市', '顺义区']
  },
  {
    score: 80,
    address: '北京市通州区富河大街1号北京物资学院',
    location: {
      x: 116.638298326162,
      y: 39.9277205046446
    },
    filters: ['北京市', '通州区']
  },
  {
    score: 80,
    address: '北京市通州区宋庄镇丛林庄园北京中加学校',
    location: {
      x: 116.693505769065,
      y: 39.9457949533308
    },
    filters: ['北京市', '通州区']
  },
  {
    score: 80,
    address: '北京市通州区马厂97号北京胸科医院',
    location: {
      x: 116.652862974063,
      y: 39.9228297488784
    },
    filters: ['北京市', '通州区']
  }
];
/// web/maps/1649097980/map.json
const search_mapjson = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427891
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427891
    }
  },
  level: 5,
  center: {
    x: 11810617.9363554,
    y: 4275239.3340175
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China'
  },
  layers: [
    {
      layerType: 'UNIQUE',
      visible: true,
      themeSetting: {
        themeField: '2016起降架次（架次）',
        customSettings: {},
        colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
      },
      name: '民航数',
      featureType: 'POINT',
      style: {
        strokeWidth: 1,
        fillColor: '#3288bd',
        fillOpacity: 0.9,
        radius: 7,
        strokeColor: '#ffffff',
        type: 'BASIC_POINT',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: [
        '机场',
        'X坐标',
        'Y坐标',
        '名次',
        '2017旅客吞吐量（人次）',
        '2016旅客吞吐量（人次）',
        '同比增速%',
        '2017货邮吞吐量（吨）',
        '2016货邮吞吐量（吨）',
        '2017起降架次（架次）',
        '2016起降架次（架次）'
      ],
      dataSource: {
        type: 'PORTAL_DATA',
        serverId: '1920557079'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  title: 'unique_民航数据',
  version: '1.0'
};

// search restdata
const fieldsJson = [
  {
    isRequired: true,
    defaultValue: '',
    name: 'SmID',
    caption: 'SmID',
    type: 'INT32',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmSdriW',
    caption: 'SmSdriW',
    type: 'SINGLE',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmSdriN',
    caption: 'SmSdriN',
    type: 'SINGLE',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmSdriE',
    caption: 'SmSdriE',
    type: 'SINGLE',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmSdriS',
    caption: 'SmSdriS',
    type: 'SINGLE',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmUserID',
    caption: 'SmUserID',
    type: 'INT32',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmArea',
    caption: 'SmArea',
    type: 'DOUBLE',
    maxLength: 8,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '0',
    name: 'SmPerimeter',
    caption: 'SmPerimeter',
    type: 'DOUBLE',
    maxLength: 8,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: false,
    defaultValue: '0',
    name: 'SmGeometrySize',
    caption: 'SmGeometrySize',
    type: 'INT32',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: true,
    defaultValue: '-1',
    name: 'SmGeoPosition',
    caption: 'SmGeoPosition',
    type: 'INT64',
    maxLength: 8,
    isZeroLengthAllowed: true,
    isSystemField: true
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'COUNTRY',
    caption: 'Country',
    type: 'TEXT',
    maxLength: 50,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'CAPITAL',
    caption: 'Capital',
    type: 'TEXT',
    maxLength: 50,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'ColorID',
    caption: 'ColorID',
    type: 'INT32',
    maxLength: 4,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'COLOR_MAP',
    caption: 'COLOR_MAP',
    type: 'TEXT',
    maxLength: 1,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'SQKM',
    caption: 'SQKM',
    type: 'DOUBLE',
    maxLength: 8,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'SQMI',
    caption: 'SQMI',
    type: 'DOUBLE',
    maxLength: 8,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'POP_1994',
    caption: 'Pop_1994',
    type: 'DOUBLE',
    maxLength: 8,
    isZeroLengthAllowed: true,
    isSystemField: false
  },
  {
    isRequired: false,
    defaultValue: '',
    name: 'CONTINENT',
    caption: 'CONTINENT',
    type: 'TEXT',
    maxLength: 20,
    isZeroLengthAllowed: true,
    isSystemField: false
  }
];

const drill_map_mapjson = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427892
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427892
    }
  },
  maxScale: '1:144447.927',
  level: 6,
  center: {
    x: 11516199.562509589,
    y: 3240032.8828670587
  },
  baseLayer: {
    layerType: 'TILE',
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'Shape_Area',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '云贵川',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['Shape_Area', 'Shape_Leng', 'UserID', '行政区划_c'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '719613442'
      }
    },
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'Shape_Area',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '云贵川市',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['FIRST_行政', 'Shape_Area', 'Shape_Leng', 'UserID', '行政区划_c'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '1687422166'
      }
    },
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'Shape_Area',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '云贵川区县',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['Shape_Area', 'Shape_Leng', 'UserID', '分县连接成', '行政区划_1', '行政区划_2', '行政区划_c'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '1960447494'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909',
  title: '无标题1',
  version: '2.3.0',
  rootUrl: 'https://fakeiportal.supermap.io/iportal/services/../'
};
const drill_map_mapjson1 = {
  extent: {
    leftBottom: {
      x: -20037508.342789244,
      y: -20037508.342789136
    },
    rightTop: {
      x: 20037508.342789244,
      y: 20037508.34278908
    }
  },
  maxScale: '1:144447.927',
  level: 4,
  center: {
    x: 11609969.274565263,
    y: 3896311.617487597
  },
  baseLayer: {
    layerType: 'TILE',
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'Shape_Area',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '云贵川',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['Shape_Area', 'Shape_Leng', 'UserID', '行政区划_c'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '719613442'
      }
    },
    {
      layerType: 'VECTOR',
      visible: true,
      name: '中国省级行政区划',
      featureType: 'POLYGON',
      style: {
        fillColor: '#826DBA',
        strokeWidth: 1,
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: [
        'GDP_2005',
        'GDP_2006',
        'GDP_2007',
        'GDP_2008',
        'GDP_2009',
        'GDP_2010',
        'GDP_2011',
        'GDP_2012',
        'GDP_2013',
        'GDP_2014',
        'NAME',
        'PAC',
        'PINYIN',
        'UserID',
        'per_capita_GDP_2014',
        'pop_2014',
        'pop_2014_rural',
        'pop_2014_urban'
      ],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '1562471126'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909',
  title: '云贵川-1',
  version: '2.3.0',
  rootUrl: ' https://fakeiportal.supermap.io/iportal/services/../'
};
const drill_map_mapjson2 = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427892
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427892
    }
  },
  maxScale: '1:144447.927',
  level: 6,
  center: {
    x: 11516199.562509589,
    y: 3240032.8828670587
  },
  baseLayer: {
    layerType: 'TILE',
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'Shape_Area',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '云贵川市',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['FIRST_行政', 'Shape_Area', 'Shape_Leng', 'UserID', '行政区划_c'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '1687422166'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909',
  title: '云贵川市-2',
  version: '2.3.0',
  rootUrl: ' https://fakeiportal.supermap.io/iportal/services/../'
};
const drill_map_mapjson3 = {
  extent: {
    leftBottom: {
      x: -20037508.3427892,
      y: -20037508.3427892
    },
    rightTop: {
      x: 20037508.3427892,
      y: 20037508.3427892
    }
  },
  maxScale: '1:144447.927',
  level: 6,
  center: {
    x: 11516199.562509589,
    y: 3240032.8828670587
  },
  baseLayer: {
    layerType: 'TILE',
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'Shape_Area',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '云贵川区县',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['Shape_Area', 'Shape_Leng', 'UserID', '分县连接成', '行政区划_1', '行政区划_2', '行政区划_c'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '1960447494'
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909',
  title: '云贵川区县-3',
  version: '2.3.0',
  rootUrl: ' https://fakeiportal.supermap.io/iportal/services/../'
};

const drill_map_719613442 = {
  fileName: '云贵川.json',
  type: 'JSON',
  lineNumber: null,
  content: JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [116.452409755349, 40.92656164358],
                [116.483357386004, 40.9069469918439],

                [116.442423257771, 40.9417511118507],
                [116.452409755349, 40.92656164358]
              ]
            ],
            [
              [
                [116.560117987415, 40.9749988417875],

                [116.547892153981, 40.9705907375336],
                [116.552270926448, 40.980672910927],
                [116.560117987415, 40.9749988417875]
              ]
            ]
          ]
        },
        properties: { Shape_Area: 15.988255234, Shape_Leng: 38.3419236605, UserID: 0, 行政区划_c: '贵州省' }
      }
    ]
  })
};
const drill_map_1960447494 = {
  fileName: '云贵川区县.json',
  type: 'JSON',
  lineNumber: null,
  content: JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [116.452409755349, 40.92656164358],
                [116.483357386004, 40.9069469918439],

                [116.442423257771, 40.9417511118507],
                [116.452409755349, 40.92656164358]
              ]
            ],
            [
              [
                [116.560117987415, 40.9749988417875],

                [116.547892153981, 40.9705907375336],
                [116.552270926448, 40.980672910927],
                [116.560117987415, 40.9749988417875]
              ]
            ]
          ]
        },
        properties: {
          Shape_Area: 0.0143851510261,
          Shape_Leng: 0.894049304586,
          UserID: 0,
          分县连接成: '四川省自贡市自流井区',
          行政区划_1: '自贡市',
          行政区划_2: '自流井区',
          行政区划_c: '四川省'
        }
      }
    ]
  })
};
const drill_map_1687422166 = {
  fileName: '云贵川市.json',
  type: 'JSON',
  lineNumber: null,
  content: JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [116.452409755349, 40.92656164358],
                [116.483357386004, 40.9069469918439],

                [116.442423257771, 40.9417511118507],
                [116.452409755349, 40.92656164358]
              ]
            ],
            [
              [
                [116.560117987415, 40.9749988417875],

                [116.547892153981, 40.9705907375336],
                [116.552270926448, 40.980672910927],
                [116.560117987415, 40.9749988417875]
              ]
            ]
          ]
        },
        properties: {
          FIRST_行政: '四川省',
          Shape_Area: 0.406820286455,
          Shape_Leng: 6.24510822758,
          UserID: 0,
          行政区划_c: '自贡市'
        }
      }
    ]
  })
};
const marker_data = {
  fileName: '未命名标注图层1.geojson',
  type: 'GEOJSON',
  lineNumber: null,
  content:
    '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},"features":[{"type":"Feature","properties":{"dataViz_title":"","dataViz_description":"","dataViz_imgUrl":"","dataViz_url":"","dataViz_videoUrl":""},"dv_v5_markerStyle":{"src":"http://fakeiportal/iportal/apps/dataviz/static/imgs/markers/ktv_red.png","scale":1,"anchor":[0.5,0.5],"imgWidth":48,"imgHeight":43},"dv_v5_markerInfo":{"dataViz_title":"","dataViz_description":"","dataViz_imgUrl":"","dataViz_url":"","dataViz_videoUrl":""},"geometry":{"type":"Point","coordinates":[-24.29687500000026,70.60610918076662]}}]}'
};

module.exports = {
  fakeDataServiceResult,
  fakeMapServiceResult,
  fakeAddressMatch,
  featureResults,
  datas,
  datasources,
  datasets,
  queryResults,
  fakeLandUse,
  chartResult,
  datas_chart,
  iportal_content,
  datas_mapjson,
  localSearch,
  charts_content,
  searchGeocoding,
  search_mapjson,
  fieldsJson,
  datas_beijing,
  portal_data,
  portal_data1,
  chart_data,
  prj_data,
  dataset_data,
  datas_charts,
  drill_map_mapjson,
  drill_map_mapjson1,
  drill_map_mapjson2,
  drill_map_mapjson3,
  drill_map_719613442,
  drill_map_1960447494,
  drill_map_1687422166,
  marker_data,
  webmap_markerLayer,
  webmap_heatLayer,
  webmap_vectorLayer_point,
  webmap_vectorLayer_line,
};
