<template>
  <div id="app">
    <sm-web-map
      server-url="http://support.supermap.com.cn:8092/"
      map-id="1649097980"
      :style="{height:'100%'}"
      @load="mapLoaded"
    >
    </sm-web-map>
  </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import smcomponents from '../../src/leaflet';
import data from './data/data.js';

var host = 'http://support.supermap.com.cn:8090';
export default Vue.extend({
  name: 'App',
  mixins: [data] // demo data
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
