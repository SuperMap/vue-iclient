import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import WebMapViewModel from '../../WebMapViewModel';
/**
 * @class LayerManageViewModel
 * @description LayerManage viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层管理
 * @extends mapboxgl.Evented
 */
class LayerManageViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this.cacheMaps = {};
    this.cacheIServerMaps = {};
    this.readyNext = true; // 是否可以开始实例化下一个vm
    this.mapQuene = [];
  }

  setMap(mapInfo) {
    const { map, mapTarget } = mapInfo;
    this.map = map;
    this.mapTarget = mapTarget;
  }

  addLayer({ nodeKey, serverUrl, mapId, withCredentials = false, layerFilter } = {}) {
    // 通过唯一key来判断是否已经new了实例，用来过滤选中后父节点再选中导致的重复new实例
    if (this.cacheMaps[nodeKey]) {
      return;
    }

    if (!this.readyNext) {
      this.mapQuene.push({
        nodeKey,
        mapId,
        serverUrl,
        withCredentials,
        layerFilter
      });
      return;
    }
    this.webMapViewModel = new WebMapViewModel(
      mapId,
      {
        serverUrl,
        withCredentials,
        target: this.mapTarget
      },
      {},
      this.map,
      layerFilter
    );

    // 设置 readyNext 为 false
    this.readyNext = false;
    this.webMapViewModel.on({
      addlayerssucceeded: e => {
        // 设置 readyNext 为 true
        // 判断 是否缓存数组里有值，取出最新的，调用this.addLayer();
        this.handleNextMap();
      }
    });
    // this.webMapViewModel.addWebMap(layerFilter);
    this.cacheMaps[nodeKey] = this.webMapViewModel;
  }
  handleNextMap() {
    this.readyNext = true;
    if (this.mapQuene.length) {
      const { nodeKey, serverUrl, mapId, withCredentials, layerFilter } = this.mapQuene.shift();
      this.addLayer({ nodeKey, serverUrl, mapId, withCredentials, layerFilter });
    }
  }
  addIServerLayer(url, nodeKey) {
    if (this.cacheIServerMaps[nodeKey]) {
      return;
    }
    const epsgCode = this.map.getCRS().epsgCode.split(':')[1];
    this.map.addLayer({
      id: nodeKey,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [url],
        tileSize: 256,
        rasterSource: 'iserver',
        prjCoordSys: { epsgCode }
      },
      minzoom: 0,
      maxzoom: 22
    });
    this.cacheIServerMaps[nodeKey] = true;
  }
  removeLayer(nodeKey) {
    this.handleNextMap();
    if (this.mapQuene.length) {
      const index = this.mapQuene.findIndex(map => {
        return map.nodeKey === nodeKey;
      });
      this.mapQuene.splice(index, 1);
    }
    if (this.cacheMaps[nodeKey]) {
      this.cacheMaps[nodeKey].cleanLayers();
      delete this.cacheMaps[nodeKey];
    }
  }
  removeIServerLayer(nodeKey) {
    if (this.cacheIServerMaps[nodeKey]) {
      delete this.cacheIServerMaps[nodeKey];
    }
    if (this.map && this.map.getLayer(nodeKey)) {
      this.map.removeLayer(nodeKey);
      this.map.removeSource(nodeKey);
    }
  }
  eachNode(datas, callback) {
    for (let i = 0; i < datas.length; i++) {
      callback(datas[i], datas);
      if (datas[i].children) {
        this.eachNode(datas[i].children, callback);
      }
    }
    return datas;
  }
  removeLayerLoop(data) {
    if (data.mapInfo) {
      if (data.mapInfo.mapId) {
        this.removeLayer(data.key);
      } else {
        this.removeIServerLayer(data.key);
      }
    }
    if (data.children && data.children.length) {
      data.children.forEach((node, index) => {
        this.removeLayerLoop(data.children[index]);
      });
    }
  }
  removed() {
    this.cacheMaps = {};
    this.cacheIServerMaps = {};
  }
}
export default LayerManageViewModel;
