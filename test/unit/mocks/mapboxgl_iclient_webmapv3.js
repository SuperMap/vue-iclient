var Evented = require('mapbox-gl/src/util/evented');
var { mapboxgl } = require('./mapboxgl');

class WebMapV3 extends Evented {
  constructor(mapId, options, mapOptions) {
    super();
    this.mapId = mapId;
    this.options = options;
    this.mapOptions = mapOptions;
    this._mapResourceInfo = {};
  }

  initializeMap(mapInfo, map) {
    this._mapInfo = mapInfo;
    if (map) {
      this.map = map;
      this._initLayers();
      return;
    }
    let {
      name,
      crs,
      center = new mapboxgl.LngLat(0, 0),
      zoom = 0,
      bearing = 0,
      pitch = 0,
      minzoom,
      maxzoom,
      sprite = ''
    } = this._mapInfo;
    center = this.mapOptions.center || center;
    zoom = this.mapOptions.zoom || zoom;
    bearing = this.mapOptions.bearing || bearing;
    pitch = this.mapOptions.pitch || pitch;
    // 初始化 map
    const mapOptions = {
      container: this.options.target || 'map',
      crs,
      center,
      zoom,
      style: {
        sprite,
        name,
        version: 8,
        sources: {},
        layers: []
      },
      minzoom,
      maxzoom,
      bearing,
      pitch,
      localIdeographFontFamily: ''
    };
    this.map = new mapboxgl.Map(mapOptions);
    this._sprite = sprite;
    this.fire('mapinitialized', { map: this.map });
    this.map.on('load', () => {
      this._initLayers();
    });
  }

  getLegendInfo() {}

  clean() {}

  _initLayers() {
    if (this.map && this.map.getCRS && this.map.getCRS().epsgCode !== this._mapInfo.crs) {
      this.fire('projectionisnotmatch');
      return;
    }
    if (typeof this.mapId !== 'string') {
      this._addLayersToMap();
      return;
    }
    SuperMap.FetchRequest.get(`${this.options.server}web/maps/${this.mapId}`, null, {
      withCredentials: this.options.withCredentials
    })
      .then(response => response.json())
      .then(relatedInfo => {
        this._mapResourceInfo = JSON.parse(relatedInfo.projectInfo);
        this._addLayersToMap();
      });
  }

  _addLayersToMap() {
    const { sources, layers } = this._mapInfo;
    layers.forEach(layer => {
      layer.source && !this.map.getSource(layer.source) && this.map.addSource(layer.source, sources[layer.source]);
      this.map.addLayer(layer);
    });
    this._appreciableLayers = this._generateLayers();
    this.fire('addlayerssucceeded', {
      map: this.map,
      mapparams: {
        title: this._mapInfo.name,
        description: ''
      },
      layers: this._appreciableLayers
    });
  }

  _generateLayers() {
    const { catalogs = [] } = this._mapResourceInfo;
    const originLayers = this._getLayerInfosFromCatalogs(catalogs);
    const layers = originLayers.map((layer) => {
      const { title } = layer;
      const layerFromMapInfo = this._mapInfo.layers.find((item) => {
        return item.id === layer.id;
      });
      let dataType = '';
      let dataId = '';
      for (const data of this._mapResourceInfo.datas) {
        const matchData = data.datasets.find((dataset) => dataset.msDatasetId === layer.msDatasetId);
        if (matchData) {
          dataType = data.sourceType;
          dataId = matchData.datasetId;
          break;
        }
      }
      const overlayLayers = {
        dataSource: {
          serverId: dataId,
          type: dataType
        },
        layerID: layer.id,
        layerType: layerFromMapInfo.type === 'raster' ? 'raster' : 'vector',
        type: layerFromMapInfo.type,
        name: title
      };
      return overlayLayers;
    });
    return layers;
  }

  _getLayerInfosFromCatalogs(catalogs) {
    const results = [];
    for (let i = 0; i < catalogs.length; i++) {
      const { catalogType, children, visible } = catalogs[i];
      if (catalogType === 'layer' && visible) {
        results.push(catalogs[i]);
      }
      if (catalogType === 'group' && children && children.length > 0) {
        const result = this._getLayerInfosFromCatalogs(children);
        results.push(...result);
      }
    }
    return results;
  }

  getLayerCatalog() {
    return  [{id: 'test', type: 'fill', title:'test', visible: true, renderLayers:['test'], renderSource:{id:'s1', type: 'vector'}, dataSource: {}}]
  }
}

module.exports = WebMapV3;
