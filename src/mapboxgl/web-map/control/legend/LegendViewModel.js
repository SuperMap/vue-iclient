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
    this.legendInfo = this.webmap.getLegendInfo();
  }

  getStyle(layerName) {
    return this.legendInfo.filter((info) => {
      return info.layerId === layerName && info.styleGroup.length > 0;
    });
  }
}
export default LegendViewModel;
