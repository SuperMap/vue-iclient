export default class HeatMapStyle {
  constructor(options = {}) {
    this.paint = {
      'visibility': options['visibility'] || 'visible'
    };
    this.layout = {
      'heatmap-radius': options['heatmap-radius'] || 30,
      'heatmap-weight': options['heatmap-weight'] || 1,
      'heatmap-intensity': options['heatmap-intensity'] || 1,
      'heatmap-color': options['heatmap-color'] || ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0, 0, 255, 0)', 0.1, 'royalblue', 0.3, 'cyan', 0.5, 'lime', 0.7, 'yellow', 1, 'red'],
      'heatmap-opacity': options['heatmap-opacity'] || 1
    };
  }
}
