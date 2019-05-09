<template>
  <div id="app">
    <sm-map :map-options="mapOptions">
      <!-- <sm-raster-layer v-bind="rasteLayerOptions"></sm-raster-layer>
      <sm-mapv-layer :data-set="dataSet" :mapv-options="mapvOptions"></sm-mapv-layer>
      <sm-deckgl-layer :layer-type-id="layerTypeId" :deckgl-options="deckglOptions"></sm-deckgl-layer> -->
      <!-- <sm-data-flow-layer
        data-flow-url="ws://iclsvrws.supermap.io/iserver/services/dataflowTest/dataflow"
        register-token="0ra2250-rPu6ZnqHPKqcqDjGkDGDv3bg5HHy1SNNXf79OlN0ArG07bq3cGFz0v-nfBm2RAnYJ3LGBsuiptH43g.."
      ></sm-data-flow-layer> -->
      <!-- <sm-heatmap-layer :data='heatMapData'></sm-heatmap-layer> -->
      <!-- <sm-echarts-layer :echartsOptions="echartsOptions"></sm-echarts-layer> -->
      <!-- <sm-cluster-layer :data='clusterLayerData'></sm-cluster-layer> -->
    </sm-map>
    <!-- 深色 -->
    <!-- <sm-web-map :web-map-options="webMapOptions" map-id="1649097980"> -->
    <!-- <sm-indicator title="人均收入" unit="元" :num="12323412" fontSize="18" ></sm-indicator>
      <sm-text title="文本框" :fontStyle='{ fontSize: "18", lineHeight: "18", color:"#73b9ac", fontWeight: "700", textAlign: "center" }' ></sm-text>
      <sm-time-text :fontStyle='{ fontSize: "18", fontWeight: "700" }' timeType="date+second" ></sm-time-text>
      <sm-icon class-name="edit" size="20" weight="800" background='unset' text-color='#333'></sm-icon>
      <sm-progress type="circle" :percentage="80"></sm-progress>
      <sm-layer-list position="top-right"/>
      <sm-legend :layerNames="['UNIQUE-民航数-0']" position="bottom-left" :collapsed="false"></sm-legend>
    <sm-liquid-fill :value="0.3" :waveCount="1" position="bottom-right"/>-->
    <!-- <sm-zoom :show-zoom-slider="true"></sm-zoom>
      <sm-text title="文本框" :fontStyle='{ fontSize: "18", lineHeight: "18", color:"#73b9ac", fontWeight: "700", textAlign: "center" }' ></sm-text>
      <sm-time-text :fontStyle='{ fontSize: "18", fontWeight: "700" }' timeType="date+second" ></sm-time-text>
      <sm-icon class-name="edit" size="20" weight="800" background='unset' text-color='#333'></sm-icon>
      <sm-indicator title="人均收入" unit="元" :num="12323412" fontSize="18" ></sm-indicator>
      <sm-query
        :iportal-data="iportalDataQuery"
        :rest-data="restDataQuery"
        :rest-map="restMapQuery"
      ></sm-query>
      <sm-search
        position="top-right"
        :layer-names="layerSourceNames"
        :address-match="addressMatch"
        :rest-map="restMapSearch"
        :rest-data="restDataSearch"
        :iportal-data="iportalData"
        :online-local-search="onlineLocalSearch"
      ></sm-search>
      <sm-pan></sm-pan>
      <sm-progress type="circle" :percentage="80"></sm-progress>
      <sm-mini-map position="bottom-right"></sm-mini-map>
      <sm-measure position="top-right"></sm-measure>
      <sm-liquid-fill :value="0.3" :waveCount="1" position="bottom-right" :style='{width:"100px"}'/>
      <sm-legend :layerNames="['UNIQUE-民航数-0']" position="bottom-left" :collapsed="false"></sm-legend>
      <sm-layer-list position="top-right"/>
      <sm-chart
        :chartType="chartType"
        :datasets="datasets"
        :chartOptions="chartOptions"
        position="bottom-right"
    ></sm-chart>-->
    <!-- 浅色 -->

    <!-- <sm-query
        :iportal-data="iportalDataQuery"
        :rest-data="restDataQuery"
        :rest-map="restMapQuery"
      ></sm-query>
      <sm-search
        position="top-right"
        :layer-names="layerSourceNames"
        :address-match="addressMatch"
        :rest-map="restMapSearch"
        :rest-data="restDataSearch"
        :iportal-data="iportalData"
        :online-local-search="onlineLocalSearch"
      ></sm-search>
      <sm-pan></sm-pan>
      <sm-zoom :show-zoom-slider="true"></sm-zoom>
      <sm-scale position="bottom-left"></sm-scale>
      <sm-mini-map position="bottom-right"></sm-mini-map>
    <sm-measure position="top-right"></sm-measure>-->

    <!-- <el-button @click="changeType" style="position:absolute;left:210px;z-index:300">修改图表的type:</el-button>
      <el-button @click="changeChartoption" style="position:absolute;left:350px;z-index:300">修改图表的xy轴:</el-button>
    <el-button @click="changeDatasets" style="position:absolute;left:500px;z-index:300">修改图表的datasets:</el-button>-->
    <!-- <sm-raster-layer v-bind="rasteLayerOptions"></sm-raster-layer>
    <sm-vector-tile-layer style-options="http://iclient.supermap.io/iserver/services/map-Population/rest/maps/PopulationDistribution/tileFeature/vectorstyles.json?type=MapBox_GL&styleonly=true"></sm-vector-tile-layer>-->
    <!-- <sm-data-flow-layer dataFlowUrl='ws://iclsvrws.supermap.io/iserver/services/dataflowTest/dataflow'></sm-data-flow-layer> -->
    <!-- </sm-web-map> -->
    <!-- <sm-chart
        :chartType="chartType"
        :datasets="datasets"
        :chartOptions="chartOptions"
        position="bottom-right"
    ></sm-chart>-->
    <!-- "http://192.168.12.230:8092/iportal/web/scenes/2065175708" -->
    <!-- <sm-web-scene
      scene-url="http://support.supermap.com.cn:8090/iserver/services/3D-CBD/rest/realspace"
      :scan-effect='scanEffect'
      :navigation='false'
    ></sm-web-scene>-->
    <!-- <sm-web-scene scene-url = 'http://192.168.12.230:8092/iportal/web/scenes/2065175708'></sm-web-scene> -->

    <div class="changeTheme">
      <el-button @click="changeStyle" type="primary" size="mini">深色主题</el-button>
      <el-button @click="changeStyle1" type="success" size="mini">浅色主题</el-button>
    </div>
  </div>
