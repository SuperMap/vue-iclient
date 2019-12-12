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
  constructor(map) {
    super();
    this.map = map;
    this.cacheViewModel = {};
    this.readyNext = true;
    this.mapQuene = [];
  }
  addLayer({ nodeKey, serverUrl, mapId, withCredentials = false, ignoreBaseLayer = false } = {}) {
    // 通过唯一key来判断是否已经new了实例，用来过滤选中后父节点再选中导致的重复new实例
    if (this.cacheViewModel[nodeKey]) {
      return;
    }

    if (!this.readyNext) {
      this.mapQuene.push({
        nodeKey,
        mapId,
        serverUrl,
        withCredentials,
        ignoreBaseLayer
      });
      return;
    }

    this.webMapViewModel = new WebMapViewModel(
      mapId,
      {
        serverUrl,
        withCredentials
      },
      {},
      this.map
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
    this.webMapViewModel.addWebMap(ignoreBaseLayer);
    this.cacheViewModel[nodeKey] = this.webMapViewModel;
  }
  handleNextMap() {
    this.readyNext = true;
    if (this.mapQuene.length) {
      const { nodeKey, serverUrl, mapId, withCredentials, ignoreBaseLayer } = this.mapQuene.shift();
      this.addLayer({ nodeKey, serverUrl, mapId, withCredentials, ignoreBaseLayer });
    }
  }
  addIServerLayer(url, id) {
    this.map.addLayer({
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [`${url}/zxyTileImage.png?z={z}&x={x}&y={y}`],
        tileSize: 256
      },
      minzoom: 0,
      maxzoom: 22
    });
  }
  removeLayer(nodeKey) {
    this.handleNextMap();
    if (this.mapQuene.length) {
      const index = this.mapQuene.findIndex(map => {
        return map.nodeKey === nodeKey;
      });
      this.mapQuene.splice(index, 1);
    }
    if (this.cacheViewModel[nodeKey]) {
      this.cacheViewModel[nodeKey].removeWebMap();
      delete this.cacheViewModel[nodeKey];
    }
  }
  removeIServerLayer(id) {
    if (this.map.getLayer(id)) {
      this.map.removeLayer(id);
      this.map.removeSource(id);
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
        this.removeIServerLayer(data.mapInfo.id);
      }
    }
    if (data.children && data.children.length) {
      data.children.forEach((node, index) => {
        this.removeLayerLoop(data.children[index]);
      });
    }
  }
}
export default LayerManageViewModel;
