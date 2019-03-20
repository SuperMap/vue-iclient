<template>
  <div id="app">
    <!-- <Map :map-options="mapOptions">
      <Chart :datasets="datasets" :chartOptions="chartOptions" ref="chart"></Chart>
    </Map>-->
    <sm-web-map :web-map-options="webMapOptions" map-id="1649097980">
      <sm-indicator title="人均收入" unit="元" :num="12323412" fontColor="red" titleColor="#595959" fontSize="18px" ></sm-indicator>
      <sm-text title="文本框" :fontStyle='{ fontSize: "18px", lineHeight: "18px", color: "#595959", fontWeight: "700", textAlign: "center" }' ></sm-text>
      <sm-time-text :fontStyle='{ fontSize: "18px", color: "#595959", fontWeight: "700" }' timeType="date+second" ></sm-time-text>
      <sm-icon class-name="edit" size="18px" color="red" weight="700"></sm-icon>
      <sm-progress type="circle" :percentage="80" status="success"></sm-progress>
      <sm-search
        position="top-right"
        :layer-names="layerSourceNames"
        :address-match="addressMatch"
        :rest-map="restMapSearch"
        :rest-data="restDataSearch"
        :iportal-data="iportalData"
        :online-local-search="onlineLocalSearch"
      ></sm-search>
      <sm-query
        :iportal-data="iportalDataQuery"
        :rest-data="restDataQuery"
        :rest-map="restMapQuery"
      ></sm-query>
      <!-- <sm-tabel :state='state'></sm-tabel> -->
      <!-- <sm-pan></sm-pan> -->
      <!-- <sm-zoom :show-zoom-slider="true"></sm-zoom> -->
      <!-- <sm-scale position="bottom-left"></sm-scale> -->
      <!-- <sm-mini-map position="bottom-right"></sm-mini-map> -->
      <!-- <sm-chart :chartType="chartType" :datasets="datasets" :chartOptions="chartOptions" position="bottom-right"></sm-chart> -->
      <sm-measure position="top-right"></sm-measure>
      <sm-layer-list position="top-right"/>
      <sm-legend :layer-list="['UNIQUE-民航数-0']" position="bottom-left" :collapsed="false"></sm-legend>
      <!-- <el-button @click="changeType" style="position:absolute;left:210px;z-index:300">修改图表的type:</el-button>
      <el-button @click="changeChartoption" style="position:absolute;left:350px;z-index:300">修改图表的xy轴:</el-button>
      <el-button @click="changeDatasets" style="position:absolute;left:500px;z-index:300">修改图表的datasets:</el-button>-->
    </sm-web-map>
  </div>
</template>

<script>
import widgets from "../src/index";

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
        new widgets.commontypes.iPortalDataParameter({
          url: "http://192.168.12.230:8092/web/datas/1962026684",
          attributeFilter: "SmID>0"
        })
      ],
      restDataQuery: [
        new widgets.commontypes.RestDataParameter({
          url: host + "/iserver/services/data-world/rest/data",
          attributeFilter: "SmID>0",
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
