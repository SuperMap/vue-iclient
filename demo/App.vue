<template>
  <div id="app">
    <!-- <Map :map-options="mapOptions">
      <Chart :datasets="datasets" :chartOptions="chartOptions" ref="chart"></Chart>
    </Map>-->
    <sm-web-map :web-map-options="webMapOptions" map-id="1649097980">
      <sm-pan></sm-pan>
      <sm-zoom :show-zoom-slider="true"></sm-zoom>
      <sm-scale position="bottom-left"></sm-scale>
      <sm-layer-list position="top-right" />
      <sm-mini-map position="bottom-right"></sm-mini-map>
      <sm-chart :datasets="datasets" :chartOptions="chartOptions"></sm-chart>
    </sm-web-map>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    var host = window.isLocal
      ? window.server
      : 'http://support.supermap.com.cn:8090';
    var attribution =
      "<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox </a>" +
      " with <span>© <a href='http://iclient.supermap.io' target='_blank'>SuperMap iClient</a> | </span>" +
      " Map Data <span>© <a href='http://support.supermap.com.cn/product/iServer.aspx' target='_blank'>SuperMap iServer</a></span> ";
    return {
      mapOptions: {
        container: 'map', // container id
        style: {
          version: 8,
          sources: {
            'raster-tiles': {
              attribution: attribution,
              type: 'raster',
              tiles: [
                host +
                  '/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
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
      },
      webMapOptions: {
        server: 'http://support.supermap.com.cn:8092/'
      },
      datasets: {
        type: 'iPortal',
        url: 'http://support.supermap.com.cn:8092/web/datas/1920557079',
        queryInfo: { attributeFilter: 'SmID > 0' }
      },
      chartOptions: [
        {
          xAxis: { field: 'SmID', name: 'SmID' },
          yAxis: { field: '同比增速%', name: '同比增速%' }
        }
      ]
    };
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
