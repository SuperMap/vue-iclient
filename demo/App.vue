<template>
  <div id="app">
    <sm-web-map
      server-url="http://support.supermap.com.cn:8092/"
      :map-id="mapID"
      :style="{height:'700px'}"
      @load="mapLoaded"
    >
      <sm-pan></sm-pan>
      <sm-zoom :show-zoom-slider="true"></sm-zoom>
      <sm-layer-list position="top-right"/>
      <sm-legend :layerNames="['UNIQUE-民航数-0']" position="bottom-right" :collapsed="false"></sm-legend>
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
      <sm-mini-map position="bottom-right"></sm-mini-map>
      <sm-measure position="top-right"></sm-measure>
      <sm-raster-tile-layer v-bind="rasteLayerOptions"></sm-raster-tile-layer>
      <sm-vector-tile-layer
        style-options="http://iclient.supermap.io/iserver/services/map-Population/rest/maps/PopulationDistribution/tileFeature/vectorstyles.json?type=MapBox_GL&styleonly=true"
      ></sm-vector-tile-layer>
    </sm-web-map>
    <!-- <sm-web-map
      :mapOptions='mapOptions'
      :style="{height:'700px'}"
      @load="mapLoaded"
    ></sm-web-map>-->
    <sm-liquid-fill :value="0.3" :waveCount="1" position="bottom-right"/>
    <sm-indicator title="人均收入" unit="元" :num="12323412" fontSize="18"></sm-indicator>
    <sm-text
      title="文本框"
      :fontStyle="{ fontSize: '18', lineHeight: '18', color:'#73b9ac', fontWeight: '700', textAlign: 'center' }"
    ></sm-text>
    <sm-time-text :fontStyle="{ fontSize: '18', fontWeight: '700' }" timeType="date+second+week"></sm-time-text>
    <sm-progress type="circle" :percent="80"></sm-progress>
    <div class="changeTheme">
      <a-button @click="changeStyle" type="primary">深色主题</a-button>
      <a-button @click="changeStyle1">浅色主题</a-button>
      <a-button @click="changeMapID">changeMapID</a-button>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue } from 'vue-property-decorator';
import smcomponents from '../src/mapboxgl';
import data from './data/data.js';

var host = window.isLocal ? window.server : 'http://support.supermap.com.cn:8090';
export default Vue.extend({
  name: 'App',
  mixins: [data]  // demo data
});
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
