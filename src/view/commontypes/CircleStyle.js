/**
 * @class CircleStyle
 * @category BaseTypes Style
 * @classdesc 点图层样式类。
 * @param {mapboxgl.LayersCircle} paint - MapboxGL 点图层 Paint 配置。
 * @param {mapboxgl.LayersCircle} layout - MapboxGL 点图层 Layout 配置。
 */
export default class CircleStyle {
  constructor(paint = {}, layout = {}) {
    this.layout = {
      visibility: 'visible'
    };
    this.paint = {
      'circle-radius': 6,
      'circle-color': '#3fb1e3',
      'circle-opacity': 1,
      'circle-blur': 0,
      'circle-translate': [0, 0],
      'circle-translate-anchor': 'map',
      'circle-pitch-scale': 'map',
      'circle-pitch-alignment': 'viewport',
      'circle-stroke-width': 0,
      'circle-stroke-color': '#000',
      'circle-stroke-opacity': 1
    };
    Object.assign(this.paint, paint);
    Object.assign(this.layout, layout);
  }
}
