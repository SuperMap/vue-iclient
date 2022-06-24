class SourceModel {
  constructor(options) {
    this.id = options.source;
    this.sourceLayerList = {};
    this.layers = [];
    this.type = options.type;
  }

  addLayer(layer, sourceLayer) {
    if (sourceLayer) {
      if (!this.sourceLayerList[sourceLayer]) {
        this.sourceLayerList[sourceLayer] = [];
      }
      this.sourceLayerList[sourceLayer].push(layer);
    } else {
      this.sourceLayerList = undefined;
    }
    this.layers.push(layer);
    if ([layer.visibility, this.visibility].includes('visible')) {
      this.visibility = 'visible';
    } else {
      this.visibility = 'none';
    }
  }
}

export default SourceModel;
