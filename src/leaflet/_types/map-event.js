import Vue from 'vue';
import globalEvent from '../../common/_utils/global-event';

export default new Vue({
  mapCache: {},
  webMapCache: {},
  getMap: function(mapTarget) {
    return this.mapCache[mapTarget];
  },
  getAllMaps: function() {
    return this.mapCache;
  },
  setMap: function(mapTarget, map) {
    this.mapCache[mapTarget] = map;
  },
  deleteMap: function(mapTarget) {
    if (this.mapCache[mapTarget]) {
      globalEvent.$emit('delete-map', mapTarget);
      delete this.mapCache[mapTarget];
    }
  },
  getWebMap: function(webmapTarget) {
    return this.webMapCache[webmapTarget];
  },
  getAllWebMap: function() {
    return this.webMapCache;
  },
  setWebMap: function(webmapTarget, webmap) {
    this.webMapCache[webmapTarget] = webmap;
  },
  deleteWebMap: function(webmapTarget) {
    delete this.webMapCache[webmapTarget];
  }
});
