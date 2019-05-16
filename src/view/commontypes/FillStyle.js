export default class FillStyle {
  constructor(options = {}) {
    this.layout = {
      'visibility': options['visibility'] || 'visible'
    };
    this.paint = {
      'fill-opacity': options['fill-opacity'] || 1,
      'fill-color': options['fill-color'] || '#000',
      'fill-translate': options['fill-translate'] || [0, 0],
      'fill-antialias': options['fill-antialias'] || true,
      'fill-outline-color': options['fill-outline-color'] || '#000',
      'fill-translate-anchor': options['fill-translate-anchor'] || 'map'
    };
  }
}
