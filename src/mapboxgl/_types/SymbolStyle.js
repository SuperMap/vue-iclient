/**
 * @class SymbolStyle
 * @classdesc symbol 图层样式类。
 */
export default class SymbolStyle {
  constructor(paint = {}, layout = {}) {
    this.paint = Object.assign({}, paint);
    this.layout = Object.assign(
      {
        visibility: 'visible'
      },
      layout
    );
  }
}
