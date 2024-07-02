import Vue from 'vue';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';

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
    const _this = this;
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
          const mainWebMapDatas = matchMainWebMap[propKey]();
          if (['getLayerList', 'getAppreciableLayers'].includes(propKey)) {
            const existSourceIds = datas.reduce((list, item) => {
              const ids = _this.collectCatalogsKeys([item]);
              list.push(...ids);
              return list;
            }, []);
            for (const catalogs of mainWebMapDatas) {
              const mainSourceIds = _this.collectCatalogsKeys([catalogs]);
              if (!mainSourceIds.some(id => existSourceIds.some(sourceId => sourceId === id))) {
                datas.push(catalogs);
              }
            }
          }
          if (['getLegendInfo'].includes(propKey)) {
            datas.push(...mainWebMapDatas);
          }
          return () => datas;
        }
        if (['changeItemVisible'].includes(propKey)) {
          return function () {
            const webmaps = webMapCombinations.map(item => item[1]);
            const argumentsList = arguments;
            webmaps.forEach(webmap => {
              webmap[propKey].apply(webmap, argumentsList);
            });
          };
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
  },
  collectCatalogsKeys(catalogs, list = []) {
    for (const data of catalogs) {
      if (data.children && data.children.length > 0) {
        this.collectCatalogsKeys(data.children, list);
        continue;
      }
      list.push(data.renderSource?.id || data.id);
    }
    return list;
  }
});
