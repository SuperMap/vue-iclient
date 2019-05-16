import WidgetViewModel from './WidgetViewModel';
import echarts from 'echarts';
import EchartsLayer from '../../static/libs/echarts-layer/EchartsLayer';
/**
 * @class EchatsLayerViewModel
 * @param {mapboxgl.map} map - mapboxgl map 对象。
 * @param {String} echartsOptions - EchartsLayer options。
 */

export default class EchatsLayerViewModel extends WidgetViewModel {
  constructor(map, echartsOptions) {
    super();
    if (!echartsOptions) {
      throw new Error('echartsOptions is requierd');
    }
    if (!map) {
      throw new Error('map is requierd');
    }
    this.map = map;
    this.echartsOptions = echartsOptions;
    this._initializeEchartsLayer();
  }

  _initializeEchartsLayer() {
    window.echarts = echarts;
    let echartslayer = new EchartsLayer(this.map);
    echartslayer.chart.setOption(this.echartsOptions);
    /**
     * @event echartslayeraddsucceeded
     * @property {Object} layer  - Echarts Layer.
     */
    this.fire('echartslayeraddsucceeded', { layer: echartslayer });
    this.echartslayer = echartslayer;
  }
}
