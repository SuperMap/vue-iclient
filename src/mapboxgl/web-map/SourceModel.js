class SourceModel {
  constructor(options) {
    this.dataSource = options.dataSource;
    this.id = options.renderSource.id;
    this.title = options.renderSource.id;
    this.renderSource = options.renderSource;
    this.renderLayers = [];
    this.type = options.type;
    this.themeSetting = options.themeSetting;
    this.visible = options.visible;
  }

  addLayer(layer) {
    if (layer.renderSource.sourceLayer) {
      if (!this.children) {
        this.children = [];
        this.type = 'group';
        this.renderSource.sourceLayer = undefined;
      }
      this.children.push(layer);
    }
    this.renderLayers.push(...layer.renderLayers);
  }
}

export default SourceModel;
