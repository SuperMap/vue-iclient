export default class LineStyle {
  constructor(paint = {}, layout = {}) {
    this.layout = {
      visibility: 'visible',
      'line-cap': 'butt',
      'line-join': 'miter'
    };
    this.paint = {
      'line-opacity': 1,
      'line-color': '#000',
      'line-width': 1,
      'line-blur': 1
    };
    Object.assign(this.paint, paint);
    Object.assign(this.layout, layout);
  }
}
