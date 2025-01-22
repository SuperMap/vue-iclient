import mapboxgl from 'vue-iclient-static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends mapboxgl.Evented
 */
class LegendViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this._layersUpdatedHandler = this._layersUpdatedHandler.bind(this);
  }

  setMap({ webmap }) {
    this.webmap = webmap;
    this.webmap.on({
      layerupdatechanged: this._layersUpdatedHandler
    });
  }

  getStyle(layerName) {
    const appreciableLayers = this.webmap?.getAppreciableLayers() || [];
    const legendInfo = this.webmap?.getLegendInfo() || [];
    return legendInfo.filter(info => {
      return (
        info.layerId === layerName &&
        info.styleGroup.length > 0 &&
        appreciableLayers.some(layer => layer.id === info.layerId && layer.visible)
      );
    });
  }

  removed() {
    this.webmap.un({
      layerupdatechanged: this._layersUpdatedHandler
    });
  }

  _layersUpdatedHandler() {
    this.fire('layersupdated');
  }
}
export default LegendViewModel;
