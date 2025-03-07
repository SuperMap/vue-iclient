import type { FillLayout, FillPaint } from 'mapbox-gl';

/**
 * @class FillStyle
 * @category BaseTypes Style
 * @classdesc 面图层样式类。
 * @param {mapboxgl.LayersFill} paint - MapboxGL 面图层 Paint 配置。
 * @param {mapboxgl.LayersFill} layout - MapboxGL 面图层 Layout 配置。
 */
export default class FillStyle {
  layout: FillLayout;
  paint: FillPaint;
  
  constructor(paint: Partial<FillPaint> = {}, layout: Partial<FillLayout> = {}) {
    this.layout = {
      visibility: 'visible'
    };
    this.paint = {
      'fill-opacity': 0.8,
      'fill-color': '#3fb1e3',
      'fill-translate': [0, 0],
      'fill-antialias': true,
      'fill-outline-color': '#3fb1e3',
      'fill-translate-anchor': 'map'
    };
    Object.assign(this.paint, paint);
    Object.assign(this.layout, layout);
  }
}
