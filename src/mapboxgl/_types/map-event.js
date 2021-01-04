import Vue from 'vue';
import globalEvent from '../../common/_utils/global-event';
import SourceListModel from '../web-map/SourceListModel';

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
  },
  getMapSource: function(mapTarget) {
    let sources = [];
    const map = this.getMap(mapTarget);
    if (map) {
      const sourceListModel = new SourceListModel({
        map
      });
      const sourceList = sourceListModel.getSourceList();
      for (let key in sourceList) {
        if (key) {
          let layers = sourceList[key].layers || [];
          layers.forEach(item => {
            if (item.source && item.type !== 'raster') {
              sources.push(item.source);
            }
          });
        }
      }
    }
    return sources;
  }
});
