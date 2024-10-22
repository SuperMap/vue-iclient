import airport from './data/airport.json';

const fakeMapServiceResult = {
  recordsets: [
    {
      datasetName: 'Capitals@World#1',
      features: [
        {
          fieldNames: ['SMID', 'NAME'],
          fieldValues: ['1', '四川省'],
          geometry: {
            id: 1,
            center: {
              y: 7.105427357601002e-15,
              x: 0
            },
            style: null,
            parts: [5],
            partTopo: [1],
            points: [
              {
                y: 85.05112877980649,
                x: -180
              },
              {
                y: -85.05112877980648,
                x: -180
              },
              {
                y: -85.05112877980648,
                x: 180
              },
              {
                y: 85.05112877980649,
                x: 180
              },
              {
                y: 85.05112877980649,
                x: -180
              }
            ],
            type: 'REGION'
          }
        },
        {
          fieldNames: ['SMID', 'NAME'],
          fieldValues: ['2', '广东省'],
          geometry: {
            id: 1,
            center: {
              y: 7.105427357601002e-15,
              x: 0
            },
            style: null,
            parts: [5],
            partTopo: [1],
            points: [
              {
                y: 85.05112877980649,
                x: -180
              },
              {
                y: 85.05112877980649,
                x: -180
              }
            ],
            type: 'REGION'
          }
        }
      ],
      fieldCaptions: ['SMID', '名称'],
      fieldTypes: ['INT32', 'WTEXT'],
      fields: ['SMID', 'NAME']
    }
  ],
  totalCount: 1,
  currentCount: 1,
  customResponse: null,
};
const fakeDataServiceResult = {
  datasetInfos: [{
    fieldInfos:[{name: "SmID", caption: "SmID", type: "INT32"}, {name: "NAME", caption: "名称", type: "WTEXT"}]
  }],
  currentCount: 1,
  totalCount: 1,
  features: fakeMapServiceResult.recordsets[0].features
};

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
  thumbnail: 'http://fakeiserver.supermap.io/services/../web/static/portal/img/map/cloud.png',
  dataItemServices: [
    {
      serviceType: 'RESTMAP',
      accessCount: 0,
      address: 'http://fakeiportal.supermap.io/portalproxy/iserver/services/map_sichuan-2-/rest',
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
      address: 'http://fakeiportal.supermap.io/portalproxy/iserver/services/data_sichuan-2-/rest',
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
const webmap_ranksymbolLayer = {
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
      layerType: 'RANK_SYMBOL',
      visible: true,
      themeSetting: {
        maxRadius: 12,
        themeField: '名次',
        customSettings: {},
        minRadius: 6,
        segmentMethod: 'offset',
        segmentCount: 6
      },
      name: '民航数据',
      featureType: 'POINT',
      labelStyle: {
        offsetX: 0,
        textBaseline: 'bottom',
        fontFamily: '黑体',
        offsetY: -10,
        outlineWidth: 0,
        textAlign: 'center',
        outlineColor: '#000000',
        fontSize: '14px',
        fill: '#333',
        backgroundFill: [255, 255, 255, 0.8],
        labelField: '机场'
      },
      xyField: { xField: 'longitude', yField: 'latitude' },
      style: {
        strokeWidth: 1,
        fillColor: '#24B391',
        offsetX: 0,
        offsetY: 0,
        fillOpacity: 0.9,
        radius: 6,
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
  title: '民航数据-等级符号',
  version: '2.2.1',
  rootUrl: 'https://iportal.supermap.io/iportal/services/../'
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
        customSettings: {},
        radius: 10,
        colors: ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000']
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
const webmap_uniqueLayer_polygon = {
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
        themeField: '行政区划_c',
        customSettings: {
          四川省: {
            strokeWidth: 1,
            fillColor: '#e6f599',
            fillOpacity: 0.9,
            lineDash: 'solid',
            strokeColor: '#ffffff',
            type: 'POLYGON',
            strokeOpacity: 1
          }
        },
        colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD']
      },
      name: '市级行政区划_1_2',
      featureType: 'POLYGON',
      style: {
        strokeWidth: 1,
        fillColor: '#3288bd',
        fillOpacity: 0.9,
        lineDash: 'solid',
        strokeColor: '#ffffff',
        type: 'POLYGON',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['Shape_Area', 'Shape_Leng', 'UserID', '分县连接成', '行政区划_1', '行政区划_2', '行政区划_c'],
      dataSource: {
        type: 'PORTAL_DATA',
        serverId: '1960447494'
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
  layers: [
    {
      layerType: 'VECTOR',
      name: '浙江省高等院校(3)',
      visible: true,
      featureType: 'POINT',
      style: {
        radius: 6,
        fillColor: '#ff0000',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWidth: 1,
        strokeOpacity: 1,
        lineDash: 'solid',
        symbolType: 'svg',
        type: 'BASIC_POINT'
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
  layers: [
    {
      layerType: 'VECTOR',
      name: '浙江省高等院校(3)',
      visible: true,
      featureType: 'LINE',
      style: {
        radius: 5,
        fillColor: '#ee4d5a',
        fillOpacity: 0.9,
        strokeColor: '#8b572a',
        strokeWidth: 7,
        strokeOpacity: 1,
        lineDash: 'solid',
        type: 'BASIC_POINT'
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

const webmap_rangeLayer = {
  extent: {
    leftBottom: {
      x: -20037508.342789248,
      y: -20037508.34278914
    },
    rightTop: {
      x: 20037508.342789244,
      y: 20037508.342789087
    }
  },
  maxScale: '1:144447.92746805',
  level: 10,
  center: {
    x: 12960700.474044422,
    y: 4861370.203808137
  },
  baseLayer: {
    layerType: 'TILE',
    name: 'ChinaDark',
    url: 'http://fakeiserver.supermap.io/iserver/services/map-china400/rest/maps/ChinaDark'
  },
  layers: [
    {
      layerType: 'RANGE',
      visible: true,
      themeSetting: {
        themeField: 'SmID',
        customSettings: {},
        segmentMethod: 'offset',
        segmentCount: 6,
        colors: ['#ffc6c4', '#f4a3a8', '#e38191', '#cc607d', '#ad466c', '#8b3058', '#672044']
      },
      name: '北京市轨道交通站点(9)',
      featureType: 'POINT',
      style: {
        strokeWidth: 1,
        fillColor: '#8b3058',
        offsetX: 0,
        offsetY: 0,
        fillOpacity: 0.9,
        radius: 8,
        strokeColor: '#ffffff',
        type: 'BASIC_POINT',
        strokeOpacity: 1
      },
      projection: 'EPSG:4326',
      enableFields: ['SmID', 'SmX', 'SmY', 'SmLibTileID', 'SmUserID', 'SmGeometrySize', 'SmGeoPosition', '标准名称'],
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '1473470625'
      },
      layerID: '北京市轨道交通站点(9)'
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909131',
  title: '无标题',
  version: '2.3.0',
  mapParams: {
    title: '无标题',
    description: ''
  }
};

const webmap_tiandituLayer = {
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
  maxScale: '1:18055.99093350616',
  level: 1,
  center: {
    x: 8586143.281685632,
    y: 356074.8698694445
  },
  baseLayer: {
    layerType: 'TIANDITU_TER_3857',
    labelLayerVisible: true,
    tk: '1d109683f4d84198e37a38c442d68311',
    name: '天地图地形'
  },
  layers: [],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:295829355.4545649',
  title: '无标题tianditu',
  version: '2.3.0',
  rootUrl: 'http://support.supermap.com.cn:8090/iportal/services/../',
  mapParams: {
    title: '无标题tianditu',
    description: ''
  }
};

const webmap_wmsLayer = {
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
  maxScale: '1:144447.92746805',
  level: 1,
  center: {
    x: 7219425.62918168,
    y: -3039139.7858056696
  },
  baseLayer: {
    layerType: 'TILE',
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'WMS',
      visible: true,
      name: '世界地图_Day',
      layers: ['0'],
      layerID: '世界地图_Day'
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909131',
  title: '无标题',
  version: '2.3.0',
  mapParams: {
    title: '无标题',
    description: ''
  }
};

const webmap_wmtsLayer = {
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
  maxScale: '1:144447.92746805',
  level: 1,
  center: {
    x: 7044436.526761852,
    y: -142311.41472421167
  },
  baseLayer: {
    layerType: 'TILE',
    visible: true,
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'WMTS',
      tileMatrixSet: 'Custom_China',
      requestEncoding: 'KVP',
      visible: true,
      name: 'China',
      dpi: 90.7142857142857,
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-china400/wmts100',
      layer: 'China',
      layerID: 'China'
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909131',
  title: '无标题',
  version: '2.3.0',
  mapParams: {
    title: '无标题',
    description: ''
  }
};

const webmap_xyzLayer = {
  extent: {
    leftBottom: {
      x: -20037508.34,
      y: -20037508.34
    },
    rightTop: {
      x: 20037508.34,
      y: 20037508.34
    }
  },
  maxScale: '1:564.2497165935246',
  level: 0,
  center: {
    x: 3723945.6807942055,
    y: -2268172.2613533167
  },
  baseLayer: {
    layerType: 'OSM',
    name: 'OpenStreetMap'
  },
  layers: [],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:295829355.4133858',
  title: '无标题',
  version: '2.3.0',
  mapParams: {
    title: '无标题',
    description: ''
  }
};

const webmap_mapboxstyleLayer = {
  extent: {
    leftBottom: {
      x: 8009146.115071949,
      y: 382872.01868254057
    },
    rightTop: {
      x: 15037846.241523674,
      y: 7087311.00490398
    }
  },
  maxScale: '1:70.53121458400844',
  level: 3,
  center: {
    x: 11523496.17829781,
    y: 3735091.51179326
  },
  baseLayer: {
    layerType: 'MAPBOXSTYLE',
    name: 'PopulationDistribution',
    dataSource: {
      type: 'EXTERNAL',
      url: 'http://support.supermap.com.cn:8090/iserver/services/map-Population/restjsr/v1/vectortile/maps/PopulationDistribution'
    }
  },
  layers: [],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:295829355.4545649',
  title: '无标题',
  version: '2.3.0',
  mapParams: {
    title: '无标题',
    description: ''
  }
};

const webmap_migrationLayer = {
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
  maxScale: '1:144447.92746805',
  level: 10,
  center: {
    x: 12970681.08359509,
    y: 4858329.28626181
  },
  baseLayer: {
    layerType: 'TILE',
    visible: true,
    name: '中国暗色地图',
    url: 'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark'
  },
  layers: [
    {
      layerType: 'MIGRATION',
      labelSetting: {
        fontFamily: '黑体',
        color: '#62AD16',
        show: false
      },
      visible: true,
      name: '北京市轨道交通站点(13)',
      featureType: 'POINT',
      from: {
        xField: 'SmX',
        yField: 'SmY',
        type: 'XY_FIELD'
      },
      projection: 'EPSG:4326',
      to: {
        type: 'XY_FIELD'
      },
      enableFields: ['SmID', 'SmX', 'SmY', 'SmLibTileID', 'SmUserID', 'SmGeometrySize', 'SmGeoPosition', '标准名称'],
      lineSetting: {
        curveness: 0.2,
        color: '#62AD16',
        width: 1,
        type: 'solid',
        opacity: 0.6
      },
      dataSource: {
        accessType: 'DIRECT',
        type: 'PORTAL_DATA',
        serverId: '516597759'
      },
      animationSetting: {
        symbol: 'pin',
        symbolSize: 15,
        show: false,
        constantSpeed: 40
      }
    }
  ],
  description: '',
  projection: 'EPSG:3857',
  minScale: '1:591658710.909131',
  title: '无标题point',
  version: '2.3.0'
};

const datasources = {
  datasourceNames: ['supermap1_pg'],
  childUriList: [
    'http://fakeiportal.supermap.io/portalproxy/iserver/services/data_sichuan-2-/rest/data/datasources/name/supermap1_pg'
  ],
  datasourceCount: 1
};

const datasets = {
  datasetCount: 1,
  datasetNames: ['dataGeoJson_509705538'],
  childUriList: [
    'http://fakeiportal.supermap.io/portalproxy/iserver/services/data_sichuan-2-/rest/data/datasources/supermap1_pg/datasets/dataGeoJson_509705538'
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

const REST_DATA_FIELDS_RESULT = [
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
    isRequired: false,
    defaultValue: '',
    name: 'NAME',
    caption: '名称',
    type: 'WTEXT',
    maxLength: 60,
    isZeroLengthAllowed: true,
    isSystemField: false
  }
]

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

const webmap_MAPBOXSTYLE_Tile = {
  extent: {
    leftBottom: {
      x: -180,
      y: -85.0511287798065
    },
    rightTop: {
      x: 180,
      y: 85.05112877980648
    }
  },
  maxScale: '1:144447.92746805',
  level: 8,
  center: {
    x: 117.0513716776266,
    y: 40.03871230682322
  },
  baseLayer: {
    layerType: 'MAPBOXSTYLE',
    name: 'China_4326',
    dataSource: {
      type: 'EXTERNAL',
      url: 'https://fakeiportal.supermap.io/iserver/services/map-china400/restjsr/v1/vectortile/maps/China_4326'
    }
  },
  layers: [
    {
      layerType: 'TILE',
      visible: true,
      name: '京津地区地图',
      url: 'http://fakeiportal.supermap.io/iserver/services/map-ugcv5-JingJinDiQuDiTu/rest/maps/%E4%BA%AC%E6%B4%A5%E5%9C%B0%E5%8C%BA%E5%9C%B0%E5%9B%BE'
    }
  ],
  description: '',
  projection: 'EPSG:4326',
  minScale: '1:591658710.9091309',
  title: 'test',
  version: '2.3.0'
};

const wmsCapabilitiesText =
  '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE WMT_MS_Capabilities SYSTEM "http://fakeiserver.supermap.io/iserver/services/map-world/wms111?request=getdtd&file=wms,1.1.1,capabilities_1_1_1.dtd"><WMT_MS_Capabilities version="1.1.1"><Service><Name>OGC:WMS</Name><Title>map-world_wms111</Title><Abstract>北京超图软件股份有限公司提供的 WMS 服务. 联系方式: support@supermap.com</Abstract><KeywordList><Keyword>iServer</Keyword></KeywordList><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://fakeiserver.supermap.io/iserver/services/map-world/wms111?" xlink:type="simple" /><ContactInformation><ContactPersonPrimary><ContactPerson>联系人姓名</ContactPerson><ContactOrganization>北京超图软件股份有限公司</ContactOrganization></ContactPersonPrimary><ContactPosition /><ContactAddress><AddressType>postal</AddressType><Address>北京市朝阳区酒仙桥北路甲10号院电子城IT产业园107号楼6层</Address><City>北京</City><StateOrProvince>北京</StateOrProvince><PostCode>100015</PostCode><Country>中国</Country></ContactAddress><ContactVoiceTelephone>+86-10-59896655</ContactVoiceTelephone><ContactFacsimileTelephone>+86-10-59896666</ContactFacsimileTelephone><ContactElectronicMailAddress>support@supermap.com</ContactElectronicMailAddress></ContactInformation><Fees>none</Fees><AccessConstraints>none</AccessConstraints></Service><Capability><Request><GetCapabilities><Format>application/vnd.ogc.wms_xml</Format><Format>text/xml</Format><Format>text/html</Format><DCPType><HTTP><Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://fakeiserver.supermap.io/iserver/services/map-world/wms111?" xlink:type="simple" /></Get><Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://fakeiserver.supermap.io/iserver/services/map-world/wms111?" xlink:type="simple" /></Post></HTTP></DCPType></GetCapabilities><GetMap><Format>image/png</Format><Format>image/bmp</Format><Format>image/jpeg</Format><Format>image/gif</Format><DCPType><HTTP><Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://fakeiserver.supermap.io/iserver/services/map-world/wms111?" xlink:type="simple" /></Get></HTTP></DCPType></GetMap><GetFeatureInfo><Format>application/vnd.ogc.wms_xml</Format><Format>text/xml</Format><Format>text/html</Format><DCPType><HTTP><Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://fakeiserver.supermap.io/iserver/services/map-world/wms111?" xlink:type="simple" /></Get></HTTP></DCPType></GetFeatureInfo></Request><Exception><Format>application/vnd.ogc.se_xml</Format><Format>XML</Format></Exception><UserDefinedSymbolization SupportSLD="1" UserLayer="0" UserStyle="1" RemoteWFS="0" /><Layer queryable="0"><Title /><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><SRS>EPSG:0</SRS><LatLonBoundingBox minx="-180.0" miny="-90.00000000003598" maxx="180.00000000007202" maxy="90.00000000000001" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.00000000003598" maxx="180.00000000007202" maxy="90.00000000000001" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.003750834279726E7" maxy="2.0037508342789244E7" /><Layer queryable="1"><Name>0</Name><Title>世界地图_Day</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><LatLonBoundingBox minx="-180.0" miny="-90.00000000003598" maxx="180.00000000007202" maxy="90.00000000000001" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.00000000003598" maxx="180.00000000007202" maxy="90.00000000000001" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.003750834279726E7" maxy="2.0037508342789244E7" /></Layer><Layer queryable="1"><Name>1</Name><Title>World</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><LatLonBoundingBox minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.0037508342789244E7" maxy="2.0037508342789244E7" /></Layer><Layer queryable="1"><Name>2</Name><Title>世界地图_Gray</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><LatLonBoundingBox minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.0037508342789244E7" maxy="2.0037508342789244E7" /></Layer><Layer queryable="1"><Name>3</Name><Title>世界地图</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><LatLonBoundingBox minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.0037508342789244E7" maxy="2.0037508342789244E7" /></Layer><Layer queryable="1"><Name>4</Name><Title>World Map</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><LatLonBoundingBox minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.0037508342789244E7" maxy="2.0037508342789244E7" /></Layer><Layer queryable="1"><Name>5</Name><Title>世界地图_Night</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><LatLonBoundingBox minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.0" maxx="180.0" maxy="90.0" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.0037508342789244E7" maxy="2.0037508342789244E7" /></Layer><Layer queryable="1"><Name>6</Name><Title>World_Common</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><SRS>EPSG:0</SRS><LatLonBoundingBox minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8625154.223060824" /><BoundingBox SRS="EPSG:4326" minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8625154.223060824" /><BoundingBox SRS="EPSG:3857" minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8625154.223060824" /><BoundingBox SRS="EPSG:0" minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8625154.223060824" /></Layer><Layer queryable="1"><Name>7</Name><Title>World_Robinson</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><SRS>EPSG:0</SRS><LatLonBoundingBox minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8691252.148623722" /><BoundingBox SRS="EPSG:4326" minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8691252.148623722" /><BoundingBox SRS="EPSG:3857" minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8691252.148623722" /><BoundingBox SRS="EPSG:0" minx="-1.700583333052523E7" miny="-8625154.223060824" maxx="1.700583333052523E7" maxy="8691252.148623722" /></Layer><Layer queryable="1"><Name>8</Name><Title>World_VanderGrintenI</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><SRS>EPSG:0</SRS><LatLonBoundingBox minx="-2.0037508342789244E7" miny="-2.003750834278924E7" maxx="2.0037508342789244E7" maxy="2.003750834278924E7" /><BoundingBox SRS="EPSG:4326" minx="-2.0037508342789244E7" miny="-2.003750834278924E7" maxx="2.0037508342789244E7" maxy="2.003750834278924E7" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.003750834278924E7" maxx="2.0037508342789244E7" maxy="2.003750834278924E7" /><BoundingBox SRS="EPSG:0" minx="-2.0037508342789244E7" miny="-2.003750834278924E7" maxx="2.0037508342789244E7" maxy="2.003750834278924E7" /></Layer><Layer queryable="1"><Name>9</Name><Title>World_AirLine_Part</Title><SRS>EPSG:4326</SRS><SRS>EPSG:3857</SRS><SRS>EPSG:0</SRS><LatLonBoundingBox minx="-180.0" miny="-90.0" maxx="180.0" maxy="85.88623405603997" /><BoundingBox SRS="EPSG:4326" minx="-180.0" miny="-90.0" maxx="180.0" maxy="85.88623405603997" /><BoundingBox SRS="EPSG:3857" minx="-2.0037508342789244E7" miny="-2.0037508342789236E7" maxx="2.0037508342789244E7" maxy="2.0037508342789244E7" /><BoundingBox SRS="EPSG:0" minx="-180.0" miny="-90.0" maxx="180.0" maxy="85.88623405603997" /></Layer></Layer></Capability></WMT_MS_Capabilities>';

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
  REST_DATA_FIELDS_RESULT,
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
  webmap_ranksymbolLayer,
  webmap_uniqueLayer_polygon,
  webmap_tiandituLayer,
  webmap_wmsLayer,
  webmap_wmtsLayer,
  webmap_xyzLayer,
  webmap_mapboxstyleLayer,
  webmap_migrationLayer,
  webmap_rangeLayer,
  wmsCapabilitiesText,
  webmap_MAPBOXSTYLE_Tile
};

