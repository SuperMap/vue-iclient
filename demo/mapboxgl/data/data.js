import * as mapv from 'mapv';
import smcomponents from '../../../src/mapboxgl';
import demoData from '../../data/demo.json';
import earthquake from '../../data/earthquake.json';
import themeLayerData from '../../data/themeLayerData.json';
import deckglLayerData from '../../data/sf-bike-parking.json';
import axios from 'axios';

export default {
  data() {
    var host = window.isLocal ? window.server : 'http://support.supermap.com.cn:8090';
    var attribution =
      "<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox </a>" +
      " with <span>© <a href='http://iclient.supermap.io' target='_blank'>SuperMap iClient</a> | </span>" +
      " Map Data <span>© <a href='http://support.supermap.com.cn/product/iServer.aspx' target='_blank'>SuperMap iServer</a></span> ";
    var randomCount = 1000;

    var data = [];

    var citys = demoData.citys;

    // 构造数据
    while (randomCount--) {
      var cityCenter = mapv.utilCityCenter.getCenterByCityName(citys[parseInt(Math.random() * citys.length)]);
      data.push({
        geometry: {
          type: 'Point',
          coordinates: [cityCenter.lng - 2 + Math.random() * 4, cityCenter.lat - 2 + Math.random() * 4]
        },
        count: 30 * Math.random()
      });
    }

    var dataSet = new mapv.DataSet(data);

    var options = {
      fillStyle: 'rgba(55, 50, 250, 0.8)',
      shadowColor: 'rgba(255, 250, 50, 1)',
      shadowBlur: 20,
      max: 100,
      size: 50,
      label: { show: true, fillStyle: 'white' },
      globalAlpha: 0.5,
      gradient: {
        0.25: 'rgb(0,0,255)',
        0.55: 'rgb(0,255,0)',
        0.85: 'yellow',
        1.0: 'rgb(255,0,0)'
      },
      draw: 'honeycomb'
    };

    var echartsLayerData = demoData.echartsLayerData;
    var geoCoordMap = demoData.geoCoordMap;

    var convertData = function(data) {
      var res = [];
      for (var i = 0; i < data.length; i++) {
        var geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value)
          });
        }
      }
      return res;
    };

    var echartsOptions = {
      animation: false,
      title: {
        text: '11',
        subtext: 'data from PM25.in',
        sublink: 'http://www.pm25.in',
        left: 'center',
        textStyle: { color: '#fff' }
      },
      tooltip: { trigger: 'item' },
      legend: {
        orient: 'vertical',
        y: 'bottom',
        x: 'right',
        data: ['pm2.5'],
        textStyle: { color: '#fff' }
      },
      GLMap: {},

      series: [
        {
          name: 'pm2.5',
          type: 'scatter',
          coordinateSystem: 'GLMap',
          data: convertData(echartsLayerData),
          symbolSize: function(val) {
            return val[2] / 10;
          },
          label: {
            normal: { formatter: '{b}', position: 'right', show: false },
            emphasis: { show: true }
          },
          itemStyle: { normal: { color: '#ddb926' } }
        },
        {
          name: 'Top 5',
          type: 'effectScatter',
          coordinateSystem: 'GLMap',
          data: convertData(
            echartsLayerData
              .sort(function(a, b) {
                return b.value - a.value;
              })
              .slice(0, 6)
          ),
          symbolSize: function(val) {
            return val[2] / 10;
          },
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke' },
          hoverAnimation: true,
          label: {
            normal: { formatter: '{b}', position: 'right', show: true }
          },
          itemStyle: {
            normal: { color: '#f4e925', shadowBlur: 10, shadowColor: '#333' }
          },
          zlevel: 1
        }
      ]
    };

    // 模拟 dataflow 实时数据
    // SuperMap.SecurityManager.registerToken("ws://iclsvrws.supermap.io/iserver/services/dataflowTest/dataflow", '0ra2250-rPu6ZnqHPKqcqDjGkDGDv3bg5HHy1SNNXf79OlN0ArG07bq3cGFz0v-nfBm2RAnYJ3LGBsuiptH43g..');
    // var featureResult, dataFlowBroadcast, timer;
    // function broadcast() {
    //   var features = [];
    //   for (var index = 0; index < featureResult.length; index++) {
    //     var count = parseInt(Math.random() * featureResult.length);
    //     var geometry = featureResult[count].geometry;
    //     var feature = {
    //       geometry: geometry,
    //       type: "Feature",
    //       properties: { id: index + 1, time: new Date() }
    //     };
    //     features.push(feature);
    //   }
    //   dataFlowBroadcast.broadcast(features);
    // }

    // function query() {
    //   var param = new SuperMap.QueryBySQLParameters({
    //     queryParams: { name: "Capitals@World#3", attributeFilter: "SMID > 0" }
    //   });
    //   var queryService = new mapboxgl.supermap.QueryService(
    //     "http://support.supermap.com.cn:8090/iserver/services/map-world/rest/maps/World"
    //   ).queryBySQL(param, function(serviceResult) {
    //     featureResult = serviceResult.result.recordsets[0].features.features;
    //     dataFlowBroadcast = new mapboxgl.supermap.DataFlowService(
    //       "ws://iclsvrws.supermap.io/iserver/services/dataflowTest/dataflow"
    //     ).initBroadcast();
    //     dataFlowBroadcast.on("broadcastSocketConnected", function(e) {
    //       timer = window.setInterval(broadcast, 2000);
    //     });
    //   });
    // }
    // query();

    var rankFeatures = [];
    for (var i = 0, len = themeLayerData.chinaConsumptionLevel.length; i < len; i++) {
      // 省居民消费水平（单位：元）信息
      var provinceInfo = themeLayerData.chinaConsumptionLevel[i];
      var geo = new mapboxgl.LngLat(provinceInfo[1], provinceInfo[2]);
      var attrs = {};
      attrs.NAME = provinceInfo[0];
      attrs.CON2009 = provinceInfo[3];
      var fea = new mapboxgl.supermap.ThemeFeature(geo, attrs);
      rankFeatures.push(fea);
    }
    const tdtKey = '1d109683f4d84198e37a38c442d68311';
    return {
      componentType: 'map-sub-components',
      mapID: '801571284',
      layerStyles: {
        line: new smcomponents.commontypes.LineStyle({ 'line-width': 3, 'line-color': '#3fb1e3' }),
        circle: new smcomponents.commontypes.CircleStyle({ 'circle-color': '#3fb1e3', 'circle-radius': 6 }),
        fill: new smcomponents.commontypes.FillStyle({ 'fill-color': '#3fb1e3', 'fill-opacity': 0.8 })
      },
      rankFeatures,
      styleObject: {
        width: '600px'
      },
      scanEffect: {
        status: true,
        type: 'line',
        period: 2000,
        speed: 500
      },
      iportalDataQuery: [
        new smcomponents.commontypes.iPortalDataParameter({
          url: 'http://192.168.11.94:8190/iportal/web/datas/3332747',
          attributeFilter: 'SmID>0'
        }),
        new smcomponents.commontypes.iPortalDataParameter({
          url: 'http://192.168.11.94:8190/iportal/web/datas/1050165341',
          attributeFilter: 'SmID>0'
        })
      ],
      restDataQuery: [
        new smcomponents.commontypes.RestDataParameter({
          url: host + '/iserver/services/data-world/rest/data',
          attributeFilter: "NAME='Huang He'",
          dataName: ['World:Countries']
        })
      ],
      restMapQuery: [
        new smcomponents.commontypes.RestMapParameter({
          url: host + '/iserver/services/map-world/rest/maps/World',
          attributeFilter: 'SmID>0',
          layerName: 'Capitals@World.1'
        })
      ],
      rasteLayerOptions: {
        name: '我的栅格图层',
        opacity: 0.8,
        visible: true,
        tiles: [host + '/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'],
        mapUrl: host + '/iserver/services/map-china400/rest/maps/China'
      },
      layerSourceNames: ['UNIQUE-民航数-0'],
      addressMatch: [
        new smcomponents.commontypes.AddressMatchParameter({
          url: host + '/iserver/services/addressmatch-Address/restjsr/v1/address'
        })
      ],
      restMapSearch: [
        new smcomponents.commontypes.RestMapParameter({
          url: host + '/iserver/services/map-world/rest/maps/World',
          layerName: 'Capitals@World.1'
        })
      ],
      restDataSearch: [
        new smcomponents.commontypes.RestDataParameter({
          url: host + '/iserver/services/data-world/rest/data',
          dataName: ['World:Countries']
        })
      ],
      iportalData: [
        new smcomponents.commontypes.iPortalDataParameter({
          url: 'http://192.168.12.28:8092/web/datas/659519047'
        })
      ],
      onlineLocalSearch: {
        enable: true,
        city: '北京市'
      },
      mapOptions: {
        container: 'map', // container id
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              type: 'raster',
              tiles: [
                'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
              ],
              tileSize: 256
            }
          },
          layers: [
            {
              id: 'simple-tiles',
              type: 'raster',
              source: 'raster-tiles',
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: [120.143, 30.236],
        zoom: 3
        // center: [-122.430844, 37.772276],
        // zoom: 12,
      },
      webMapOptions: {
        server: 'http://support.supermap.com.cn:8092/'
      },
      chartTitle: '',
      dataset: new smcomponents.commontypes.iPortalDataParameter({
        url: "https://iportal.supermap.io/iportal/web/datas/676516522",
        maxFeatures: 20
      }),
      // echarts中涉及到超图数据series和坐标轴的字段的配置
      datasetOptions: [
        {
          seriesType: 'bar', // 图表类型
          isStastic: true, // 是否统计, 默认不统计
          isStack: true, // 是否堆叠, 默认不堆叠
          xField: '机场', // x坐标轴数据字段
          yField: '2016起降架次（架次）' // 统计的数据，legned默认名字
        },
        {
          seriesType: 'bar',
          isStastic: true,
          isStack: true,
          xField: '机场',
          yField: '2017起降架次（架次）'
        }
      ],
      // 和echarts一样的配置
      echartOption: {
        legend: { data: ['2016起降架次（架次）', '2017起降架次（架次）'] }, // 与legendName || yField数据一致
        tooltip: { formatter: '{b0}: {c0}' },
        grid: {
          top: 30,
          bottom: 60,
          left: 60,
          right: 30
        }
        // series : [
        // {
        //   name:'访问来源',
        //   type:'pie',
        //   data:[
        //       {value:335, name:'直接访问'},
        //       {value:310, name:'邮件营销'},
        //       {value:274, name:'联盟广告'},
        //       {value:235, name:'视频广告'},
        //       {value:400, name:'搜索引擎'}
        //   ]
        // }]
      },
      dataSet,
      mapvOptions: options,
      layerTypeId: 'hexagon-layer',
      deckglOptions: {
        data: deckglLayerData,
        props: {
          extruded: true, // 是否拉伸要素，默认为 false；
          radius: 200, // 六边形半径值，默认为 1000
          elevationScale: 4, // 高程乘数
          coverage: 0.8 // 六边形半径乘数，介于0 - 1之间。六边形的最终半径通过覆盖半径计算。
          // 还可配置的参数：
          // colorRange 色带，默认为 [[255,255,178,255],[254,217,118,255],[254,178,76,255],[253,141,60,255],[240,59,32,255],[189,0,38,255]]
        },
        callback: {
          getPosition: d => d.COORDINATES
        }
      },
      echartsOptions,
      heatMapData: earthquake,
      heatMapLayerPaint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209,229,240)',
          0.6,
          'rgb(253,219,199)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
      },
      clusterLayerData: earthquake,
      symbolType: 'Circle',
      rankThemeLayerOptions: {
        attributions: ' ',
        themeField: 'CON2009',
        // 配置图表参数
        symbolSetting: {
          // 必设参数
          codomain: [0, 40000], // 允许图形展示的值域范围，此范围外的数据将不制作图图形
          // 圆最大半径 默认100
          maxR: 100,
          // 圆最小半径 默认0
          minR: 0,
          // 圆形样式
          circleStyle: { fillOpacity: 0.8 },
          // 符号专题图填充颜色
          fillColor: '#FFA500',
          // 专题图hover 样式
          circleHoverStyle: { fillOpacity: 1 }
        }
      },
      input1: '123',
      switch1: false,
      switch2: true,
      checkbox1: [],
      plainOptions: [
        { value: 'Apple' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange', disabled: false }
      ],
      plainOptions1: ['Apple', 'Pear', 'Orange'],
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      tabPosition: 'top',
      treeDatas: [
          {
              title: '直辖市',
              children: [
                  {
                      title: '上海',
                      mapInfo: {
                          serverUrl: 'https://www.supermapol.com/',
                          mapId: 394538195,
                          layerFilter: function(layer) {
                              if (layer.name === '上海_县级行政区划图@公众数据') {
                                  return true;
                              }
                              return false;
                          }
                      }
                  },
                  {
                      title: '天津',
                      mapInfo: {
                          serverUrl: 'https://www.supermapol.com/',
                          mapId: 849848633,
                          layerFilter: function(layer) {
                              if (layer.name === '天津_县级行政区划图@公众数据') {
                                  return true;
                              }
                              return false;
                          }
                      }
                  },
                  {
                      title: '北京',
                      mapInfo: {
                          serverUrl: 'https://www.supermapol.com/',
                          mapId: 1837435007,
                          layerFilter: function(layer) {
                              if (layer.name === '北京_县级行政区划图@公众数据') {
                                  return true;
                              }
                              return false;
                          }
                      }
                  },
                  {
                      title: '重庆',
                      mapInfo: {
                          serverUrl: 'https://www.supermapol.com/',
                          mapId: 1589273415,
                          layerFilter: function(layer) {
                              if (layer.name === '重庆_县级行政区划图@公众数据') {
                                  return true;
                              }
                              return false;
                          }
                      }
                  }
              ]
          }
      ],
      mapSwitcherData: {
        select: '',
        label: false,
        tk: tdtKey
      },
      routeData: {
        carUrl: 'https://api.tianditu.gov.cn/drive',
        busUrl: 'https://api.tianditu.gov.cn/transit',
        searchUrl: 'https://api.tianditu.gov.cn/search',
        tk: tdtKey
      },
      searchData: {
        searchUrl: 'https://api.tianditu.gov.cn/search',
        tk: tdtKey
      }
    };
  },
  methods: {
    changeStyle() {
      smcomponents.setTheme('dark');
      document.getElementsByTagName('body')[0].style.background = '#000';
    },
    changeStyle1() {
      smcomponents.setTheme('light');
      document.getElementsByTagName('body')[0].style.background = '#fff';
    },
    changeStyle2() {
      let transparent = {
        style: 'dark',
        textColor: '#eee',
        background: 'rgba(0,0,0,0)',
        colorGroup: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8']
      };
      smcomponents.setTheme(transparent);
      document.getElementsByTagName('body')[0].style.background = 'rgba(0, 0, 0, 0.9)';
    },
    changeStyle3() {
      smcomponents.setTheme('warmGray');
      document.getElementsByTagName('body')[0].style.background = '#191515';
    },
    mapLoaded(e) {
      console.log(e);
      const _this = this;
      axios.get('https://iclient.supermap.io/examples/data/fire.json').then((response) => {
        _this.fireFeatures = response.data;
      });
    },
    changeMapID() {
      this.mapID = '676816598';
      console.log(this.mapID);
    },
    rankThemeCallback(themeLayer, map) {
      // 专题图层 mousemove 事件
      themeLayer.on('mousemove', e => this.showInfoWin(themeLayer, map, e));
    },
    showInfoWin(themeLayer, map, e) {
      // e.target 是图形对象，即数据的可视化对象。
      // 图形对象的 refDataID 属性是数据（feature）的 id 属性，它指明图形对象是由那个数据制作而来;
      // 图形对象的 dataInfo 属性是图形对象表示的具体数据，他有两个属性，field、R 和 value;
      if (e.target && e.target.refDataID && e.target.dataInfo) {
        this.closeInfoWin();
        // 获取图形对应的数据 (feature)
        var fea = themeLayer.getFeatureById(e.target.refDataID);
        var info = e.target.dataInfo;
        // 弹窗内容
        var contentHTML = "<div style='color: #000; background-color: #fff'>";
        contentHTML += '省级行政区名称' + '<br><strong>' + fea.attributes.NAME + '</strong>';
        contentHTML += "<hr style='margin: 3px'>";
        switch (info.field) {
          case 'CON2009':
            contentHTML += '09年居民消费水平' + ' <br/><strong>' + info.value + '</strong>（元）';
            break;
          default:
            contentHTML += 'No Data';
        }
        contentHTML += '</div>';
        var tempPoint = map.unproject(new window.mapboxgl.Point(e.event.x, e.event.y));
        this.popup = new mapboxgl.Popup({ closeOnClick: false })
          .setLngLat([tempPoint.lng, tempPoint.lat])
          .setHTML(contentHTML)
          .addTo(map);
        return;
      }
      this.closeInfoWin();
    },
    closeInfoWin() {
      if (this.popup) {
        this.popup.remove();
      }
    },
    handleInput(e) {
      console.log(`sm-input-input to ${this.input1}`);
      console.dir(e);
    },
    handleInputChange(e) {
      console.log(`sm-input-change to ${this.input1}`);
      console.dir(e);
    },
    handlePressEnter(e) {
      console.log(`sm-input-pressEnter to ${e}`);
      console.dir(e);
    }
  }
};
