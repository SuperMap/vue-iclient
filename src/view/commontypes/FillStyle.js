export default class FillStyle {
  constructor(paint = {}, layout = {}) {
    this.layout = {
      visibility: 'visible'
    };
    this.paint = {
      'fill-opacity': 1,
      'fill-color': '#000',
      'fill-translate': [0, 0],
      'fill-antialias': true,
      'fill-outline-color': '#000',
      'fill-translate-anchor': 'map'
    };
    Object.assign(this.paint, paint);
    Object.assign(this.layout, layout);
  }
}
