export default class HeatMapStyle {
  constructor(paint = {}, layout = {}) {
    this.paint = {
      'heatmap-radius': 30,
      'heatmap-weight': 1,
      'heatmap-intensity': 1,
      'heatmap-color': [ 'interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0, 0, 255, 0)', 0.1, 'royalblue', 0.3, 'cyan', 0.5, 'lime', 0.7, 'yellow', 1, 'red' ],
      'heatmap-opacity': 1
    };
    this.layout = {
      visibility: 'visible'
    };
    Object.assign(this.paint, paint);
    Object.assign(this.layout, layout);
  }
}
