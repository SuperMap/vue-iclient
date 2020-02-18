import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import echarts from 'echarts';
import EchartsLayer from '../../../../../static/libs/echarts-layer/EchartsLayer';
/**
 * @class EchatsLayerViewModel
 * @param {mapboxgl.map} map - mapboxgl map 对象。
 * @param {String} options - EchartsLayer options。
 */

export default class EchatsLayerViewModel extends mapboxgl.Evented {
  constructor(options) {
    super();
    if (!options) {
      throw new Error('echarts options is requierd');
    }
    this.options = options;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this._initializeEchartsLayer();
  }

  setOptions(options) {
    this.options = options;
    this.removed();
    this._initializeEchartsLayer();
  }

  _initializeEchartsLayer() {
    window.echarts = echarts;
    let echartslayer = new EchartsLayer(this.map);
    echartslayer.chart.setOption(this.options);
    /**
     * @event echartslayeraddsucceeded
     * @property {Object} layer  - Echarts Layer.
     */
    this.fire('echartslayeraddsucceeded', { layer: echartslayer });
    this.echartslayer = echartslayer;
  }

  removed() {
    this.echartslayer && this.echartslayer.remove();
  }
}
