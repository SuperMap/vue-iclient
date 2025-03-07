import type { SymbolLayout, SymbolPaint } from 'mapbox-gl';

/**
 * @class SymbolStyle
 * @classdesc symbol 图层样式类。
 */
export default class SymbolStyle {
  layout: SymbolLayout;
  paint: SymbolPaint;

  constructor(paint: Partial<SymbolPaint> = {}, layout: Partial<SymbolLayout> = {}) {
    this.paint = Object.assign({}, paint);
    this.layout = Object.assign(
      {
        visibility: 'visible'
      },
      layout
    );
  }
}
