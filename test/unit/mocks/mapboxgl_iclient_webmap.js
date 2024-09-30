var Evented = require('mapbox-gl/src/util/evented');
var { mapboxgl } = require('./mapboxgl');

class WebMap extends Evented {
  constructor(mapId, options, mapOptions) {
    super();
    this.mapId = mapId;
    this.options = options;
    this.mapOptions = mapOptions;
    this._mapResourceInfo = {};
    this._layerIdRenameMapList = [];
    this._layerCatalogsRenameMapList = [];
    this._appreciableLayersVisibleMap = new Map()
    this.eventTypes = [
      'mapcreatesucceeded',
      'mapcreatefailed',
      'crsnotsupport',
      'baidumapnotsupport',
      'projectionnotmatch',
      'mapbeforeremove',
      'mapinitialized',
      'layercreatefailed',
      'layerupdatechanged',
      'layeraddchanged'
    ];
    this._initWebMap();
    if (this.mapOptions) {
      this.mapOptions.transformRequest = jest.fn();
    }
  }
  _initWebMap() {
    this._createMap({
      layers: [
        {
          visible: true,
          children: [],
          id: '民航数据',
          title: '民航数据',
          renderSource: { type: 'geojson' },
          renderLayers: ['民航数据'],
          dataSource: { type: 'STRUCTURE_DATA' },
          type: 'line'
        }
      ]
    });
  }

  _getMapInfo(mapInfo) {
    const type = +mapInfo.version.split('.')[0] >= 3 ? 'WebMap3' : 'WebMap2';
    this._createMap(type, mapInfo);
  }

