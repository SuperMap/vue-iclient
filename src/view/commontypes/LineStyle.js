export default class LineStyle {
  constructor(options = {}) {
    this.layout = {
      'visibility': options['visibility'] || 'visible',
      'line-cap': options['line-cap'] || 'butt',
      'line-join': options['line-join'] || 'miter'
    };
    this.paint = {
      'line-opacity': options['line-opacity'] || 1,
      'line-color': options['line-color'] || '#000',
      'line-width': options['line-width'] || 1,
      'line-blur': options['line-blur'] || 1
    };
  }
}
