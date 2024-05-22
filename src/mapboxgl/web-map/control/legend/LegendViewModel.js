import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @extends mapboxgl.Evented
 */
class LegendViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this.legendInfo = [];
    this._layersUpdatedHandler = this._layersUpdatedHandler.bind(this);
  }

  setMap({ webmap }) {
    this.webmap = webmap;
    this.legendInfo = this.webmap.getLegendInfo();
    this.webmap.on({
      layersupdated: this._layersUpdatedHandler
    });
  }

  getStyle(layerName) {
    const appreciableLayers = this.webmap.getAppreciableLayers();
    return this.legendInfo.filter(info => {
      return (
        info.layerId === layerName &&
        info.styleGroup.length > 0 &&
        appreciableLayers.some(layer => layer.id === info.layerId && layer.visible)
      );
    });
  }

  removed() {
    this.webmap.un({
      layersupdated: this._layersUpdatedHandler
    });
  }

  _layersUpdatedHandler() {
    this.fire('layersupdated');
  }
}
export default LegendViewModel;

