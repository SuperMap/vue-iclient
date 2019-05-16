export default class CircleStyle {
  constructor(options = {}) {
    this.layout = {
      'visibility': options['visibility'] || 'visible'
    };
    this.paint = {
      'circle-radius': options['circle-radius'] || 5,
      'circle-color': options['circle-color'] || '#000',
      'circle-opacity': options['circle-opacity'] || 1,
      'circle-blur': options['circle-blur'] || 0,
      'circle-translate': options['circle-translate'] || [0, 0],
      'circle-translate-anchor': options['circle-translate-anchor'] || 'map',
      'circle-pitch-scale': options['circle-pitch-scale'] || 'map',
      'circle-pitch-alignment': options['circle-pitch-alignment'] || 'viewport',
      'circle-stroke-width': options['circle-stroke-width'] || 0,
      'circle-stroke-color': options['circle-stroke-color'] || '#000',
      'circle-stroke-opacity': options['circle-stroke-opacity'] || 1
    };
  }
}
