import WebMapViewModel from '../WebMapViewModel.ts';
describe('WebMapViewModel.spec', () => {
  it('constructor options = undefined, id is Object', () => {
    const id = {
      baseLayer: {
        layerType: 'TILE',
        name: '中国暗色地图',
        url: 'https://test/iserver/services/map_China/rest/maps/China_Dark'
      },
      center: {
        x: 0,
        y: 0
      },
      description: '',
      extent: {
        leftBottom: {
          x: 0,
          y: 1
        },
        rightTop: {
          x: 1,
          y: 2
        }
      },
      layers: [],
      level: 3,
      maxScale: '1:144447.92746805',
      minScale: '1:591658710.909131',
      projection: 'EPSG:3857',
      rootUrl: 'http://test',
      title: '无标题',
      version: '2.3.0'
    };
    expect(() => {
      new WebMapViewModel(id);
    }).not.toThrow();
  });

  it('uniqueLayer', () => {
    const datavizWebMap_Unique = {
      version: '6.0',
      title: 'Unique',
      description: '',
      projection: 'EPSG:3857',
      center: { x: 12949175.717869252, y: 4864340.473197712 },
      level: 12,
      extent: {
        leftBottom: { x: -20037508.3427892, y: -20037508.3427892 },
        rightTop: { x: 20037508.3427892, y: 20037508.3427892 }
      },
      baseLayer: { layerType: 'CLOUD', name: '高德地图' },
      layers: [
        {
          layerType: 'UNIQUE',
          name: '住宅_Lite(10)',
          visible: true,
          featureType: 'POINT',
          xyField: { xField: 'SmX', yField: 'SmY' },
          projection: 'EPSG:4326',
          style: {
            radius: 12,
            lineDash: 'solid',
            strokeWidth: 1,
            strokeColor: '#ffffff',
            strokeOpacity: 1,
            fillOpacity: 0.9,
            fillColor: '#3288bd'
          },
          themeSetting: {
            themeField: '区站号',
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD'],
            customSettings: { 50136: '#D53E4F' }
          },
          dataSource: { type: 'PORTAL_DATA', serverId: 658963918 }
        }
      ],
      sourceType: 'DataViz',
      thumbnail: 'http://127.0.0.1:8090/iportal/static/dataviz/static/imgs/thumbnail_default.png'
    };
    expect(() => {
      new WebMapViewModel(datavizWebMap_Unique);
    }).not.toThrow();
  });
  it('rangeLayer', () => {
    var datavizWebMap_Range = {
      version: '6.0',
      title: 'RANGE_LABEL',
      description: '',
      projection: 'EPSG:3857',
      center: { x: 12957697.597143793, y: 4851476.112683487 },
      level: 10,
      extent: {
        leftBottom: { x: -20037508.3427892, y: -20037508.3427892 },
        rightTop: { x: 20037508.3427892, y: 20037508.3427892 }
      },
      baseLayer: { layerType: 'BING', name: 'BING地图' },
      layers: [
        {
          layerType: 'RANGE',
          name: '北京市轨道交通线路(2)',
          visible: true,
          featureType: 'LINE',
          xyField: { xField: null, yField: null },
          projection: 'EPSG:4326',
          style: {
            radius: 5,
            lineDash: 'solid',
            strokeWidth: 11,
            strokeColor: '#99D594',
            strokeOpacity: 1,
            fillOpacity: 0.9,
            fillColor: '#FFFFFF'
          },
          themeSetting: {
            segmentCount: 6,
            segmentMethod: 'square',
            colors: ['#D53E4F', '#FC8D59', '#FEE08B', '#FFFFBF', '#E6F598', '#99D594', '#3288BD'],
            customSettings: {},
            themeField: 'SmID'
          },
          labelStyle: { fill: '#333', fontFamily: '仿宋', labelField: '标准名称' },
          dataSource: { type: 'PORTAL_DATA', serverId: 1236941499 }
        }
      ],
      sourceType: 'DataViz',
      thumbnail: 'http://127.0.0.1:8090/iportal/static/dataviz/static/imgs/thumbnail_default.png'
    };
    expect(() => {
      new WebMapViewModel(datavizWebMap_Range);
    }).not.toThrow();
  });
  it('heatLayer', () => {
    var datavizWebMap_Heat = {
      version: '6.0',
      title: 'Heat',
      description: '',
      projection: 'EPSG:3857',
      center: { x: 13428717.554131005, y: 3553719.2183414707 },
      level: 7,
      extent: {
        leftBottom: { x: -20037508.3427892, y: -20037508.3427892 },
        rightTop: { x: 20037508.3427892, y: 20037508.3427892 }
      },
      baseLayer: { layerType: 'BAIDU', name: 'BAIDU地图' },
      layers: [
        {
          layerType: 'HEAT',
          name: '浙江省高等院校(3)',
          visible: true,
          featureType: 'POINT',
          xyField: { xField: '经度', yField: '纬度' },
          projection: 'EPSG:4326',
          themeSetting: {
            colors: ['#9766bf', '#c9adad', '#b5addd', '#93a9dd', '#74a9e1'],
            weight: '纬度',
            radius: 10,
            customSettings: {
              0: {
                hsl: { h: 55.36363636363636, s: 0.9401709401709404, l: 0.5411764705882353, a: 1 },
                hex: '#f8e71c',
                rgb: { r: 248, g: 231, b: 28, a: 1 },
                hsv: { h: 55.36363636363636, s: 0.8870967741935485, v: 0.9725490196078431, a: 1 },
                oldHue: 240,
                source: 'hex'
              }
            }
          },
          dataSource: { type: 'PORTAL_DATA', serverId: 675746998 }
        }
      ],
      sourceType: 'DataViz',
      thumbnail: 'http://127.0.0.1:8090/iportal/static/dataviz/static/imgs/thumbnail_default.png'
    };
    expect(() => {
      new WebMapViewModel(datavizWebMap_Heat);
    }).not.toThrow();
  });
});
