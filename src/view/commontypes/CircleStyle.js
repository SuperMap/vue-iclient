export default class CircleStyle {
  constructor(paint = {}, layout = {}) {
    this.layout = {
      visibility: 'visible'
    };
    this.paint = {
      'circle-radius': 5,
      'circle-color': '#000',
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
