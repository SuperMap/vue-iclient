import Vue from 'vue';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';
import { flattenLayerCatalog, getGroupChildrenLayers, removeLayersByIds, sortLayerCatalog } from '../web-map/GroupUtil';

export default new Vue({
  customLayerCatalogCache: {},
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
            const subDatas = item[propKey]();
            layers.push(...subDatas.filter(item => !item.reused));
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
          if (propKey === 'getLayerList') {
            if (_this.customLayerCatalogCache[webmapTarget]) {
              datas = sortLayerCatalog(datas, _this.customLayerCatalogCache[webmapTarget]);
            }
            _this.updateLayerCatalogsVisible(datas);
            datas = _this.updateImmutableOrderLayers(datas);
          }
          if (propKey === 'getAppreciableLayers') {
            if (_this.customLayerCatalogCache[webmapTarget]) {
              const flatterLayers = flattenLayerCatalog(_this.customLayerCatalogCache[webmapTarget]);
              datas = sortLayerCatalog(datas, flatterLayers.reverse());
            }
            datas = _this.updateImmutableOrderLayers(datas, true);
          }
          return () => datas;
        }
        if (['changeItemVisible', 'setLayersVisible'].includes(propKey)) {
          return function () {
            const webmaps = webMapCombinations.map(item => item[1]);
            const argumentsList = arguments;
            webmaps.forEach(webmap => {
              webmap[propKey]?.apply(webmap, argumentsList);
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
    if (identifyId !== webmapTarget && webmap.map) {
      webmap.map.fire('data', { dataType: 'style' });
    }
  },
  deleteWebMap: function (webmapTarget, identifyId) {
    if (!this.webMapCache.has(webmapTarget)) {
      return;
    }
    if (identifyId) {
      const combinations = this.webMapCache.get(webmapTarget);
      const matchIndex = combinations.findIndex(item => item[0] === identifyId);
      if (matchIndex > -1) {
        const deleteDatas = combinations.splice(matchIndex, 1)[0];
        const customLayerCatalog = this.customLayerCatalogCache[webmapTarget];
        if (customLayerCatalog) {
          this.customLayerCatalogCache[webmapTarget] = null;
          removeLayersByIds(customLayerCatalog, deleteDatas[1].cacheLayerCatalogIds);
          this.customLayerCatalogCache[webmapTarget] = customLayerCatalog;
        }
      }
      return;
    }
    this.webMapCache.delete(webmapTarget);
    delete this.customLayerCatalogCache[webmapTarget];
  },
  collectCatalogsKeys(layerCatalog) {
    const ids = [];
    for (const layer of layerCatalog) {
      if (layer.renderLayers?.length) {
        ids.push(...layer.renderLayers);
      } else if (layer.renderSource?.id) {
        ids.push(layer.renderSource.id);
      } else {
        ids.push(layer.id);
      }
      if (layer.children && layer.children.length > 0) {
        ids.push(...this.collectCatalogsKeys(layer.children));
      }
    }
    return ids;
  },
  setLayerCatalog(webmapTarget, data) {
    this.customLayerCatalogCache[webmapTarget] = data;
  },
  updateLayerCatalogsVisible(catalogs) {
    for (const data of catalogs) {
      if (data.children && data.children.length > 0) {
        const allChildren = getGroupChildrenLayers(data.children);
        if (allChildren.length > 0) {
          // parent 的显隐最终取决于 children，children 全隐藏，parent 隐藏，有个 children 显示，parent 显示
          data.visible = allChildren.some(item => item.visible);
        }
        this.updateLayerCatalogsVisible(data.children);
      }
    }
  },
  updateImmutableOrderLayers(layers, revert) {
    let topLayers = layers.filter(item => item.layerOrder && item.layerOrder.toLowerCase() === 'top');
    const migrationLayers = topLayers.filter(item => item.type === 'MIGRATION');
    const leftTopLayers = topLayers.filter(item => item.type !== 'MIGRATION');
    topLayers = migrationLayers.concat(leftTopLayers);
    const bottomLayers = layers.filter(item => item.layerOrder && item.layerOrder.toLowerCase() === 'bottom');
    const autoLayers = layers.filter(item => !item.layerOrder || item.layerOrder.toLowerCase() === 'auto');
    if (revert) {
      return bottomLayers.concat(autoLayers, topLayers);
    }
    return topLayers.concat(autoLayers, bottomLayers);
  }
});
