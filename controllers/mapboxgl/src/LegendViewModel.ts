import type mapboxglTypes from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';
import WebMapViewModel from 'vue-iclient-controllers-mapboxgl/src/WebMapViewModel';

/**
 * @class LegendViewModel
 * @description Legend viewModel.
 * @param {Object} webmap - webmap实例对象。
 * @fires layersupdated - 图例信息更新
 * @extends mapboxgl.Evented
 */
class LegendViewModel extends mapboxgl.Evented {
  webmap: InstanceType<typeof WebMapViewModel>;
  updateFn: (e?: mapboxglTypes.MapMouseEvent) => void;

  _layersUpdatedHandler() {
    this.fire('layersupdated');
  }

  setMap(mapInfo) {
    const { webmap } = mapInfo;
    this.webmap = webmap;
    this.updateFn = this._layersUpdatedHandler.bind(this);
    this.webmap.on({
      layerupdatechanged: this.updateFn
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
    // 底层 iClient 需 >= 12.1.1 才提供 getLegendInfos，低版本时降级为空数组
    const legendInfos = webMapViewModel?.getLegendInfos?.() || [];
    return legendInfos.filter(item => item.showLegend).map(info => info.id);
  }

  removed() {
    this.webmap.un({
      layerupdatechanged: this.updateFn
    });
  }
}
export default LegendViewModel;
