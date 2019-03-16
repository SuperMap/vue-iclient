<template>
  <div id="app">
    <!-- <Map :map-options="mapOptions">
      <Chart :datasets="datasets" :chartOptions="chartOptions" ref="chart"></Chart>
    </Map>-->
    <sm-web-map :web-map-options="webMapOptions" map-id="1649097980">
      <sm-search
        position="top-right"
        :layer-source-names="layerSourceNames"
        :address-match="addressMatch"
        :rest-map-search="restMapSearch"
        :rest-data-search="restDataSearch"
        :iportal-data='iportalData'
        :online-local-search='onlineLocalSearch'
      ></sm-search>
      <sm-query
        :iportal-data-query="iportalDataQuery"
        :rest-data-query="restDataQuery"
        :rest-map-query="restMapQuery"
      ></sm-query>
      <!-- <sm-tabel :state='state'></sm-tabel> -->
      <sm-pan></sm-pan>
      <sm-zoom :show-zoom-slider="true"></sm-zoom>
      <sm-scale position="bottom-left"></sm-scale>
      <sm-layer-list position="top-right"/>
      <sm-mini-map position="bottom-right"></sm-mini-map>
      <sm-chart :chartType="chartType" :datasets="datasets" :chartOptions="chartOptions" position="bottom-right"></sm-chart>
      <!-- <sm-measure position="top-right"></sm-measure> -->
      <!-- <el-button @click="changeType" style="position:absolute;left:210px;z-index:300">修改图表的type:</el-button>
      <el-button @click="changeChartoption" style="position:absolute;left:350px;z-index:300">修改图表的xy轴:</el-button>
      <el-button @click="changeDatasets" style="position:absolute;left:500px;z-index:300">修改图表的datasets:</el-button> -->

    </sm-web-map>
  </div>
</template>

<script>
import IportalDataParameter from "../src/view/commontypes/IportalDataParameter";
import RestDataParameter from "../src/view/commontypes/RestDataParameter";
import RestMapParameter from "../src/view/commontypes/RestMapParameter";
import AddressMatchParameter from '../src/view/commontypes/AddressMatchParameter';

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
    return {
      iportalDataQuery: [
        new IportalDataParameter({
          url: "http://192.168.12.230:8092/web/datas/1962026684",
          attributeFilter: "SmID>0",
          name: "Iportal Data"
        })
      ],
      restDataQuery: [
        new RestDataParameter({
          url: host + "/iserver/services/data-world/rest/data",
          attributeFilter: "SmID>0",
          dataName: ["World:Countries"],
          name: "Countries"
        })
      ],
      restMapQuery: [
        new RestMapParameter({
          url: host + "/iserver/services/map-world/rest/maps/World",
          attributeFilter: "SmID>0",
          layerName: "Capitals@World.1",
          name: "Capitals"
        })
      ],
      layerSourceNames: ["UNIQUE-民航数-0"],
      addressMatch: [
        new AddressMatchParameter({
          url:
            host + "/iserver/services/addressmatch-Address/restjsr/v1/address",
          name: "Address Match Search"
        })
      ],
      restMapSearch: [
        new RestMapParameter({
          url: host + "/iserver/services/map-world/rest/maps/World",
          layerName: "Capitals@World.1",
          name: "Capitals"
        })
      ],
      restDataSearch: [
        new RestDataParameter({
          url: host + "/iserver/services/data-world/rest/data",
          dataName: ["World:Countries"],
          name: "Countries"
        })
      ],
      iportalData: [
        new IportalDataParameter({
          url: "http://192.168.12.230:8092/web/datas/659519047",
          name: "iportal Data"
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
      chartTitle: '',
      chartType: 'bar',
      datasets: {
        type: "iPortal",
        url: "http://support.supermap.com.cn:8092/web/datas/888186112",
        queryInfo: { attributeFilter: "SmID > 0" }
      },
      chartOptions: [
        {
          xAxis: { field: "SmID", name: "SmID" },
          yAxis: { field: "同比增速%", name: "增速%" }
        }
      ]
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
</style>
