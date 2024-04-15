import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import WebMapViewModel from 'vue-iclient/src/mapboxgl/web-map/WebMapViewModel';

/**
 * @class LayerListViewModel
 * @description LayerList viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层更新
 * @extends mapboxgl.Evented
 */
interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}
class LayerListViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  webmap: InstanceType<typeof WebMapViewModel>;

  sourceList: Array<Object>;

  sourceNames: Array<string>;

  fire: any;

  updateFn: MapEventCallBack;

  constructor() {
    super();
    this.sourceList = [];
    this.sourceNames = [];
  }

  _updateLayers() {
    this.fire('layersUpdated');
  }

  setMap(mapInfo) {
    const { map, webmap } = mapInfo;
    this.map = map;
    this.webmap = webmap;
    this.updateFn = this._updateLayers.bind(this);
    this.map.on('styledata', this.updateFn);
  }

  initLayerList() {
    this.sourceList = this.webmap.getLayerList();
    return this.sourceList;
  }

  getSourceNames() {
    return this.sourceNames;
  }

  checkAttributesEnabled(item) {
    const source = this.map.getSource(item.layer.source);
    const hasDatasetId = this.webmap.getDatasetIdByLayerId(item.id);
    return source.type === 'geojson' || hasDatasetId;
  }

  async getLayerDatas(layerName) {
    const features = await this.webmap.getLayerDatas(layerName);
    return this.setDataset(features);
  }

  // 将features转换成属性表dataset所需的GeoJSONParameter形式
  setDataset(features) {
    let dataset = { type: 'geoJSON', geoJSON: null };
    if (features) {
      dataset.geoJSON = { type: 'FeatureCollection', features };
    }
    return dataset;
  }

  changeItemVisible(item) {
    this.webmap.changeItemVisible(item);
  }

  removed() {
    this.sourceList = [];
    this.sourceNames = [];
    this.map.off('styledata', this.updateFn);
  }
}
export default LayerListViewModel;
