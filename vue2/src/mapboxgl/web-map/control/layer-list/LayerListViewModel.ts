import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';
import WebMapViewModel from 'vue-iclient/src/mapboxgl/web-map/WebMapViewModel';
import { findLayerCatalog } from '../../GroupUtil';

/**
 * @class LayerListViewModel
 * @description LayerList viewModel.
 * @param {Object} map - map实例对象。
 * @fires layersUpdated - 图层更新
 * @extends mapboxgl.Evented
 */
class LayerListViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  webmap: InstanceType<typeof WebMapViewModel>;

  sourceList: Array<Object>;

  fire: any;

  updateFn: (e?: mapboxglTypes.MapMouseEvent) => void;

  _updateLayers() {
    this.fire('layersUpdated');
  }

  setMap(mapInfo) {
    const { webmap } = mapInfo;
    this.webmap = webmap;
    this.updateFn = this._updateLayers.bind(this);
    this.webmap.on({
      layerupdatechanged: this.updateFn
    });
  }

  initLayerList() {
    this.sourceList = this.webmap.getLayerList();
    return this.sourceList;
  }

  async getLayerDatas(item) {
    const features = await this.webmap.getLayerDatas(item);
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

  changeItemVisible(id: string, visible: boolean) {
    const matchLayer = findLayerCatalog(this.sourceList, id);
    this.webmap.changeItemVisible(matchLayer, visible);
  }

  setLayersOrder() {
    const layers = this.webmap.getAppreciableLayers();
    this.webmap.rectifyLayersOrder(layers);
  }

  changeOpacity(id: string, opacity: number) {
    this.webmap.changeItemOpacity(id, opacity);
  }

  zoomToBounds(id: string) {
    this.webmap.zoomToBounds(id);
  }

  getLayerOpacityById(id: string) {
    return this.webmap.getLayerOpacityById(id);
  }

  removed() {
    this.webmap.un({
      layerupdatechanged: this.updateFn
    });
  }
}
export default LayerListViewModel;