</template>

<script>
import widgets from "../src/index";
import demoData from './data/demo.json';
import earthquake from './data/earthquake.json';
export default {
  name: "app",
  data() {
    var host = window.isLocal
      ? window.server
      : "http://support.supermap.com.cn:8090";
    var attribution =
      "<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox </a>" +
      " with <span>© <a href='http://iclient.supermap.io' target='_blank'>SuperMap iClient</a> | </span>" +
      " Map Data <span>© <a href='http://support.supermap.com.cn/product/iServer.aspx' target='_blank'>SuperMap iServer</a></span> ";
    var randomCount = 1000;

    var data = [];

    var citys = demoData.citys;

    // 构造数据
    while (randomCount--) {
      var cityCenter = mapv.utilCityCenter.getCenterByCityName(
        citys[parseInt(Math.random() * citys.length)]
      );
      data.push({
        geometry: {
          type: "Point",
          coordinates: [ cityCenter.lng - 2 + Math.random() * 4, cityCenter.lat - 2 + Math.random() * 4 ]
        },
        count: 30 * Math.random()
      });
    }

    var dataSet = new mapv.DataSet(data);

    var options = {
      fillStyle: "rgba(55, 50, 250, 0.8)",
      shadowColor: "rgba(255, 250, 50, 1)",
      shadowBlur: 20,
      max: 100,
      size: 50,
      label: { show: true, fillStyle: "white" },
      globalAlpha: 0.5,
      gradient: {
        0.25: "rgb(0,0,255)",
        0.55: "rgb(0,255,0)",
        0.85: "yellow",
        1.0: "rgb(255,0,0)"
      },
      draw: "honeycomb"
    };

    var echartsLayerData = demoData.echartsLayerData;
    var geoCoordMap = demoData.geoCoordMap

    var convertData = function(data) {
      var res = [];
      for (var i = 0; i < data.length; i++) {
        var geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
          res.push({ name: data[i].name, value: geoCoord.concat(data[i].value) });
        }
      }
      return res;
    };

    var echartsOptions = {
      animation: false,
      title: {
        text: '11',
        subtext: "data from PM25.in",
        sublink: "http://www.pm25.in",
        left: "center",
        textStyle: { color: "#fff" } 
      },
      tooltip: { trigger: "item" },
      legend: { orient: "vertical", y: "bottom", x: "right", data: ["pm2.5"], textStyle: { color: "#fff" } },
      GLMap: {},

      series: [
        {
          name: "pm2.5",
          type: "scatter",
          coordinateSystem: "GLMap",
          data: convertData(echartsLayerData),
          symbolSize: function(val) {
            return val[2] / 10;
          },
          label: {
            normal: { formatter: "{b}", position: "right", show: false },
            emphasis: { show: true }
          },
          itemStyle: { normal: { color: "#ddb926" } }
        },
        {
          name: "Top 5",
          type: "effectScatter",
          coordinateSystem: "GLMap",
          data: convertData( echartsLayerData .sort(function(a, b) { return b.value - a.value; }) .slice(0, 6) ),
          symbolSize: function(val) { return val[2] / 10; },
          showEffectOn: "render",
          rippleEffect: { brushType: "stroke" },
          hoverAnimation: true,
          label: { normal: { formatter: "{b}", position: "right", show: true } },
          itemStyle: { normal: { color: "#f4e925", shadowBlur: 10, shadowColor: "#333" } },
          zlevel: 1
        }
      ]
    };

    // 模拟 dataflow 实时数据
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

    return {
      styleObject: {
        width: "600px"
      },
      scanEffect: {
        status: true,
        type: "line",
        period: 2000,
        speed: 500
      },
      iportalDataQuery: [
        new widgets.commontypes.iPortalDataParameter({
          url: "http://192.168.12.230:8092/web/datas/1962026684",
          attributeFilter: "SmID>0"
        })
      ],
      restDataQuery: [
        new widgets.commontypes.RestDataParameter({
          url: host + "/iserver/services/data-world/rest/data",
          attributeFilter: "NAME='Huang He'",
          dataName: ["World:Countries"]
        })
      ],
      restMapQuery: [
        new widgets.commontypes.RestMapParameter({
          url: host + "/iserver/services/map-world/rest/maps/World",
          attributeFilter: "SmID>0",
          layerName: "Capitals@World.1"
        })
      ],
      rasteLayerOptions: {
        name: "我的栅格图层",
        opacity: 0.8,
        visible: true,
        tiles: [
          host +
            "/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}"
        ],
        mapUrl: host + "/iserver/services/map-china400/rest/maps/China"
      },
      layerSourceNames: ["UNIQUE-民航数-0"],
      addressMatch: [
        new widgets.commontypes.AddressMatchParameter({
          url:
            host + "/iserver/services/addressmatch-Address/restjsr/v1/address"
        })
      ],
      restMapSearch: [
        new widgets.commontypes.RestMapParameter({
          url: host + "/iserver/services/map-world/rest/maps/World",
          layerName: "Capitals@World.1"
        })
      ],
      restDataSearch: [
        new widgets.commontypes.RestDataParameter({
          url: host + "/iserver/services/data-world/rest/data",
          dataName: ["World:Countries"]
        })
      ],
      iportalData: [
        new widgets.commontypes.iPortalDataParameter({
          url: "http://192.168.12.230:8092/web/datas/659519047"
        })
      ],
      onlineLocalSearch: {
        enable: true,
        city: "北京市"
      },
      mapOptions: {
        container: "map", // container id
        style: {
          version: 8,
          sources: {
            "raster-tiles": {
              attribution: attribution,
              type: "raster",
              tiles: [
                host +
                  "/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}"
              ],
              tileSize: 256
            }
          },
          layers: [
            {
              id: "simple-tiles",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: [120.143, 30.236],
        zoom: 3
      },
      webMapOptions: {
        server: "http://support.supermap.com.cn:8092/"
      },
      chartTitle: "",
      chartType: "bar",
      datasets: {
        type: "iServer",
        url:
          "http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R",
        //url: "http://support.supermap.com.cn:8092/web/datas/888186112",
        queryInfo: { attributeFilter: "SmID > 0" }
      },
      chartOptions: {
        // backgroundColor:"",
        // axisColor:"",
        // colorGradient:[],
        xFieldStatistical: true,
        xAxisLabelRotate: true,
        yAxisLabelRotate: true,
        legendPosition: "top", //none top bottom left right topleft topright bottomleft bottomright
        xAxisName: "",
        yAxisName: "",
        // padding: {
        //   top: 50,
        //   bottom: 50,
        //   left: 50,
        //   right: 50
        // },
        xAxis: "LANDTYPE",
        yAxis: ["AREA", "AREA_1"]
      },
      dataSet,
      mapvOptions: options,
      layerTypeId: "hexagon-layer",
      deckglOptions: {
      },
      echartsOptions:echartsOptions,
      heatMapData:earthquake,
      heatMapLayerPaint:{
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
      clusterLayerData:earthquake
    };
  },
  methods: {
    // changeDatasets() {
    //   this.datasets = {
    //     type: "iPortal",
    //     url: "http://support.supermap.com.cn:8092/web/datas/1920557079",
    //     queryInfo: { attributeFilter: "SmID > 0" }
    //   };
    // },
    // changeType(){
    //   this.chartType="scatter"
    // },
    // changeChartoption(){
    //   this.chartOptions =[
    //     {
    //       xAxis: { field: "SmID", name: "我变了" },
    //       yAxis: { field: "同比增速%", name: "我变了" }
    //     }
    //   ]
    // }

    changeStyle() {
      widgets.setTheme("dark");
    },
    changeStyle1() {
      widgets.setTheme("light");
    }
  },
  created() {
    $.get('../static/sf-bike-parking.json', res => {
        this.deckglOptions = {
          data: res,
          props: {
              extruded: true, //是否拉伸要素，默认为 false；
              radius: 200, //六边形半径值，默认为 1000
              elevationScale: 4, //高程乘数
              coverage: 0.8 //六边形半径乘数，介于0 - 1之间。六边形的最终半径通过覆盖半径计算。
              //还可配置的参数：
              //colorRange 色带，默认为 [[255,255,178,255],[254,217,118,255],[254,178,76,255],[253,141,60,255],[240,59,32,255],[189,0,38,255]]
          },
          callback: {
              getPosition: d => d.COORDINATES,
          }
        }
      });
  }
};
</script>
<style lang='scss'>
body {
  margin: 0;
  // overflow: hidden;
  background: #fff;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}
#app {
  margin: 0 auto;
  width: 100%;
  height: 100%;
}
.changeTheme {
  position: absolute;
  left: 50%;
  transform: translate(-100px);
  bottom: 20px;
}
</style>
