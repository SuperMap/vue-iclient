import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends mapboxgl.Evented
 */
class LegendViewModel extends mapboxgl.Evented {
  constructor(webmap) {
    super(webmap);
    this.webmap = webmap;
    this.sourceListModel = this.webmap ? this.webmap.getSourceListModel : {};
  }

  getStyle(layerName) {
    return this.sourceListModel && this.sourceListModel.getLegendStyle(layerName);
  }
}
export default LegendViewModel;