  _createMap(mapInfo = this.mapOptions) {
    this._mapInfo = mapInfo;
    let {
      name,
      crs,
      center = new mapboxgl.LngLat(0, 0),
      zoom = 4,
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
    this._mapInitializedHandler({ map: this.map });
    this._addLayerChangedHandler();
    this._addLayersSucceededHandler({ mapparams: mapOptions, layers: [] });
    // this.map.on('load', () => {
    //   this._initLayers();
    // });
  }
  _mapInitializedHandler({ map }) {
    this.map = map;
    Promise.resolve().then(() => {
      this.fire('mapinitialized', { map: this.map });
    });
  }
  _addLayersSucceededHandler({ mapparams, layers }) {
    this.mapParams = mapparams;

    setTimeout(() => {
      this.fire('mapcreatesucceeded', {
        map: this.map,
        mapparams: this.mapParams,
        layers: [
          {
            visible: true,
            children: [],
            id: '民航数据',
            title: '民航数据',
            renderSource: { type: 'geojson' },
            renderLayers: ['民航数据'],
            dataSource: { type: 'STRUCTURE_DATA' },
            type: 'line'
          }
        ],
        allLoaded: true,
        cacheLayerIds: ['民航数据']
      });
    }, 0);
  }
  _addLayerChangedHandler() {
    Promise.resolve().then(() => {
      this.fire('layeraddchanged', {
        layers: [
          {
            visible: true,
            children: [],
            id: '民航数据',
            title: '民航数据',
            renderSource: { type: 'geojson' },
            renderLayers: ['民航数据'],
            dataSource: { type: 'STRUCTURE_DATA' },
            type: 'line'
          }
        ],
        allLoaded: true,
        cacheLayerIds: ['民航数据']
      });
    });
  }
  _addLabelLayer() {}
  echartsLayerResize() {}
  updateOverlayLayer() {}
  setRasterTileSize() {}
  setBearing() {}
  setRenderWorldCopies() {}
  setServerUrl() {}
  setPitch() {}
  setStyle() {}
  setMapId() {}
  _updateRasterSource() {}
  setCRS() {}
  setCenter() {}
  setZoom() {}
  resize() {}
  setWithCredentials() {}
  setProxy() {}

  getLegends() {
    return [
      {
        visible: true,
        layerId: '民航数据',
        title: '民航数据',
        styleGroup: [{ style: { type: 'image', url: '' } }],
        type: 'line'
      }
    ];
  }
  cleanLayers() {}
  getLayers() {
    return [
      {
        visible: true,
        children: [],
        id: '民航数据',
        title: '民航数据',
        renderSource: { type: 'geojson' },
        renderLayers: [],
        dataSource: { type: 'STRUCTURE_DATA' },
        type: 'line'
      }
    ];
  }

  getLayerCatalog() {
    if (this.mapId === '123_v3') {
      return [
        {
          visible: true,
          children: [],
          id: '北京市轨道交通线路减',
          title: '北京市轨道交通线路减',
          renderLayers: [],
          renderSource: { type: 'geojson' },
          dataSource: { type: 'STRUCTURE_DATA' },
          type: 'composite'
        }
      ];
    }
    if (this.mapId === '123_layerlist') {
      return [
        {
          visible: true,
          children: [],
          id: '北京市轨道交通线路减',
          title: '北京市轨道交通线路减',
          renderLayers: [],
          renderSource: { type: 'geojson' },
          dataSource: { type: 'STRUCTURE_DATA' },
          type: 'composite'
        },
        {
          visible: true,
          children: [],
          id: '北京市轨道交通线路减',
          title: '北京市轨道交通线路减',
          renderLayers: [],
          renderSource: { type: 'geojson' },
          dataSource: { type: 'STRUCTURE_DATA' },
          type: 'group'
        }
      ];
    }
    return this._generateLayerCatalog();
  }

  toggleLayerVisible(id, visible) {
    const item = this._findLayerCatalog(this.getLayerCatalog(), id);
    if (!item) {
      return;
    }
    const visibility = visible ? 'visible' : 'none';
    if (item.type === 'group') {
      const visbleId = this._getLayerVisibleId(item);
      this._appreciableLayersVisibleMap.set(visbleId, visible);
      const targetLayers = this._getGroupChildrenLayers(item.children);
      this.setLayersVisible(targetLayers, visibility);
    } else {
      this.setLayersVisible([item], visibility);
    }
  }

  setLayersVisible(layers, visibility) {
    layers.forEach(layer => {
      const visbleId = this._getLayerVisibleId(layer);
      this._appreciableLayersVisibleMap.set(visbleId, visibility === 'visible');
      if (
        (layer.CLASS_INSTANCE?.show || layer.CLASS_INSTANCE?.hide)
      ) {
        visibility === 'visible' ? layer.CLASS_INSTANCE.show() : layer.CLASS_INSTANCE.hide();
        return;
      }
      layer.renderLayers.forEach((layerId) => {
        if (layer.CLASS_NAME !== 'L7Layer' || this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', visibility);
        }
      });
    });
    this.fire('layerupdatechanged', {
      relevantLayers: [
        {
          visible: true,
          children: [],
          id: '民航数据',
          title: '民航数据',
          renderSource: { type: 'geojson' },
          renderLayers: ['民航数据'],
          dataSource: { type: 'STRUCTURE_DATA' },
          type: 'line'
        }
      ]
    });
  }

  copyLayer() {}

  clean() {}

  _findLayerCatalog(catalogs, id) {
    let matchData;
    for (const data of catalogs) {
      if (data.id === id) {
        matchData = data;
        break;
      }
      if (data.type === 'group') {
        matchData = this._findLayerCatalog(data.children, id);
      }
    }
    return matchData;
  }

  _getLayerVisible(layer) {
    const id = this._getLayerVisibleId(layer);
    return this._appreciableLayersVisibleMap.has(id) ? this._appreciableLayersVisibleMap.get(id) : layer.visible;
  }

  _getLayerVisibleId(layer) {
    return `${layer.type}-${layer.id}`;
  }

  _initLayers() {
    if (this.map && this.map.getCRS && this.map.getCRS().epsgCode !== this._mapInfo.crs) {
      this.fire('projectionnotmatch');
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
      this.fire('layercreatefailed', {
        error:
          matchErrorLayer.metadata.typeFailure === 'string' ? 'happen error' : new TypeError('t.map is not a function'),
        map: this.map
      });
      return;
    }
    this._layerIdRenameMapList = layers.map(item => ({ renderId: item.id }));
    this._layerCatalogsRenameMapList = metadata.layerCatalog;
    const appreciableLayers = this.getLayers();
    const matchLayers = appreciableLayers.filter(item => layers.some(layer => layer.id === item.id));
    this.fire('mapcreatesucceeded', {
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
    const appreciableLayers = this.getLayers();
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

  _getGroupChildrenLayers(layerGroup) {
    const targetItems = [];
    for (const item of layerGroup) {
      if (item.type !== 'group') {
        targetItems.push(item);
        continue;
      }
      // 图层组
      const group = item;
      targetItems.push(...this._getGroupChildrenLayers(group.children));
    }
    return targetItems;
  }
}

module.exports = WebMap;
