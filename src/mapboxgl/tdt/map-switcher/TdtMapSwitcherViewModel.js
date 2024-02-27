import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import { geti18n } from 'vue-iclient/src/common/_lang/index';

const tileUrlTemplate =
  'https://t{s}.tianditu.gov.cn/{type}_{proj}/wmts?tk={tk}&service=WMTS&request=GetTile&version=1.0.0&style=default&tilematrixSet={proj}&format=tiles&width=256&height=256&layer={type}&tilematrix={z}&tilerow={y}&tilecol={x}';

const LABELLIST = {
  vec: 'cva',
  img: 'cia',
  ter: 'cta'
};

export default class TdtMapSwitcherViewModel extends mapboxgl.Evented {
  constructor(tk) {
    super();
    this.tk = tk;
    this.proj = 'w';
    this.originMapData = null;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  setTk(tk) {
    this.tk = tk;
  }

  changeBaseLayer(type) {
    if (this.map) {
      const mapCrs = this.map.getCRS();
      this.proj = mapCrs.epsgCode === 'EPSG:3857' ? 'w' : 'c';
      const sources = this.getSources(type);
      const layers = this.getLayers(type);
      this.addLayer(sources, layers);
    }
  }

  togglerLabelLayer(isChecked) {
    const visible = isChecked ? 'visible' : 'none';
    const labelLayer = this.map && this.map.getLayer(geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`));
    labelLayer &&
      this.map.setLayoutProperty(geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`), 'visibility', visible);
  }

  addLayer(sources, layers, fromTdt = true) {
    this.removeLayer();
    Object.keys(sources).forEach(sourceId => {
      this.map.addSource(sourceId, sources[sourceId]);
    });
    let beforeLayerId;
    if (fromTdt) {
      const styles = this.map.getStyle();
      beforeLayerId = styles.layers[0] && styles.layers[0].id;
    }
    layers.forEach(layer => {
      let layerToAdd = Object.assign({}, layer);
      if (!fromTdt) {
        beforeLayerId = layer.beforeLayerId;
        delete layerToAdd.beforeLayerId;
      }
      this.map.addLayer(layerToAdd, beforeLayerId);
    });
  }

  removeLayer() {
    const sourceList = this.map.getStyle().sources;
    const layerList = this.map.getStyle().layers;
    const originLayers = [];
    const originSources = {};
    layerList.forEach((layer, index) => {
      if (layer.type === 'raster') {
        originLayers.push({
          ...layer,
          beforeLayerId: (layerList[index + 1] || {}).id
        });
        this.map.removeLayer(layer.id);
      }
    });
    Object.keys(sourceList).forEach(sourceId => {
      if (sourceList[sourceId].type === 'raster') {
        originSources[sourceId] = sourceList[sourceId];
        this.map.removeSource(sourceId);
      }
    });
    if (!this.originMapData) {
      this.originMapData = Object.assign({}, { layers: originLayers, sources: originSources });
    }
  }

  getLayers(type) {
    type = type.replace(type[0], type[0].toUpperCase());
    return [
      {
        id: geti18n().tc(`tdtMapSwitcher.Tianditu${type}`),
        type: 'raster',
        source: geti18n().tc(`tdtMapSwitcher.Tianditu${type}`),
        minzoom: 0,
        maxzoom: 18
      },
      {
        id: geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`),
        type: 'raster',
        source: geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`),
        minzoom: 0,
        maxzoom: 18
      }
    ];
  }

  getSources(type) {
    const tdtType = type.replace(type[0], type[0].toUpperCase());
    const sources = {};
    sources[geti18n().tc(`tdtMapSwitcher.Tianditu${tdtType}`)] = {
      type: 'raster',
      tiles: this.listUrls(type),
      tileSize: 256
    };
    let tdtLabeltype = LABELLIST[type];
    this.tdtLabelType = tdtLabeltype.replace(tdtLabeltype[0], tdtLabeltype[0].toUpperCase());
    sources[geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`)] = {
      type: 'raster',
      tiles: this.listUrls(LABELLIST[type]),
      tileSize: 256
    };
    return sources;
  }

  listUrls(type) {
    const urls = [];
    if (type) {
      for (let index = 0; index < 8; index++) {
        urls.push(
          tileUrlTemplate
            .replace('{tk}', this.tk)
            .replace('{s}', index)
            .replace(/{proj}/g, this.proj)
            .replace(/{type}/g, type)
        );
      }
    }
    return urls;
  }

  resetMapData() {
    if (this.originMapData) {
      const { layers, sources } = this.originMapData;
      this.addLayer(sources, layers, false);
      this.originMapData = null;
    }
  }

  removed() {
    this.resetMapData();
    this.map = null;
  }
}
