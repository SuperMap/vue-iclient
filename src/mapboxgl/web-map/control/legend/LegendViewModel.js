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
    this._layersUpdatedHandler = this._layersUpdatedHandler.bind(this);
  }

  setMap({ webmap }) {
    this.webmap = webmap;
    this.webmap.on({
      layerupdatechanged: this._layersUpdatedHandler
    });
  }

  getStyle(layerName, webMapViewModel = this.webmap) {
    const appreciableLayers = webMapViewModel?.getAppreciableLayers() || [];
    const legendInfo = webMapViewModel?.getLegendInfo() || [];
    return legendInfo.filter(info => {
      return (
        info.layerId === layerName &&
        info.styleGroup.length > 0 &&
        appreciableLayers.some(layer => layer.id === info.layerId && layer.visible)
      );
    });
  }

  getLayerNamesFromWebmap(webMapViewModel = this.webmap) {
    const legendInfos = webMapViewModel?.getLegendInfos?.() || [];
    return legendInfos.filter(item => item.showLegend).map(info => info.id);
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
