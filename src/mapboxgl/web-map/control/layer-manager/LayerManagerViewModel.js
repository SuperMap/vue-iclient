import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
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
    this.readyNext = true; // 是否可以开始实例化下一个vm
    this.mapQuene = [];
  }

  setMap(mapInfo) {
    const { map, mapTarget, webmap } = mapInfo;
    this.map = map;
    this.mapTarget = mapTarget;
    this.mainWebMap = webmap;
  }

  addLayer({ nodeKey, serverUrl, mapId, withCredentials = false, layerFilter, proxy, mapOptions = {} } = {}) {
    // 通过唯一key来判断是否已经new了实例，用来过滤选中后父节点再选中导致的重复new实例
    if (this.cacheMaps[nodeKey]) {
      return;
    }

    if (!this.readyNext) {
      if (!this.mapQuene.some(item => item.nodeKey === nodeKey)) {
        this.mapQuene.push({
          nodeKey,
          mapId,
          serverUrl,
          withCredentials,
          layerFilter,
          proxy
        });
      }
      return;
    }
    const webMapViewModel = new WebMapViewModel(
      mapId,
      {
        serverUrl,
        withCredentials,
        proxy,
        target: this.mapTarget,
        map: this.map,
        layerFilter
      },
      mapOptions
    );

    this.webMapViewModel = webMapViewModel;

    // 设置 readyNext 为 false
    this.readyNext = false;
    this.webMapViewModel.on({
      addlayerssucceeded: () => {
        // 设置 readyNext 为 true
        // 判断 是否缓存数组里有值，取出最新的，调用this.addLayer();
        this.fire('layersadded', { nodeKey, nodeValue: webMapViewModel });
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
    const projection = this.map.getCRS().epsgCode;
    const [leftBottom, rightTop] = this.map.getBounds().toArray();
    const center = this.map.getCenter().toArray();
    const mapInfo = {
      extent: {
        leftBottom: {
          x: leftBottom[0],
          y: leftBottom[1]
        },
        rightTop: {
          x: rightTop[0],
          y: rightTop[1]
        }
      },
      level: this.map.getZoom(),
      center: {
        x: center[0],
        y: center[1]
      },
      baseLayer: {
        layerType: 'TILE',
        name: nodeKey,
        url
      },
      layers: [],
      description: '',
      projection,
      title: 'dv-tile',
      version: '2.3.0'
    };
    this.addLayer({ nodeKey, mapId: mapInfo });
  }

  addMapStyle(mapOptions, nodeKey) {
    this.addLayer({ nodeKey, mapId: null, serverUrl: null, mapOptions });
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
    this.fire('layersremoved', { nodeKey });
  }

  removeIServerLayer(nodeKey) {
    this.removeLayer(nodeKey);
  }

  removeMapStyle(nodeKey) {
    this.removeLayer(nodeKey);
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
      } else if (data.mapInfo.mapOptions) {
        this.removeMapStyle(data.key);
      } else if (data.mapInfo.serviceUrl) {
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
    Object.keys(this.cacheMaps).forEach(nodeKey => {
      this.removeLayer(nodeKey);
    });
    this.cacheMaps = {};
  }

  getCacheMaps() {
    return this.cacheMaps;
  }
}
export default LayerManageViewModel;
