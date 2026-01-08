import type { LineLayout, LinePaint } from 'mapbox-gl';

/**
 * @class LineStyle
 * @category BaseTypes Style
 * @classdesc 线图层样式类。
 * @param {mapboxgl.LayersLine} paint - MapboxGL 线图层 Paint 配置。
 * @param {mapboxgl.LayersLine} layout - MapboxGL 线图层 Layout 配置。
 */
export default class LineStyle {
  layout: LineLayout;
  paint: LinePaint;

  constructor(paint: Partial<LinePaint> = {}, layout: Partial<LineLayout> = {}) {
    this.layout = {
      visibility: 'visible',
      'line-cap': 'butt',
      'line-join': 'miter'
    };
    this.paint = {
      'line-opacity': 1,
      'line-color': '#3fb1e3',
      'line-width': 3,
      'line-blur': 1
    };
    Object.assign(this.paint, paint);
    Object.assign(this.layout, layout);
  }
}
