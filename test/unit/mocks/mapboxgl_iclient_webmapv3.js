var Evented = require('mapbox-gl/src/util/evented');
var { mapboxgl } = require('./mapboxgl');

class WebMapV3 extends Evented {
  constructor(mapId, options, mapOptions) {
    super();
    this.mapId = mapId;
    this.options = options;
    this.mapOptions = mapOptions;
    this._mapResourceInfo = {};
    this._layerIdRenameMapList = [];
    this._layerCatalogsRenameMapList = [];
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

  getAppreciableLayers() {
    return this._generateLayers();
  }

  getLayerCatalog() {
    return this._generateLayerCatalog();
  }

  copyLayer() {}

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
    const { sources, layers, metadata } = this._mapInfo;
    layers.forEach(layer => {
      layer.source && !this.map.getSource(layer.source) && this.map.addSource(layer.source, sources[layer.source]);
      this.map.addLayer(layer);
    });
    const matchErrorLayer = layers.find(item => item.metadata.typeFailure);
    if (matchErrorLayer) {
      this.fire('getlayersfailed', {
        error:
          matchErrorLayer.metadata.typeFailure === 'string'
            ? 'happen error'
            : new TypeError('t.map is not a function'),
        map: this.map
      });
      return;
    }
    this._layerIdRenameMapList = layers.map(item => ({ renderId: item.id }));
    this._layerCatalogsRenameMapList = metadata.layerCatalog;
    const appreciableLayers = this.getAppreciableLayers();
    const matchLayers = appreciableLayers.filter(item => layers.some(layer => layer.id === item.id));
    this.fire('addlayerssucceeded', {
      map: this.map,
      mapparams: {
        title: this._mapInfo.name,
        description: ''
      },
      layers: matchLayers
    });
  }

  _generateLayers() {
    const layersOnMap = this.map.getStyle().layers.map(layer => this.map.getLayer(layer.id));
    const overlayLayers = Object.values(this.map.overlayLayersManager).reduce((layers, overlayLayer) => {
      if (overlayLayer.id) {
        layers.push({
          id: overlayLayer.id,
          visibility: overlayLayer.visibility || 'visible',
          source: typeof overlayLayer.source === 'object' ? overlayLayer.id : overlayLayer.source,
          type: overlayLayer.type
        });
      }
      return layers;
    }, []);
    const allLayersOnMap = layersOnMap
      .concat(overlayLayers)
      .filter(layer => !this._appendLayers || this._layerIdRenameMapList.some(item => item.renderId === layer.id));
    const { catalogs = [], datas = [] } = this._mapResourceInfo;
    const originLayers = this._getLayerInfosFromCatalogs(catalogs);
    const layers = allLayersOnMap.map(layer => {
      const matchOriginLayer = this._layerIdRenameMapList.find(item => item.renderId === layer.id) || {};
      const matchLayer = originLayers.find(item => item.id === matchOriginLayer.originId) || {};
      const { title = layer.id, visualization, layersContent, msDatasetId } = matchLayer;
      let dataType = '';
      let dataId = '';
      for (const data of datas) {
        const matchData = data.datasets.find(dataset => dataset.msDatasetId === msDatasetId);
        if (matchData) {
          dataType = data.sourceType;
          dataId = matchData.datasetId;
          break;
        }
      }
      const sourceOnMap = this.map.getSource(layer.source);
      const overlayLayers = {
        id: layer.id,
        type: layer.type,
        title,
        visible: layer.visibility ? layer.visibility === 'visible' : true,
        renderSource: {
          id: layer.source,
          type: sourceOnMap && sourceOnMap.type,
          sourceLayer: layer.sourceLayer
        },
        renderLayers: this._getRenderLayers(layersContent, layer.id),
        dataSource: {
          serverId: dataId,
          type: dataType
        },
        themeSetting: {}
      };
      if (visualization) {
        const styleSettings = this._parseRendererStyleData(visualization.renderer);
        const defaultStyleSetting = styleSettings[0];
        if (defaultStyleSetting) {
          let themeField = '';
          if (defaultStyleSetting.type === 'heat') {
            themeField = defaultStyleSetting.field;
          } else if (defaultStyleSetting.color) {
            themeField = defaultStyleSetting.color.field;
          }
          if (themeField) {
            overlayLayers.themeSetting = {
              themeField
            };
          }
        }
      }
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

  _generateLayerCatalog() {
    const layerIdsFromCatalog = this._layerCatalogsRenameMapList.reduce((ids, item) => {
      const list = this._collectChildrenKey([item], 'id');
      ids.push(...list);
      return ids;
    }, []);
    const appreciableLayers = this.getAppreciableLayers();
    const extraLayers = appreciableLayers.filter(layer => !layerIdsFromCatalog.some(id => id === layer.id));
    const layerCatalogs = this._layerCatalogsRenameMapList.concat(extraLayers);
    const formatLayerCatalog = this._createFormatCatalogs(layerCatalogs, appreciableLayers);
    this._updateLayerVisible(formatLayerCatalog);
    return formatLayerCatalog;
  }

  _createFormatCatalogs(catalogs, appreciableLayers) {
    const formatCatalogs = catalogs.map(catalog => {
      let formatItem;
      const { id, title, type, visible, children, parts } = catalog;
      if (catalog.type === 'group') {
        formatItem = {
          children: this._createFormatCatalogs(children, appreciableLayers),
          id,
          title,
          type,
          visible
        };
      } else {
        const matchLayer = appreciableLayers.find(layer => layer.id === id);
        formatItem = {
          dataSource: matchLayer.dataSource,
          id,
          type: matchLayer.type,
          title,
          visible: matchLayer.visible,
          renderSource: matchLayer.renderSource,
          renderLayers: this._getRenderLayers(parts, id),
          themeSetting: matchLayer.themeSetting
        };
      }
      return formatItem;
    });
    return formatCatalogs;
  }

  _updateLayerVisible(catalogs) {
    for (const data of catalogs) {
      const list = this._collectChildrenKey([data], 'visible');
      data.visible = list.every(item => item);
    }
  }

  _collectChildrenKey(catalogs, key, list = []) {
    for (const data of catalogs) {
      if (data.type === 'group') {
        this._collectChildrenKey(data.children, list);
        continue;
      }
      list.push(data[key]);
    }
    return list;
  }

  _getRenderLayers(layerIds, layerId) {
    if (layerIds) {
      if (layerIds.includes(layerId)) {
        return layerIds;
      } else {
        return [layerId, ...layerIds];
      }
    } else {
      return [layerId];
    }
  }
}

module.exports = WebMapV3;

