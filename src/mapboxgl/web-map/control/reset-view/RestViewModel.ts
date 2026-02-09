import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class ResetViewModel
 * @description reset viewModel（重置地图位置控件vm层）.
 * @param {Object} map - 地图对象。
 * @extends mapboxgl.Evented
 */

type MapData = {
  mapOptions: Partial<mapboxglTypes.MapboxOptions>;
}

export default class ResetViewModel extends mapboxgl.Evented {
  mapOptions: MapData['mapOptions'] | null;
  map: mapboxglTypes.Map | null;

  setMap({ mapData, map }: { mapData: MapData; map: mapboxglTypes.Map }) {
    this.map = map;
    this.mapOptions = mapData.mapOptions;
  }

  /**
   * @function ResetViewModel.prototype.resetView
   * @description 重置地图的中心点、缩放级别、旋转角度和俯仰角为初始值。
   */
  resetView(duration = 1000) {
    if (this.map) {
      const { center, zoom, bearing, pitch } = this.mapOptions || {};
      this.map.flyTo({
        center,
        zoom,
        bearing,
        pitch,
        duration
      });
    }
  }

  removed() {
    this.map = null;
    this.mapOptions = null;
  }
}
