import WidgetViewModel from './WidgetViewModel';
/**
 * @class HeatMapLayerViewModel
 * @param {mapboxgl.map} map - mapboxgl map 对象。
 * @param {String} data - 热力图数据。
 * @param {String} paint - mapboxgl paint 对象。
 * @param {Object} options - 可选参数。
 * @param {Object} [options.layerId] - 图层名。
 */

export default class HeatMapLayerViewModel extends WidgetViewModel {
  constructor(map, data, options) {
    super();

    if (!map) {
      throw new Error('map is requierd');
    }
    options = options || {};
    this.map = map;
    this.data = data;
    this.layerId = options.layerId || 'heatmap' + new Date().getTime();
    let heatMapStyle = options.heatMapStyle;
    this.paint = heatMapStyle && heatMapStyle.paint;
    this.layout = heatMapStyle && heatMapStyle.layout;
    this._initializeHeatMapLayer();
  }

  _initializeHeatMapLayer() {
    this.map.addSource(this.layerId, {
      type: 'geojson',
      data: this.data
    });

    this.map.addLayer({
      id: this.layerId,
      type: 'heatmap',
      source: this.layerId,
      maxzoom: 9,
      paint: this.paint || {
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(33,102,172,0)',
          0.2,
          'rgb(103,169,207)',
          0.4,
          'rgb(209,229,240)',
          0.6,
          'rgb(253,219,199)',
          0.8,
          'rgb(239,138,98)',
          1,
          'rgb(178,24,43)'
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
      },
      layout: this.layout || {}
    });

    this.fire('heatmaplayeraddsucceeded', { map: this.map });
  }
}
