import Vue from 'vue';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';

export default new Vue({
  mapCache: {},
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
  }
});
