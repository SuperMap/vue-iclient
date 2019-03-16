import Vue from 'vue';

export default new Vue({
  mapCache: {},
  webMapCache: {},
  getMap: function (mapTarget) {
    return this.mapCache[mapTarget];
  },
  setMap: function (mapTarget, map) {
    return this.mapCache[mapTarget] = map;
  },
  getWebMap: function (webmapTarget) {
    return this.webMapCache[webmapTarget];
  },
  setWebMap: function (webmapTarget, webmap) {
    return this.webMapCache[webmapTarget] = webmap;
  },
});
