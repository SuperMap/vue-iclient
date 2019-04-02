import Vue from 'vue';

export default new Vue({
  mapCache: {},
  webMapCache: {},
  getMap: function (mapTarget) {
    return this.mapCache[mapTarget];
  },
  getAllMaps: function () {
    return this.mapCache;
  },
  setMap: function (mapTarget, map) {
    return this.mapCache[mapTarget] = map;
  },
  getWebMap: function (webmapTarget) {
    return this.webMapCache[webmapTarget];
  },
  getAllWebMap: function () {
    return this.webMapCache;
  },
  setWebMap: function (webmapTarget, webmap) {
    return this.webMapCache[webmapTarget] = webmap;
  },
  getAllWebMapSource: function () {
    let maps = this.getAllWebMap();
    let sources = [];
    for (let map in maps) {
      let layers = maps[map].map.style._layers;
      for (let layer in layers) {
        if (layers[layer].type !== "raster") {
          sources.push(layers[layer].source);
        }
      }
    }
    return sources;
  }
});
