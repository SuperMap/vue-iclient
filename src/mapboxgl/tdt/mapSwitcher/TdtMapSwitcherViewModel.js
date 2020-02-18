import mapboxgl from '../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import { geti18n } from '../../../common/_lang';

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
  }
  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }
  changeBaseLayer(type) {
    if (this.map) {
      this.removeLayer();
      const mapCrs = this.map.getCRS();
      this.proj = mapCrs.epsgCode === 'EPSG:3857' ? 'w' : 'c';
      const sources = this.getSources(type);
      Object.keys(sources).forEach(sourceId => {
        this.map.addSource(sourceId, sources[sourceId]);
      });
      const layers = this.getLayers(type);
      const styles = this.map.getStyle();
      const firstLayerId = styles.layers.length ? this.map.getStyle().layers[0].id : '';
      layers.forEach(layer => {
        this.map.addLayer(layer, firstLayerId);
      });
    }
  }
  togglerLabelLayer(isChecked) {
    const visible = isChecked ? 'visible' : 'none';
    const labelLayer = this.map && this.map.getLayer(geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`));
    labelLayer &&
      this.map.setLayoutProperty(geti18n().tc(`tdtMapSwitcher.Tianditu${this.tdtLabelType}`), 'visibility', visible);
  }
  removeLayer() {
    const sourceList = this.map.getStyle().sources;
    const layerList = this.map.getStyle().layers;
    layerList.forEach(layer => {
      if (layer.type === 'raster') {
        this.map.removeLayer(layer.id);
      }
    });
    Object.keys(sourceList).forEach(sourceId => {
      if (sourceList[sourceId].type === 'raster') {
        this.map.removeSource(sourceId);
      }
    });
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
}
