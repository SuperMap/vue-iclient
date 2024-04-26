import Vue from 'vue';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';
import SourceListModel from 'vue-iclient/src/mapboxgl/web-map/SourceListModel';

export default new Vue({
  mapCache: {},
  webMapCache: new Map(),
  getMap: function (mapTarget) {
    return this.mapCache[mapTarget];
  },
  getAllMaps: function () {
    return this.mapCache;
  },
  setMap: function (mapTarget, map) {
    this.mapCache[mapTarget] = map;
  },
  deleteMap: function (mapTarget) {
    if (this.mapCache[mapTarget]) {
      globalEvent.$emit('delete-map', mapTarget);
      delete this.mapCache[mapTarget];
    }
  },
  getWebMap: function (webmapTarget) {
    if (!this.webMapCache.has(webmapTarget)) {
      return;
    }
    const webMapCombinations = this.webMapCache.get(webmapTarget);
    const [_, mainWebmap] = webMapCombinations.find(item => item[0] === webmapTarget);
    const proxyWebMap = new Proxy(mainWebmap, {
      get: function (target, propKey) {
        if (['getAppreciableLayers', 'getLayerList', 'getLegendInfo'].includes(propKey)) {
          const webmaps = webMapCombinations.filter(item => item[0] !== webmapTarget).map(item => item[1]);
          webmaps.reverse();
          const matchMainWebMap = webMapCombinations.find(item => item[0] === webmapTarget)[1];
          let datas = webmaps.reduce((layers, item) => {
            layers.push(...item[propKey]());
            return layers;
          }, []);
          datas.push(...matchMainWebMap[propKey]());
          if (['getAppreciableLayers', 'getLayerList'].includes(propKey)) {
            datas = Array.from(datas.reduce((list, data) => {
              if (!list.has(data.id)) {
                list.set(data.id, data);
              }
              return list;
            }, new Map()).values());
          }
          return () => datas;
        }
        return target[propKey];
      }
    });
    return proxyWebMap;
  },
  getAllWebMap: function () {
    const webMapCache = {};
    for (const target of this.webMapCache.keys()) {
      webMapCache[target] = this.getWebMap(target);
    }
    return webMapCache;
  },
  setWebMap: function (webmapTarget, webmap, identifyId = webmapTarget) {
    if (!this.webMapCache.has(webmapTarget)) {
      this.webMapCache.set(webmapTarget, []);
    }
    this.webMapCache.get(webmapTarget).push([identifyId, webmap]);
  },
  deleteWebMap: function (webmapTarget, identifyId) {
    if (!this.webMapCache.has(webmapTarget)) {
      return;
    }
    if (identifyId) {
      const combinations = this.webMapCache.get(webmapTarget);
      const matchIndex = combinations.findIndex(item => item[0] === identifyId);
      matchIndex > -1 && combinations.splice(matchIndex, 1);
      return;
    }
    this.webMapCache.delete(webmapTarget);
  }
});
